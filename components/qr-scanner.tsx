"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Camera, X } from "lucide-react"
import jsQR from "jsqr"

export default function QRScanner() {
  const [scannedData, setScannedData] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setScannedData("")

    try {
      const image = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        image.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            setError("Could not get canvas context")
            return
          }

          canvas.width = image.width
          canvas.height = image.height
          ctx.drawImage(image, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            setScannedData(code.data)
          } else {
            setError("No QR code found in the image")
          }
        }

        if (e.target?.result) {
          image.src = e.target.result as string
        }
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError("Error reading file")
      console.error(err)
    }
  }

  const startCamera = async () => {
    try {
      setError("")
      setScannedData("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
        scanFromCamera()
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.")
      console.error(err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const scanFromCamera = () => {
    if (!videoRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        setScannedData(code.data)
        stopCamera()
        return
      }
    }

    requestAnimationFrame(scanFromCamera)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scannedData)
  }

  const openLink = () => {
    if (scannedData.startsWith("http://") || scannedData.startsWith("https://")) {
      window.open(scannedData, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">Upload an image or use your camera to scan QR codes</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>Choose a method to scan your QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload Image</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 border-t" />
            </div>

            {!isScanning ? (
              <Button onClick={startCamera} className="w-full gap-2">
                <Camera className="h-4 w-4" />
                Use Camera
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full"
                  />
                  <Button
                    onClick={stopCamera}
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Point your camera at a QR code to scan it
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {scannedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scanned Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted break-all font-mono text-sm">
                    {scannedData}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                      Copy
                    </Button>
                    {(scannedData.startsWith("http://") ||
                      scannedData.startsWith("https://")) && (
                      <Button onClick={openLink} className="flex-1">
                        Open Link
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About QR Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This QR code scanner works entirely in your browser. No data is sent to any server,
              ensuring your privacy and security.
            </p>
            <p>
              <strong>Supported formats:</strong> All standard QR codes including URLs, text,
              WiFi credentials, vCards, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
