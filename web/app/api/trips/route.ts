import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { routeId, startDate, endDate } = await request.json();

    if (!routeId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: { waypoints: { orderBy: { order: "asc" } } },
    });

    if (!route) {
      return NextResponse.json(
        { success: false, error: "Route not found" },
        { status: 404 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        guideId: auth.data!.sub,
        routeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "OPEN",
      },
      include: {
        guide: {
          select: { id: true, name: true, avatarUrl: true, nationality: true },
        },
        route: {
          include: { waypoints: { orderBy: { order: "asc" } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: trip }, { status: 201 });
  } catch (error) {
    console.error("Create trip error:", error);
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
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") || "OPEN";

    const where: Record<string, unknown> = { status };

    if (region) {
      where.route = { region: { contains: region, mode: "insensitive" } };
    }
    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        guide: {
          select: { id: true, name: true, avatarUrl: true, nationality: true },
        },
        route: {
          include: { waypoints: { orderBy: { order: "asc" } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: trips });
  } catch (error) {
    console.error("Get trips error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
