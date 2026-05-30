export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarDays, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminTripsPage() {
  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      guide: { select: { name: true } },
      trekker: { select: { name: true } },
      route: { select: { name: true, region: true } },
      knowledgeCard: { select: { id: true } },
    },
  });

  const statusVariant = (status: string) => {
    switch (status) {
      case "OPEN": return "secondary";
      case "MATCHED": return "default";
      case "IN_PROGRESS": return "accent";
      case "COMPLETED": return "success";
      case "CANCELLED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
        <p className="mt-1 text-muted-foreground">
          All trekking trips ({trips.length} total)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Trips</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{trip.route.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {trip.guide.name}
                      </span>
                      {trip.trekker && (
                        <span>→ {trip.trekker.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {trip.knowledgeCard && (
                    <Badge variant="outline" className="text-xs">Card</Badge>
                  )}
                  <Badge variant={statusVariant(trip.status)} className="capitalize">
                    {trip.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
            {trips.length === 0 && (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <MapPin className="mb-2 h-8 w-8" />
                <p className="text-sm">No trips created yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
