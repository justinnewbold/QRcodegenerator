import jsQR from 'jsqr'

export interface ScanResult {
  data: string
  location: {
    topLeft: { x: number; y: number }
    topRight: { x: number; y: number }
    bottomLeft: { x: number; y: number }
    bottomRight: { x: number; y: number }
  }
}

/**
 * Scan a QR code from an image file
 */
export async function scanQRFromFile(file: File): Promise<ScanResult[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const results = scanQRFromImage(img)
          resolve(results)
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Scan QR codes from an image element
 */
export function scanQRFromImage(img: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): ScanResult[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  canvas.width = img instanceof HTMLVideoElement ? img.videoWidth : img.width
  canvas.height = img instanceof HTMLVideoElement ? img.videoHeight : img.height

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const results: ScanResult[] = []

  // Try to decode QR code
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  })

  if (code) {
    results.push({
      data: code.data,
      location: {
        topLeft: code.location.topLeftCorner,
        topRight: code.location.topRightCorner,
        bottomLeft: code.location.bottomLeftCorner,
        bottomRight: code.location.bottomRightCorner,
      },
    })
  }

  // Try with inverted colors
  if (results.length === 0) {
    const invertedCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    })

    if (invertedCode) {
      results.push({
        data: invertedCode.data,
        location: {
          topLeft: invertedCode.location.topLeftCorner,
          topRight: invertedCode.location.topRightCorner,
          bottomLeft: invertedCode.location.bottomLeftCorner,
          bottomRight: invertedCode.location.bottomRightCorner,
        },
      })
    }
  }

  return results
}

/**
 * Scan QR code from video stream
 */
export function scanQRFromVideo(video: HTMLVideoElement): ScanResult | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  })

  if (code) {
    return {
      data: code.data,
      location: {
        topLeft: code.location.topLeftCorner,
        topRight: code.location.topRightCorner,
        bottomLeft: code.location.bottomLeftCorner,
        bottomRight: code.location.bottomRightCorner,
      },
    }
  }

  return null
}

/**
 * Start camera stream
 */
export async function startCameraStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints || {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }
    )
    return stream
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Please allow camera permissions.')
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found on this device.')
      }
    }
    throw new Error('Failed to access camera.')
  }
}

/**
 * Stop camera stream
 */
export function stopCameraStream(stream: MediaStream): void {
  stream.getTracks().forEach(track => track.stop())
}

/**
 * Detect QR code type
 */
export function detectQRType(data: string): string {
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return 'URL'
  } else if (data.startsWith('mailto:')) {
    return 'Email'
  } else if (data.startsWith('tel:')) {
    return 'Phone'
  } else if (data.startsWith('sms:')) {
    return 'SMS'
  } else if (data.startsWith('WIFI:')) {
    return 'WiFi'
  } else if (data.startsWith('BEGIN:VCARD')) {
    return 'vCard'
  } else if (data.startsWith('geo:')) {
    return 'Location'
  } else if (data.startsWith('BEGIN:VEVENT')) {
    return 'Calendar Event'
  } else {
    return 'Text'
  }
}

/**
 * Parse WiFi QR code data
 */
export function parseWiFiQR(data: string): { ssid: string; password: string; encryption: string } | null {
  if (!data.startsWith('WIFI:')) return null

  const parts = data.substring(5).split(';')
  const result: any = {}

  parts.forEach(part => {
    const [key, value] = part.split(':')
    if (key && value) {
      result[key] = value
    }
  })

  return {
    ssid: result.S || '',
    password: result.P || '',
    encryption: result.T || 'WPA',
  }
}

/**
 * Parse vCard QR code data
 */
export function parseVCardQR(data: string): { name?: string; email?: string; phone?: string; org?: string } | null {
  if (!data.startsWith('BEGIN:VCARD')) return null

  const result: any = {}
  const lines = data.split('\n')

  lines.forEach(line => {
    if (line.startsWith('FN:')) {
      result.name = line.substring(3)
    } else if (line.startsWith('EMAIL:')) {
      result.email = line.split(':')[1]
    } else if (line.startsWith('TEL:')) {
      result.phone = line.split(':')[1]
    } else if (line.startsWith('ORG:')) {
      result.org = line.substring(4)
    }
  })

  return result
}
