import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/providers/AppProviders";

export const metadata: Metadata = {
  title: "datavista",
  description: "Data Analytics & Visualization Portal",
  icons: {
    icon: "/favicon.svg",
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
