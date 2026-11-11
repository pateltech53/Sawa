import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/oranienbaum";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource-variable/noto-kufi-arabic";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Sawa · سوا — one front door to school life",
  description:
    "Sawa is one integrated platform for students, parents and teachers: sign in once, never re-type data, and find every service, lesson and notice in one place.",
  icons: { icon: "/brand/logo-mark.png", apple: "/brand/icon-180.png" },
  manifest: "/manifest.webmanifest",
  // Added to the iPhone home screen, Sawa opens full-screen like a native app.
  appleWebApp: { capable: true, title: "Sawa", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#d6d2cc", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
