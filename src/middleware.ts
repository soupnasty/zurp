export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cards/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/api/plaid/:path*",
    "/api/benefits/:path*",
  ],
};
