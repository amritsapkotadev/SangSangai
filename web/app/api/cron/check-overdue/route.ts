export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function GET() {
  try {
    const activeMatches = await prisma.match.findMany({
      where: {
        status: "DEPARTED",
        departedAt: { not: null },
      },
      include: {
        guideTrip: {
          include: {
            guide: { select: { name: true } },
            route: { select: { name: true } },
          },
        },
        trekkerTrip: {
          include: {
            trekker: { select: { name: true, emergencyContact: true } },
          },
        },
        waypointProgresses: {
          include: { waypoint: { select: { name: true, order: true, estimatedHours: true } } },
          orderBy: { waypoint: { order: "asc" } },
        },
      },
    });

    const alertsTriggered: string[] = [];

    for (const match of activeMatches) {
      const lastConfirmed = [...match.waypointProgresses]
        .reverse()
        .find((wp) => wp.confirmedAt);

      const nextUnconfirmed = match.waypointProgresses.find((wp) => !wp.confirmedAt);

      if (!nextUnconfirmed) continue;

      const elapsedHours = lastConfirmed?.confirmedAt
        ? (Date.now() - new Date(lastConfirmed.confirmedAt).getTime()) / (1000 * 60 * 60)
        : match.departedAt
        ? (Date.now() - new Date(match.departedAt!).getTime()) / (1000 * 60 * 60)
        : 0;

      if (elapsedHours > nextUnconfirmed.waypoint.estimatedHours && !nextUnconfirmed.overdueAlertSent) {
        await prisma.waypointProgress.update({
          where: { id: nextUnconfirmed.id },
          data: { overdueAlertSent: true },
        });

        await prisma.notificationLog.create({
          data: {
            matchId: match.id,
            type: "OVERDUE_ALERT",
            title: "⚠️ Waypoint Overdue Alert",
            body: `${match.guideTrip.guide.name} and ${match.trekkerTrip.trekker?.name ?? "trekker"} are overdue at ${nextUnconfirmed.waypoint.name} on ${match.guideTrip.route.name}.`,
            success: true,
          },
        });

        alertsTriggered.push(match.id);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        checked: activeMatches.length,
        alertsTriggered: alertsTriggered.length,
        matchIds: alertsTriggered,
      },
    });
  } catch (error) {
    console.error("Cron check overdue error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
