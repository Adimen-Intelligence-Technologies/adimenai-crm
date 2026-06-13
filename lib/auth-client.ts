import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export type UserRole = "admin" | "comercial" | "admin,comercial";

export function hasRole(role: string | undefined | null, required: UserRole): boolean {
  if (!role) return false;
  const roles = role.split(",").map((r) => r.trim());
  return roles.includes(required);
}
