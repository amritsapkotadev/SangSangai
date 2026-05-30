import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = auth.data!.sub;

    const existing = await prisma.communitySave.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    if (existing) {
      await prisma.communitySave.delete({ where: { id: existing.id } });
      const count = await prisma.communitySave.count({ where: { postId: id } });
      return NextResponse.json({ success: true, data: { saved: false, savesCount: count } });
    }

    await prisma.communitySave.create({ data: { postId: id, userId } });
    const count = await prisma.communitySave.count({ where: { postId: id } });
    return NextResponse.json({ success: true, data: { saved: true, savesCount: count } }, { status: 201 });
  } catch (error) {
    console.error("Community save error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
