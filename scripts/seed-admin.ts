import { auth } from "../lib/auth";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@adimenai.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  try {
    const user = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: "admin",
      },
    });
    console.log(`Admin creado: ${user.user.email} (${user.user.name})`);
  } catch (err: any) {
    if (err?.status === 422) {
      console.log("El admin ya existe.");
      return;
    }
    console.error("Error al crear admin:", err);
    process.exit(1);
  }
}

main();
