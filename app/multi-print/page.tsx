import MultiPrint from "@/components/multi-print"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ScanLine, Package } from "lucide-react"

export default function MultiPrintPage() {
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
        <Link href="/batch">
          <Button variant="outline" size="icon" title="Batch Generator">
            <Package className="h-5 w-5" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      <div className="py-8">
        <MultiPrint />
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
