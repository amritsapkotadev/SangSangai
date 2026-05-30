import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { getBalance } from "@/lib/sangpoints";

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.data!.sub },
      select: { walletAddress: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const balance = user.walletAddress
      ? await getBalance(user.walletAddress)
      : 0;

    return NextResponse.json({
      success: true,
      data: { balance, walletAddress: user.walletAddress },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Get sangpoints error:", message);
    return NextResponse.json(
      { success: false, error: `Failed to fetch balance: ${message}` },
      { status: 500 }
    );
  }
}
