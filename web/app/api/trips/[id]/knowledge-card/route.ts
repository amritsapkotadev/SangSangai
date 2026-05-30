import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { id } = await params;

    const card = await prisma.knowledgeCard.findUnique({
      where: { tripId: id },
    });

    if (!card) {
      return NextResponse.json(
        { success: false, error: "Knowledge card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("Get knowledge card error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    if (trip.guideId !== auth.data!.sub) {
      return NextResponse.json(
        { success: false, error: "Only the guide can write a knowledge card" },
        { status: 403 }
      );
    }

    const card = await prisma.knowledgeCard.upsert({
      where: { tripId: id },
      update: { content },
      create: { tripId: id, content },
    });

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("Save knowledge card error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
