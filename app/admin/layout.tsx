import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { Topbar } from "@/components/admin/topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-zinc-50 text-zinc-900">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
