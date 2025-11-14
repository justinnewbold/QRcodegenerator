import QRScanner from "@/components/qr-scanner"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Home, Package, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <QRScanner />
      </div>
    </main>
  )
}
