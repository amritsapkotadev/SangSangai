export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminAlertsPage() {
  const alerts = await prisma.waypointProgress.findMany({
    where: { overdueAlertSent: true },
    orderBy: { id: "desc" },
    include: {
      match: {
        include: {
          guideTrip: {
            include: {
              guide: { select: { name: true } },
              route: { select: { name: true } },
            },
          },
          trekkerTrip: {
            include: {
              trekker: { select: { name: true, emergencyContact: true, emergencyPhone: true } },
            },
          },
        },
      },
      waypoint: { select: { name: true, estimatedHours: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overdue Alerts</h1>
        <p className="mt-1 text-muted-foreground">
          Waypoint alerts that triggered emergency notifications ({alerts.length} total)
        </p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="border-destructive/30 transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Overdue at {alert.waypoint.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.match.guideTrip.route.name}
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">Alert Sent</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Guide: {alert.match.guideTrip.guide.name} | Trekker: {alert.match.trekkerTrip.trekker?.name ?? "Unknown"}
                </div>
                {alert.match.trekkerTrip.trekker?.emergencyContact && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Emergency Contact: {alert.match.trekkerTrip.trekker.emergencyContact}
                    {alert.match.trekkerTrip.trekker.emergencyPhone && (
                      <> — {alert.match.trekkerTrip.trekker.emergencyPhone}</>
                    )}
                  </div>
                )}
                <p>Waypoint ETA: {alert.waypoint.estimatedHours}h | Alert triggered at unchecked waypoint</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {alerts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <AlertTriangle className="mb-2 h-8 w-8" />
              <p className="text-sm">No overdue alerts — all trekkers are on schedule</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
