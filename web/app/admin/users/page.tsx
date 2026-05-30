export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Globe, ShieldCheck, Ban } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nationality: true,
      isVerified: true,
      isBanned: true,
      createdAt: true,
      walletAddress: true,
      avatarUrl: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage all registered users ({users.length} total)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-accent/10 text-accent text-sm">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      {user.isBanned && <Ban className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </span>
                      {user.nationality && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {user.nationality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.walletAddress && (
                    <code className="hidden rounded bg-muted px-2 py-1 text-xs font-mono lg:inline-block">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </code>
                  )}
                  <Badge
                    variant={
                      user.role === "ADMIN" ? "default" :
                      user.role === "NEPALI" ? "accent" :
                      "secondary"
                    }
                    className="capitalize"
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                  {user.isVerified ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Users className="mb-2 h-8 w-8" />
                <p className="text-sm">No users registered yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
