import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/oranienbaum";
import "@fontsource-variable/noto-kufi-arabic";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Sawa · سوا — one front door to school life",
  description:
    "Sawa is one integrated platform for students, parents and teachers: sign in once, never re-type data, and find every service, lesson and notice in one place.",
  icons: { icon: "/brand/logo-mark.png" },
};

export const viewport: Viewport = { themeColor: "#cfccc7", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
