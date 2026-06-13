import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { getMongoClient } from "@/lib/db";

function createAuth() {
  const client = getMongoClient();
  const dbPromise = client.db(process.env.MONGODB_DB ?? "adimencrm");

  return betterAuth({
  database: mongodbAdapter(dbPromise, { client }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [admin({ defaultRole: "comercial" }), dash(), nextCookies()],
  });
}

export const auth = createAuth();

export type Session = typeof auth.$Infer.Session;
