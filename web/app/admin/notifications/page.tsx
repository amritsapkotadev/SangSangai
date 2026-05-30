export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminNotificationsPage() {
  const logs = await prisma.notificationLog.findMany({
    orderBy: { sentAt: "desc" },
    include: {
      match: {
        include: {
          guideTrip: {
            include: {
              guide: { select: { name: true } },
              route: { select: { name: true } },
            },
          },
        },
      },
      recipient: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Logs</h1>
        <p className="mt-1 text-muted-foreground">
          Firebase push notification history ({logs.length} total)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  log.success ? "bg-emerald-100 dark:bg-emerald-950" : "bg-red-100 dark:bg-red-950"
                }`}>
                  {log.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{log.title}</p>
                    <Badge variant={log.success ? "success" : "destructive"} className="shrink-0 text-xs">
                      {log.success ? "Sent" : "Failed"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{log.body}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Type: {log.type}</span>
                    {log.recipient && <span>To: {log.recipient.name}</span>}
                    {log.match && (
                      <span>
                        Match: {log.match.guideTrip.guide.name} — {log.match.guideTrip.route.name}
                      </span>
                    )}
                    <span>{formatDateTime(log.sentAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Bell className="mb-2 h-8 w-8" />
                <p className="text-sm">No notifications sent yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
