import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Resend as ResendClient } from "resend";
import { render } from "@react-email/components";
import { ZurpSignInEmail } from "@/emails/zurp-signin";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";
import * as schema from "@/db/schema";

function createAuthDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle({ client: sql, schema });
}

const authConfig = () =>
  NextAuth({
    adapter: DrizzleAdapter(createAuthDb() as any, {
      usersTable: users as any,
      accountsTable: accounts as any,
      sessionsTable: sessions as any,
      verificationTokensTable: verificationTokens as any,
    }),
    providers: [
      Resend({
        from: "zurp <noreply@zurp.io>",
        async sendVerificationRequest({ identifier: email, url }) {
          const resend = new ResendClient(process.env.AUTH_RESEND_KEY);
          const html = await render(ZurpSignInEmail({ signInUrl: url }));
          await resend.emails.send({
            from: "zurp <noreply@zurp.io>",
            to: email,
            subject: "Sign in to zurp",
            html,
          });
        },
      }),
    ],
    pages: {
      signIn: "/login",
      verifyRequest: "/login/verify",
      error: "/login/error",
    },
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
    events: {
      async signIn({ user }) {
        if (user.id) {
          const { eq } = await import("drizzle-orm");
          const db = createAuthDb();
          await db
            .update(users)
            .set({ lastActive: new Date() })
            .where(eq(users.id, user.id));
        }
      },
    },
  });

let _auth: ReturnType<typeof authConfig> | null = null;

function getAuth() {
  if (!_auth) {
    _auth = authConfig();
  }
  return _auth;
}

export const handlers = {
  GET: (...args: any[]) => (getAuth().handlers.GET as any)(...args),
  POST: (...args: any[]) => (getAuth().handlers.POST as any)(...args),
};

export const auth = (...args: any[]) => (getAuth().auth as any)(...args);
export const signIn = (...args: any[]) => (getAuth().signIn as any)(...args);
export const signOut = (...args: any[]) => (getAuth().signOut as any)(...args);
