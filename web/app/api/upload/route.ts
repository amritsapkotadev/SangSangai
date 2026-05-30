import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
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
    const file = formData.get("file") as File | null;
    const fileType = formData.get("fileType") as string | null;

    if (!file || !fileType) {
      return NextResponse.json({ success: false, error: "File and fileType required" }, { status: 400 });
    }

    const userDir = path.join(UPLOAD_DIR, payload.sub);
    await mkdir(userDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name}`;
    const filePath = path.join(userDir, uniqueName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const fileUrl = `/uploads/${payload.sub}/${uniqueName}`;

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId: payload.sub,
        fileName: file.name,
        fileUrl,
        fileType,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: uploadedFile }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
