export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import {
  Users,
  MapPin,
  Handshake,
  Coins,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Stats = {
  users: number;
  trips: number;
  matches: number;
  ledgerEntries: number;
  alerts: number;
  activeTrips: number;
};

type StatCard = {
  label: string;
  value: number;
  icon: typeof Users;
  gradient: string;
  iconBg: string;
  suffix?: string;
};

async function getStats(): Promise<Stats> {
  try {
    const [users, trips, matches, ledgerEntries, alerts, activeTrips] =
      await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.match.count(),
        prisma.sangPointsLedger.count(),
        prisma.waypointProgress.count({ where: { overdueAlertSent: true } }),
        prisma.trip.count({ where: { status: "IN_PROGRESS" } }),
      ]);
    return { users, trips, matches, ledgerEntries, alerts, activeTrips };
  } catch {
    return { users: 0, trips: 0, matches: 0, ledgerEntries: 0, alerts: 0, activeTrips: 0 };
  }
}

async function getRecentMatches() {
  try {
    return await prisma.match.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        guideTrip: {
          include: {
            guide: { select: { name: true } },
            route: { select: { name: true } },
          },
        },
        trekkerTrip: {
          include: {
            trekker: { select: { name: true } },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

function StatCard({ label, value, icon: Icon, gradient, iconBg, suffix }: StatCard) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100 ${iconBg}`} />
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {suffix && (
              <span className="text-sm text-muted-foreground">{suffix}</span>
            )}
          </div>
        </div>
        <div className={`rounded-xl p-3 ${gradient} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentMatchesList({
  matches,
}: {
  matches: Awaited<ReturnType<typeof getRecentMatches>>;
}) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Handshake className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No matches yet</p>
        <p className="text-xs text-muted-foreground">
          Matches will appear here once trekkers and guides connect.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {matches.map((match) => {
        const badgeVariant: Record<string, "success" | "accent" | "default" | "secondary"> = {
          COMPLETED: "success",
          DEPARTED: "accent",
          ACCEPTED: "default",
        };
        return (
          <div
            key={match.id}
            className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                <Handshake className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {match.guideTrip.guide.name}
                  <span className="mx-1.5 text-muted-foreground">&amp;</span>
                  {match.trekkerTrip.trekker?.name ?? "Unknown"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {match.guideTrip.route.name}
                  <span className="mx-1.5">&middot;</span>
                  {new Date(match.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant={badgeVariant[match.status] ?? "secondary"} className="shrink-0 capitalize">
              {match.status.toLowerCase()}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentMatches = await getRecentMatches();

  const cards: StatCard[] = [
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Active Trips",
      value: stats.activeTrips,
      icon: Activity,
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-500/10",
      suffix: "right now",
    },
    {
      label: "Total Trips",
      value: stats.trips,
      icon: MapPin,
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      iconBg: "bg-cyan-500/10",
    },
    {
      label: "Matches",
      value: stats.matches,
      icon: Handshake,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-500/10",
    },
    {
      label: "SangPoints TX",
      value: stats.ledgerEntries,
      icon: Coins,
      gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "Overdue Alerts",
      value: stats.alerts,
      icon: AlertTriangle,
      gradient: "bg-gradient-to-br from-red-500 to-red-600",
      iconBg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of the SangSangai platform
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground sm:flex">
          <UserCheck className="h-4 w-4 text-green-500" />
          <span>Admin</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Recent Matches</h2>
            <p className="text-sm text-muted-foreground">
              Latest connections between guides and trekkers
            </p>
          </div>
          {recentMatches.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Past 5</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          )}
        </div>
        <RecentMatchesList matches={recentMatches} />
      </div>
    </div>
  );
}
