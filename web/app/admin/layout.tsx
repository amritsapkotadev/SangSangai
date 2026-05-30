import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  const isAdmin = !!payload && payload.role === "ADMIN";

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
