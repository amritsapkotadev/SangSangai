import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    if (match.status !== "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Match must be accepted first" },
        { status: 400 }
      );
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        status: "DEPARTED",
        departedAt: new Date(),
      },
    });

    await prisma.trip.updateMany({
      where: { id: { in: [match.guideTripId, match.trekkerTripId] } },
      data: { status: "IN_PROGRESS" },
    });

    await prisma.notificationLog.create({
      data: {
        matchId: id,
        type: "DEPARTURE_CONFIRMED",
        title: "Departure Confirmed",
        body: "Both parties have confirmed departure. Trek is now in progress.",
        success: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Depart match error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
