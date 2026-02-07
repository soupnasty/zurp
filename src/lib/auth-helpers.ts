import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the authenticated user or null.
 */
export async function getAuthUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication. Redirects to login if not authenticated.
 * For use in server components.
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require authentication for API routes.
 * Returns the user or throws a 401 response.
 */
export async function requireAuthApi() {
  const user = await getAuthUser();
  if (!user || !user.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
