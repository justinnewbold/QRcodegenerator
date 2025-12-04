import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PWARegister } from "@/components/pwa-register";
import { SkipLinks, AnnouncerProvider } from "@/components/accessibility";

export const metadata: Metadata = {
  title: "QR Code Generator - Free & Modern | newbold.cloud",
  description: "Create beautiful, customizable QR codes for free. Generate QR codes for URLs, WiFi, vCards, emails, and more with advanced styling options.",
  keywords: "QR code generator, free QR code, custom QR code, WiFi QR code, vCard QR code, QR code maker",
  authors: [{ name: "Justin Newbold" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QR Generator",
  },
  openGraph: {
    title: "QR Code Generator - Free & Modern",
    description: "Create beautiful, customizable QR codes for free",
    type: "website",
    url: "https://newbold.cloud",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnnouncerProvider>
            <SkipLinks />
            <main id="main-content">
              {children}
            </main>
            <PWARegister />
          </AnnouncerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
