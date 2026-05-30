import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAdminFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateAdminFromRequest(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const notes = body.notes || "Rejected by admin";

    const existing = await prisma.uploadedFile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Upload not found" }, { status: 404 });
    }

    const updated = await prisma.uploadedFile.update({
      where: { id },
      data: {
        status: "REJECTED",
        notes,
        reviewedAt: new Date(),
        reviewedBy: auth.data!.sub,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Reject upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
