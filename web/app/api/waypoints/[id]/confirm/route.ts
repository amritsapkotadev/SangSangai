import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { sendPushNotification } from "@/lib/firebase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { id: waypointId } = await params;
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: "matchId is required" },
        { status: 400 }
      );
    }

    const progress = await prisma.waypointProgress.findUnique({
      where: { matchId_waypointId: { matchId, waypointId } },
      include: {
        match: {
          include: {
            guideTrip: {
              include: {
                guide: { select: { name: true } },
                route: { select: { name: true } },
              },
            },
          },
        },
        waypoint: { select: { name: true, order: true } },
      },
    });

    if (!progress) {
      return NextResponse.json(
        { success: false, error: "Waypoint progress not found" },
        { status: 404 }
      );
    }

    if (progress.confirmedAt) {
      return NextResponse.json(
        { success: false, error: "Waypoint already confirmed" },
        { status: 400 }
      );
    }

    const updated = await prisma.waypointProgress.update({
      where: { id: progress.id },
      data: { confirmedAt: new Date() },
    });

    await prisma.notificationLog.create({
      data: {
        matchId,
        type: "WAYPOINT_CONFIRMED",
        title: "Waypoint Reached!",
        body: `${progress.waypoint.name} confirmed on ${progress.match.guideTrip.route.name}.`,
        success: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Confirm waypoint error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
