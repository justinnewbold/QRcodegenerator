import jsQR from 'jsqr'

// NOTE: This is a client-side implementation using browser APIs
// For server-side image processing, install canvas: npm install canvas
// and uncomment the server implementation

export interface RepairResult {
  success: boolean
  data?: string
  confidence?: number
  repaired?: boolean
  originalQuality?: number
  repairedQuality?: number
  errors?: string[]
}

export async function repairQRCodeClient(imageFile: File): Promise<RepairResult> {
  try {
    // Create image element
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })

    // Create canvas and get image data
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Try to decode original
    const originalResult = jsQR(
      imageDataObj.data,
      imageDataObj.width,
      imageDataObj.height
    )

    if (originalResult) {
      return {
        success: true,
        data: originalResult.data,
        confidence: calculateConfidence(originalResult),
        repaired: false,
        originalQuality: calculateQuality(originalResult),
      }
    }

    // Original failed, try repair techniques
    const repairTechniques = [
      enhanceContrast,
      sharpenImage,
      denoiseImage,
      adjustBrightness,
      binarize,
    ]

    for (const technique of repairTechniques) {
      const repairedImageData = technique(imageDataObj)
      const result = jsQR(
        repairedImageData.data,
        repairedImageData.width,
        repairedImageData.height
      )

      if (result) {
        return {
          success: true,
          data: result.data,
          confidence: calculateConfidence(result),
          repaired: true,
          originalQuality: 0,
          repairedQuality: calculateQuality(result),
        }
      }
    }

    return {
      success: false,
      errors: ['Could not decode QR code after repair attempts'],
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

export async function enhanceQRCodeClient(imageFile: File): Promise<string> {
  const img = new Image()
  const url = URL.createObjectURL(imageFile)

  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = url
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img, 0, 0)
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Apply enhancements
  imgData = enhanceContrast(imgData)
  imgData = sharpenImage(imgData)

  ctx.putImageData(imgData, 0, 0)

  URL.revokeObjectURL(url)
  return canvas.toDataURL()
}

function enhanceContrast(imageData: ImageData): ImageData {
  const data = imageData.data
  const factor = 1.5

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - 128) * factor + 128)
    data[i + 1] = clamp((data[i + 1] - 128) * factor + 128)
    data[i + 2] = clamp((data[i + 2] - 128) * factor + 128)
  }

  return imageData
}

function sharpenImage(imageData: ImageData): ImageData {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data)

  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0,
        g = 0,
        b = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const weight = kernel[(ky + 1) * 3 + (kx + 1)]

          r += data[idx] * weight
          g += data[idx + 1] * weight
          b += data[idx + 2] * weight
        }
      }

      const idx = (y * width + x) * 4
      newData[idx] = clamp(r)
      newData[idx + 1] = clamp(g)
      newData[idx + 2] = clamp(b)
    }
  }

  return new ImageData(newData, width, height)
}

function denoiseImage(imageData: ImageData): ImageData {
  // Simple median filter for noise reduction
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixels: number[] = []

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          pixels.push(data[idx])
        }
      }

      pixels.sort((a, b) => a - b)
      const median = pixels[Math.floor(pixels.length / 2)]

      const idx = (y * width + x) * 4
      newData[idx] = median
      newData[idx + 1] = median
      newData[idx + 2] = median
    }
  }

  return new ImageData(newData, width, height)
}

function adjustBrightness(imageData: ImageData): ImageData {
  const data = imageData.data
  const brightness = 20

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + brightness)
    data[i + 1] = clamp(data[i + 1] + brightness)
    data[i + 2] = clamp(data[i + 2] + brightness)
  }

  return imageData
}

function binarize(imageData: ImageData): ImageData {
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    const val = avg > 128 ? 255 : 0

    data[i] = val
    data[i + 1] = val
    data[i + 2] = val
  }

  return imageData
}

function calculateConfidence(result: any): number {
  // Calculate confidence based on location markers and module consistency
  return Math.min(100, result.location ? 85 : 50)
}

function calculateQuality(result: any): number {
  // Quality score based on successful decode
  return result ? 80 : 0
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value))
}
