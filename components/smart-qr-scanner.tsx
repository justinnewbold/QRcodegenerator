"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Camera, Upload, AlertCircle, CheckCircle2, Copy, ExternalLink, Scan } from "lucide-react"
import {
  startCameraStream,
  stopCameraStream,
  scanQRFromVideo,
  scanQRFromFile,
  detectQRType,
  parseWiFiQR,
  parseVCardQR,
  type ScanResult
} from "@/lib/qr-scanner"

interface SmartQRScannerProps {
  onClose: () => void
  onScanComplete?: (data: string) => void
}

export default function SmartQRScanner({ onClose, onScanComplete }: SmartQRScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await startCameraStream()
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
        startScanning()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera')
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (streamRef.current) {
      stopCameraStream(streamRef.current)
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraActive(false)
    setScanning(false)
  }

  const startScanning = () => {
    setScanning(true)
    scanIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const scanResult = scanQRFromVideo(videoRef.current)
        if (scanResult) {
          handleScanResult(scanResult.data)
        }
      }
    }, 300) // Scan every 300ms
  }

  const handleScanResult = (data: string) => {
    setResult(data)
    setScanning(false)
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (onScanComplete) {
      onScanComplete(data)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setResult(null)
      const results = await scanQRFromFile(file)

      if (results.length === 0) {
        setError('No QR code found in the image')
      } else {
        handleScanResult(results[0].data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan QR code')
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
    }
  }

  const openLink = () => {
    if (result && (result.startsWith('http://') || result.startsWith('https://'))) {
      window.open(result, '_blank')
    }
  }

  const resetScan = () => {
    setResult(null)
    setError(null)
    if (activeTab === 'camera' && cameraActive) {
      startScanning()
    }
  }

  const qrType = result ? detectQRType(result) : null
  const wifiData = result && qrType === 'WiFi' ? parseWiFiQR(result) : null
  const vcardData = result && qrType === 'vCard' ? parseVCardQR(result) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-6 w-6" />
              <CardTitle>Smart QR Scanner</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Scan QR codes using your camera or upload an image
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'camera' | 'upload')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button onClick={startCamera} size="lg">
                      <Camera className="h-5 w-5 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                )}
                {scanning && (
                  <div className="absolute inset-0 border-4 border-primary animate-pulse pointer-events-none" />
                )}
              </div>

              {cameraActive && !result && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={stopCamera} variant="outline">
                    Stop Camera
                  </Button>
                  {!scanning && (
                    <Button onClick={startScanning}>
                      Resume Scanning
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an image containing a QR code
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-upload"
                />
                <Button onClick={() => document.getElementById('qr-upload')?.click()}>
                  Choose Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3 border rounded-lg p-4 bg-accent/50">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">QR Code Detected!</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm px-2 py-1 bg-primary/10 rounded">{qrType}</span>
                </div>

                {wifiData && (
                  <div className="space-y-1 border-t pt-2">
                    <div className="text-xs text-muted-foreground">WiFi Details:</div>
                    <div className="text-sm"><strong>SSID:</strong> {wifiData.ssid}</div>
                    <div className="text-sm"><strong>Password:</strong> {wifiData.password}</div>
                    <div className="text-sm"><strong>Encryption:</strong> {wifiData.encryption}</div>
                  </div>
                )}

                {vcardData && (
                  <div className="space-y-1 border-t pt-2">
                    <div className="text-xs text-muted-foreground">Contact Details:</div>
                    {vcardData.name && <div className="text-sm"><strong>Name:</strong> {vcardData.name}</div>}
                    {vcardData.email && <div className="text-sm"><strong>Email:</strong> {vcardData.email}</div>}
                    {vcardData.phone && <div className="text-sm"><strong>Phone:</strong> {vcardData.phone}</div>}
                    {vcardData.org && <div className="text-sm"><strong>Organization:</strong> {vcardData.org}</div>}
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Data:</div>
                  <div className="text-sm font-mono bg-muted p-2 rounded break-all max-h-32 overflow-auto">
                    {result}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={resetScan}>
                  Scan Another
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                {(result.startsWith('http://') || result.startsWith('https://')) && (
                  <Button variant="outline" size="sm" onClick={openLink}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
