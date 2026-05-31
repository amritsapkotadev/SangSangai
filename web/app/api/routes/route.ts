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
    const name = searchParams.get("name");

    const where = name
      ? { name: { contains: name, mode: "insensitive" as const } }
      : {};

    const routes = await prisma.route.findMany({
      where,
      include: {
        waypoints: { orderBy: { order: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: routes });
  } catch (error) {
    console.error("Get routes error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
