import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const destination = searchParams.get("destination");

    const token = request.headers.get("authorization")?.slice(7);
    let currentUserId: string | null = null;
    if (token) {
      const { verifyToken } = await import("@/lib/auth");
      const payload = verifyToken(token);
      if (payload) currentUserId = payload.sub;
    }

    const where: Record<string, unknown> = {};
    if (category && category !== "All") where.category = category;
    if (source) where.source = source;
    if (destination) where.destination = destination;

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, isVerified: true, avatarUrl: true } },
        likes: { select: { userId: true } },
        saves: { select: { userId: true } },
        comments: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = posts.map((post) => ({
      ...post,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      savesCount: post.saves.length,
      isLiked: currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false,
      isSaved: currentUserId ? post.saves.some((s) => s.userId === currentUserId) : false,
      likes: undefined,
      saves: undefined,
      comments: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Community list error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { title, source, destination, trekDate, duration, durationHours, budgetUSD, budgetNPR, description, category } = await request.json();

    if (!title || !source || !destination || !duration) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, source, destination, duration" },
        { status: 400 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: auth.data!.sub,
        title,
        source,
        destination,
        trekDate: trekDate ? new Date(trekDate) : null,
        duration,
        durationHours: durationHours || null,
        budgetUSD: budgetUSD || null,
        budgetNPR: budgetNPR || null,
        description: description || null,
        category: category || "Stories",
      },
      include: {
        user: { select: { id: true, name: true, role: true, isVerified: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, data: { ...post, likesCount: 0, commentsCount: 0, savesCount: 0, isLiked: false, isSaved: false } }, { status: 201 });
  } catch (error) {
    console.error("Community create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
