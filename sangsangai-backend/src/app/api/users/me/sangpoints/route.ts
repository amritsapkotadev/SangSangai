import { NextResponse } from "next/server";
import { getBalance } from "@/lib/sangpoints";
// import { verifyAuth } from "@/lib/auth"; // In real app
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Verify user (mocked for now)
    // const user = await verifyAuth(request);
    const mockUserId = "cm0_mock_guide_id_123";

    if (!process.env.DATABASE_URL) {
      // Mock mode (using Aarav's demo wallet)
      const balance = await getBalance("0xeC5eA63092348C7B473678F2F41875963527a895");
      return NextResponse.json({
        success: true,
        sangPoints: balance,
        walletAddress: "0xeC5eA63092348C7B473678F2F41875963527a895",
      });
    }

    // 2. Fetch user from DB
    const userDb = await prisma.user.findUnique({
      where: { id: mockUserId },
      select: { walletAddress: true },
    });

    if (!userDb || !userDb.walletAddress) {
      return NextResponse.json({ error: "User or wallet not found" }, { status: 404 });
    }

    // 3. Fetch live balance from Blockchain
    const liveBalance = await getBalance(userDb.walletAddress);

    return NextResponse.json({
      success: true,
      sangPoints: liveBalance,
      walletAddress: userDb.walletAddress,
    });
  } catch (error: any) {
    console.error("[API] Error fetching SangPoints:", error);
    return NextResponse.json({ error: "Failed to fetch balance", details: error.message }, { status: 500 });
  }
}
