import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Sawa · سوا — one front door to school life",
  description:
    "Sawa is one integrated platform for students, parents and teachers: sign in once, never re-type data, and find every service, lesson and notice in one place.",
  icons: { icon: "/brand/logo-mark.png" },
};

export const viewport: Viewport = { themeColor: "#e9e8e6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@500;700;800&family=Noto+Kufi+Arabic:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="silk antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
