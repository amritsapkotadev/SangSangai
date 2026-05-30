import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mintPoints } from "@/lib/sangpoints";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // 1. In a real app, we verify the JWT here to ensure the Guide is calling this.
    // const user = await verifyAuth(request);

    // 2. We mock the Database check if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      console.warn("⚠️ [API] DATABASE_URL missing. Proceeding with mock trip completion.");
      
      // Simulate blockchain minting for hackathon UI flow (using Aarav's demo wallet)
      const txHash = await mintPoints("0xeC5eA63092348C7B473678F2F41875963527a895", 200);
      
      return NextResponse.json({
        success: true,
        message: "Trip completed successfully (Mock DB).",
        txHash,
        sangPointsEarned: 200,
      });
    }

    // --- Real Database Logic ---
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { guide: true, trip: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "DEPARTED") {
      return NextResponse.json({ error: "Trip must be DEPARTED to complete." }, { status: 400 });
    }

    // 3. Mark match and trip as COMPLETED
    await prisma.$transaction([
      prisma.match.update({
        where: { id: matchId },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
      prisma.trip.update({
        where: { id: match.tripId },
        data: { status: "COMPLETED" },
      }),
    ]);

    // 4. Blockchain Integration: Mint SangPoints
    const guideWallet = match.guide.walletAddress;
    let txHash = null;

    if (guideWallet) {
      txHash = await mintPoints(guideWallet, 200);

      // Record to SangPoints ledger
      await prisma.sangPointsLedger.create({
        data: {
          userId: match.guideId,
          amount: 200,
          type: "MINT",
          txHash: txHash,
        },
      });
    } else {
      console.warn(`[API] Guide ${match.guideId} has no wallet address. Points not minted.`);
    }

    return NextResponse.json({
      success: true,
      message: "Trip completed successfully.",
      txHash,
      sangPointsEarned: 200,
    });

  } catch (error: any) {
    console.error("[API] Error completing trip:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
