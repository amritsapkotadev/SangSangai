import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { id } = await params;
    const post = await prisma.communityPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== auth.data!.sub) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this post" }, { status: 403 });
    }

    await prisma.communityPost.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Community delete error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
