import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { guideTripId, trekkerTripId } = await request.json();

    if (!guideTripId || !trekkerTripId) {
      return NextResponse.json(
        { success: false, error: "Both guideTripId and trekkerTripId are required" },
        { status: 400 }
      );
    }

    const guideTrip = await prisma.trip.findUnique({
      where: { id: guideTripId },
      include: { route: { include: { waypoints: { orderBy: { order: "asc" } } } } },
    });

    const trekkerTrip = await prisma.trip.findUnique({
      where: { id: trekkerTripId },
    });

    if (!guideTrip || !trekkerTrip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    const existingMatch = await prisma.match.findFirst({
      where: {
        guideTripId,
        trekkerTripId,
        status: { in: ["PENDING", "ACCEPTED", "DEPARTED"] },
      },
    });

    if (existingMatch) {
      return NextResponse.json(
        { success: false, error: "Match already exists between these trips" },
        { status: 409 }
      );
    }

    const match = await prisma.match.create({
      data: { guideTripId, trekkerTripId },
    });

    const waypointData = guideTrip.route.waypoints.map((wp) => ({
      matchId: match.id,
      waypointId: wp.id,
    }));

    await prisma.waypointProgress.createMany({ data: waypointData });

    await prisma.trip.update({
      where: { id: guideTripId },
      data: { status: "MATCHED" },
    });

    await prisma.trip.update({
      where: { id: trekkerTripId },
      data: { status: "MATCHED", trekkerId: auth.data!.sub },
    });

    const fullMatch = await prisma.match.findUnique({
      where: { id: match.id },
      include: {
        guideTrip: {
          include: {
            guide: { select: { name: true } },
            route: { select: { name: true, region: true } },
          },
        },
        trekkerTrip: {
          include: { trekker: { select: { name: true } } },
        },
        waypointProgresses: {
          include: { waypoint: { select: { name: true, order: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: fullMatch }, { status: 201 });
  } catch (error) {
    console.error("Create match error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { guideTrip: { guideId: auth.data!.sub } },
          { trekkerTrip: { trekkerId: auth.data!.sub } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        guideTrip: {
          include: {
            guide: { select: { id: true, name: true, avatarUrl: true } },
            route: { select: { name: true, region: true } },
          },
        },
        trekkerTrip: {
          include: {
            trekker: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        waypointProgresses: {
          include: { waypoint: { select: { name: true, order: true, estimatedHours: true } } },
          orderBy: { waypoint: { order: "asc" } },
        },
      },
    });

    return NextResponse.json({ success: true, data: matches });
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
