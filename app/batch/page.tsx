import BatchGenerator from "@/components/batch-generator"
import { ThemeToggle } from "@/components/theme-toggle"
import { ErrorBoundary } from "@/components/error-boundary"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ScanLine, Grid3x3 } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Batch QR Code Generator - Create Multiple QR Codes | newbold.cloud",
  description: "Generate multiple QR codes at once from CSV data. Batch create QR codes for URLs, contacts, and more with our free bulk QR code generator.",
  openGraph: {
    title: "Batch QR Code Generator - Create Multiple QR Codes",
    description: "Generate multiple QR codes at once from CSV data",
    type: "website",
    url: "https://newbold.cloud/batch",
  },
}

export default function BatchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Link href="/">
          <Button variant="outline" size="icon" title="Home">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/scan">
          <Button variant="outline" size="icon" title="Scan QR Code">
            <ScanLine className="h-5 w-5" />
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
          <BatchGenerator />
        </ErrorBoundary>
      </div>
      <footer className="text-center py-8 text-sm text-muted-foreground border-t">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://newbold.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary underline-offset-4 hover:underline"
          >
            Justin Newbold
          </a>
        </p>
        <p className="mt-2">
          Free forever • No tracking • Open source
        </p>
      </footer>
    </main>
  )
}
