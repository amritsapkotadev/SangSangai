export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      guideTrip: {
        include: {
          guide: { select: { name: true } },
          route: { select: { name: true, region: true } },
        },
      },
      trekkerTrip: {
        include: {
          trekker: { select: { name: true } },
        },
      },
      waypointProgresses: {
        include: {
          waypoint: { select: { name: true, order: true } },
        },
        orderBy: { waypoint: { order: "asc" } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
        <p className="mt-1 text-muted-foreground">
          All guide-trekker connections ({matches.length} total)
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const confirmed = match.waypointProgresses.filter((wp) => wp.confirmedAt).length;
          const total = match.waypointProgresses.length;

          return (
            <Card key={match.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <Handshake className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {match.guideTrip.guide.name}
                        <ArrowRight className="mx-2 inline h-3.5 w-3.5 text-muted-foreground" />
                        {match.trekkerTrip.trekker?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.guideTrip.route.name} — {match.guideTrip.route.region}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      match.status === "COMPLETED" ? "success" :
                      match.status === "DEPARTED" ? "accent" :
                      match.status === "ACCEPTED" ? "default" :
                      "secondary"
                    }
                    className="capitalize"
                  >
                    {match.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Created: {formatDateTime(match.createdAt)}</span>
                  {match.departedAt && <span>Departed: {formatDateTime(match.departedAt)}</span>}
                  {match.completedAt && <span>Completed: {formatDateTime(match.completedAt)}</span>}
                  <span>Waypoints: {confirmed}/{total} confirmed</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {matches.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <Handshake className="mb-2 h-8 w-8" />
              <p className="text-sm">No matches yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
