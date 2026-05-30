import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromCookie(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;

    const file = await prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }
    if (file.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await prisma.uploadedFile.delete({ where: { id } });

    const filePath = path.join(process.cwd(), "public", file.fileUrl);
    try { await unlink(filePath); } catch { /* file may not exist on disk */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
