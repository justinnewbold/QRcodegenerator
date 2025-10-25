import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "QR Code Generator - Free & Modern | newbold.cloud",
  description: "Create beautiful, customizable QR codes for free. Generate QR codes for URLs, WiFi, vCards, emails, and more with advanced styling options.",
  keywords: "QR code generator, free QR code, custom QR code, WiFi QR code, vCard QR code, QR code maker",
  authors: [{ name: "Justin Newbold" }],
  openGraph: {
    title: "QR Code Generator - Free & Modern",
    description: "Create beautiful, customizable QR codes for free",
    type: "website",
    url: "https://newbold.cloud",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
