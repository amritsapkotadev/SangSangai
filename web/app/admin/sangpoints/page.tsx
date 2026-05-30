export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Coins, ExternalLink, Wallet, Globe } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  getBalance,
  getTotalSupply,
  getContractOwner,
} from "@/lib/sangpoints";

export default async function AdminSangPointsPage() {
  const token = (await cookies()).get("token")?.value;
  let adminWallet = "";
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { walletAddress: true },
      });
      adminWallet = user?.walletAddress ?? "";
    }
  }

  let onChainTotalSupply = "—";
  let contractOwner = "—";
  let adminBalance = "—";
  try {
    onChainTotalSupply = await getTotalSupply();
    contractOwner = await getContractOwner();
    if (adminWallet) {
      adminBalance = await getBalance(adminWallet);
    }
  } catch {
    // blockchain unreachable
  }

  const ledgerEntries = await prisma.sangPointsLedger.findMany({
    orderBy: { createdAt: "desc" },
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
    },
  });

  const totalMinted = ledgerEntries
    .filter((e) => e.type === "MINT")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SangPoints Ledger</h1>
        <p className="mt-1 text-muted-foreground">
          Blockchain-tracked reward transactions on Polygon Amoy
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-amber-500" />
              On-Chain Total Supply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">
              {onChainTotalSupply} SANG
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 text-amber-500" />
              {adminWallet ? "Your Balance" : "Contract Owner"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">
              {adminWallet ? `${adminBalance} SANG` : contractOwner.slice(0, 6) + "..." + contractOwner.slice(-4)}
            </p>
            {adminWallet && (
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                {contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Minted (DB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMinted} SP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ledgerEntries.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.match
                      ? `${entry.match.guideTrip.guide.name} — ${entry.match.guideTrip.route.name}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                      {entry.walletAddress.slice(0, 6)}...
                      {entry.walletAddress.slice(-4)}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.amount} SP
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.type === "MINT" ? "success" : "warning"}
                    >
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.txHash ? (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                      >
                        <code className="font-mono">
                          {entry.txHash.slice(0, 8)}...
                          {entry.txHash.slice(-4)}
                        </code>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Pending
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {ledgerEntries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <Coins className="mb-2 h-8 w-8" />
                      <p className="text-sm">No transactions yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
