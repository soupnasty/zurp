import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "zurp",
  description:
    "zurp tracks your credit card benefits automatically — and shows you what you'd gain or lose on every other card.",
  metadataBase: new URL(
    process.env.APP_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  openGraph: {
    title: "zurp",
    description:
      "See what your credit card is really worth. Track benefits, compare 30+ cards, and find your best fit.",
    siteName: "zurp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "zurp",
    description:
      "See what your credit card is really worth. Track benefits, compare 30+ cards, and find your best fit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${spaceMono.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
