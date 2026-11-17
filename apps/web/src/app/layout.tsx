import type { Metadata } from "next";
import { Onest } from "next/font/google";

import { themeScript } from "@/features/theme/theme-preference";

import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Daycraft",
  description: "A calm personal planner built around the Plan timeline.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script sets the `dark` class before hydration, so React must not compare it.
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-canvas text-ink">{children}</body>
    </html>
  );
}
