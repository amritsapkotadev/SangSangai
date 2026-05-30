import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "Avatar file required" }, { status: 400 });
    }

    await mkdir(AVATAR_DIR, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${payload.sub}.${ext}`;
    const filePath = path.join(AVATAR_DIR, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const avatarUrl = `/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: payload.sub },
      data: { avatarUrl },
    });

    return NextResponse.json({ success: true, data: { avatarUrl } });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
