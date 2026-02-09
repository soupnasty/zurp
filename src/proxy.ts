export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/benefits/:path*",
    "/spending/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/api/plaid/:path*",
    "/api/benefits/:path*",
  ],
};
