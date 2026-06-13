import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/admin/settings/users-table";

export default async function SettingsUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  if (!session.user.role?.includes("admin")) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return <UsersTable />;
}
