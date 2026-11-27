import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NavProgress from "@/components/NavProgress";
import WarmUp from "@/components/WarmUp";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Scale to Thrive | Job-oriented chariots for engineers",
  description:
    "Two 12-week hybrid chariots for engineering students and recent graduates: IT Skills and Advanced Excel & Corporate Readiness. By Anvesana TBI and PES Trust.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}><NavProgress /></Suspense>
        <WarmUp />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
