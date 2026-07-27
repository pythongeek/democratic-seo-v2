import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenSEO Democratic | Community-Driven SEO Tools",
  description: "Open source alternative to Semrush and Ahrefs. Community-driven, transparent, and democratic SEO platform.",
  keywords: ["SEO", "open source", "keyword research", "rank tracking", "backlinks", "site audit", "democratic"],
  authors: [{ name: "OpenSEO Community" }],
  openGraph: {
    title: "OpenSEO Democratic",
    description: "Community-driven SEO tools for everyone.",
    type: "website",
    url: "https://openseo.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster position="bottom-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
