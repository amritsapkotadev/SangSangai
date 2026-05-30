import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { createHash } from "crypto";

function hashUserId(email: string): string {
  return createHash("sha256").update(email + process.env.JWT_SECRET).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, nationality, walletAddress, phone } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["NEPALI", "FOREIGN"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Role must be NEPALI or FOREIGN" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const hashedId = hashUserId(email);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        nationality: nationality || null,
        walletAddress: walletAddress || null,
        phone: phone || null,
        hashedId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nationality: true,
        walletAddress: true,
        hashedId: true,
      },
    });

    const token = signToken({ sub: user.id, email: user.email, role: user.role as "NEPALI" | "FOREIGN" | "ADMIN" });

    return NextResponse.json(
      { success: true, data: { user, token } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
