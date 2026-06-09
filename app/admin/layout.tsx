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
          <main className="flex-1 overflow-y-auto bg-zinc-50">
            <div className="mx-auto w-full max-w-6xl border-x border-zinc-200 bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
