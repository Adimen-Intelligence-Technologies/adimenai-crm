import { Sidebar } from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { Topbar } from "@/components/admin/topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-zinc-50 text-zinc-900">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
