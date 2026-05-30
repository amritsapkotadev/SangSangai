import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mintPoints } from "@/lib/sangpoints";
import { sendPushNotification } from "@/lib/firebase";

const SANGPOINTS_REWARD = 200;

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
          include: {
            guide: { select: { id: true, name: true, walletAddress: true } },
          },
        },
        trekkerTrip: {
          include: {
            trekker: { select: { id: true, name: true, walletAddress: true, role: true } },
          },
        },
        waypointProgresses: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    if (match.status !== "DEPARTED") {
      return NextResponse.json(
        { success: false, error: "Trip must be in progress first" },
        { status: 400 }
      );
    }

    const allConfirmed = match.waypointProgresses.every((wp) => wp.confirmedAt);
    if (!allConfirmed) {
      return NextResponse.json(
        { success: false, error: "Not all waypoints are confirmed" },
        { status: 400 }
      );
    }

    const walletAddress = match.guideTrip.guide.walletAddress;
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Guide has no wallet address" },
        { status: 400 }
      );
    }

    let txHash: string | null = null;
    try {
      txHash = await mintPoints(walletAddress, SANGPOINTS_REWARD);
    } catch (blockchainError) {
      console.error("Blockchain minting failed, continuing:", blockchainError);
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await prisma.trip.updateMany({
      where: { id: { in: [match.guideTripId, match.trekkerTripId] } },
      data: { status: "COMPLETED" },
    });

    await prisma.sangPointsLedger.create({
      data: {
        matchId: id,
        walletAddress,
        amount: SANGPOINTS_REWARD,
        type: "MINT",
        txHash,
      },
    });

    let trekkerTxHash: string | null = null;
    const trekker = match.trekkerTrip.trekker;
    if (trekker?.role === "NEPALI" && trekker.walletAddress) {
      try {
        trekkerTxHash = await mintPoints(trekker.walletAddress, SANGPOINTS_REWARD);
      } catch (blockchainError) {
        console.error("Blockchain minting for trekker failed, continuing:", blockchainError);
      }

      await prisma.sangPointsLedger.create({
        data: {
          matchId: id,
          walletAddress: trekker.walletAddress,
          amount: SANGPOINTS_REWARD,
          type: "MINT",
          txHash: trekkerTxHash,
        },
      });
    }

    await prisma.notificationLog.create({
      data: {
        matchId: id,
        type: "TRIP_COMPLETED",
        title: `Trip Complete — ${SANGPOINTS_REWARD} SP Earned!`,
        body: `Safely completed! ${SANGPOINTS_REWARD} SangPoints minted to ${walletAddress.slice(0, 6)}...`,
        success: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        match: updated,
        sangPointsMinted: SANGPOINTS_REWARD,
        transactionHash: txHash,
      },
    });
  } catch (error) {
    console.error("Complete match error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
