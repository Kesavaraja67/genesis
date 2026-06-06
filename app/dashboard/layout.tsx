// app/(dashboard)/layout.tsx
// AUTH TEMPORARILY BYPASSED — using getAuthSession to get guest user
import { getAuthSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  const user = session?.user ?? { name: "Guest", email: "" };

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
