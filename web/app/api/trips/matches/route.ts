import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.success) {
    return NextResponse.json(auth, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = { status: "OPEN" };

    if (region) {
      where.route = { region: { contains: region, mode: "insensitive" } };
    }
    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        guide: {
          select: { id: true, name: true, avatarUrl: true, nationality: true },
        },
        route: {
          select: {
            id: true,
            name: true,
            region: true,
            durationDays: true,
            difficulty: true,
            imageUrl: true,
            waypoints: {
              orderBy: { order: "asc" },
              select: { id: true, name: true, order: true, estimatedHours: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: trips });
  } catch (error) {
    console.error("Browse matches error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
