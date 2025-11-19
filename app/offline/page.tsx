import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <WifiOff className="h-6 w-6" />
            <CardTitle>You&apos;re Offline</CardTitle>
          </div>
          <CardDescription>
            No internet connection detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This page requires an internet connection. Please check your connection and try again.
          </p>
          <p className="text-sm text-muted-foreground">
            Some features of the QR Code Generator may still work offline if you&apos;ve used them before.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
