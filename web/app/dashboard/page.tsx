import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/DashboardContent";
import { getBalance } from "@/lib/sangpoints";

export default async function DashboardPage() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login");

  let payload: { sub: string; email: string; role: string } | null = null;
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    payload = JSON.parse(
      Buffer.from(b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "="), "base64").toString()
    );
  } catch {
    redirect("/login");
  }
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, isVerified: true, avatarUrl: true, walletAddress: true },
  });

  if (!user) redirect("/login");

  let sangPointsBalance = "0";
  if (user.walletAddress) {
    try {
      sangPointsBalance = await getBalance(user.walletAddress);
    } catch {
      // blockchain unreachable — show 0
    }
  }

  return <DashboardContent user={user} sangPointsBalance={sangPointsBalance} />;
}
