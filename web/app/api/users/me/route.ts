import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.data!.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nationality: true,
        walletAddress: true,
        emergencyContact: true,
        emergencyPhone: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        hashedId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
