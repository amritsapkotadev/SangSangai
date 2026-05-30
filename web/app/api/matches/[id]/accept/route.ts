import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { sendPushNotification } from "@/lib/firebase";

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

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        guideTrip: {
          include: { guide: { select: { name: true } } },
        },
        trekkerTrip: {
          include: { trekker: { select: { name: true } } },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    if (match.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Match is not pending" },
        { status: 400 }
      );
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    await prisma.notificationLog.create({
      data: {
        matchId: id,
        type: "MATCH_ACCEPTED",
        title: "Match Accepted!",
        body: `${match.guideTrip.guide.name} and ${match.trekkerTrip.trekker?.name ?? "your partner"} are now matched.`,
        success: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Accept match error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
