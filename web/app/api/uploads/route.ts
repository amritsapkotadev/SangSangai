import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request);
    if (!token) {
      return NextResponse.json({ success: false, data: [] });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, data: [] });
    }

    const files = await prisma.uploadedFile.findMany({
      where: { userId: payload.sub },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        status: true,
        notes: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error("List uploads error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
