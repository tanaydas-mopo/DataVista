import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/providers/AppProviders";

export const metadata: Metadata = {
  title: "DataVista — Data Analytics & Visualization Portal",
  description: "High-performance interactive data analytics, visual chart builder, and report generation portal.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full antialiased text-textPrimary bg-appBackground">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
