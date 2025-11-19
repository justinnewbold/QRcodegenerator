import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "QR Code Generator - Free & Modern | newbold.cloud",
  description: "Create beautiful, customizable QR codes for free. Generate QR codes for URLs, WiFi, vCards, emails, and more with advanced styling options.",
  keywords: "QR code generator, free QR code, custom QR code, WiFi QR code, vCard QR code, QR code maker",
  authors: [{ name: "Justin Newbold" }],
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QR Generator"
  },
  openGraph: {
    title: "QR Code Generator - Free & Modern",
    description: "Create beautiful, customizable QR codes for free",
    type: "website",
    url: "https://newbold.cloud",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" expand={true} richColors closeButton />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
