import QRScanner from "@/components/qr-scanner"
import { ThemeToggle } from "@/components/theme-toggle"
import { ErrorBoundary } from "@/components/error-boundary"
import Link from "next/link"
import { Home, Package, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "QR Code Scanner - Free Online Scanner | newbold.cloud",
  description: "Scan and decode QR codes instantly with our free online QR code scanner. Use your camera or upload an image to read any QR code.",
  openGraph: {
    title: "QR Code Scanner - Free Online Scanner",
    description: "Scan and decode QR codes instantly with your camera or an image",
    type: "website",
    url: "https://newbold.cloud/scan",
  },
}

export default function ScanPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Link href="/">
          <Button variant="outline" size="icon" title="Home">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/batch">
          <Button variant="outline" size="icon" title="Batch Generator">
            <Package className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/multi-print">
          <Button variant="outline" size="icon" title="Multi-Print">
            <Grid3x3 className="h-5 w-5" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      <div className="py-8">
        <ErrorBoundary>
          <QRScanner />
        </ErrorBoundary>
      </div>
    </main>
  )
}
