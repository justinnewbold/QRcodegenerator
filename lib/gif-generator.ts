import gifshot from 'gifshot'
import { generateQRCode, type QRCodeOptions } from './qr-generator'

export interface AnimatedQROptions extends QRCodeOptions {
  frames: number
  interval: number // milliseconds between frames
  loop?: boolean
}

/**
 * Generate an animated GIF QR code that cycles through different colors or styles
 */
export async function generateAnimatedGIF(
  content: string,
  options: Omit<AnimatedQROptions, 'content'>
): Promise<string> {
  const frames: string[] = []
  const colors = [
    '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
    '#4d4d4d', '#333333', '#1a1a1a', '#000000'
  ]

  // Generate frames with varying colors
  for (let i = 0; i < options.frames; i++) {
    const frameColor = colors[i % colors.length]
    const result = await generateQRCode({
      ...options,
      content,
      foregroundColor: frameColor
    })
    frames.push(result.dataUrl)
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF({
      images: frames,
      gifWidth: options.size || 300,
      gifHeight: options.size || 300,
      interval: (options.interval || 200) / 1000, // Convert to seconds
      numFrames: options.frames,
      frameDuration: options.interval || 200,
      sampleInterval: 10,
    }, (obj: any) => {
      if (obj.error) {
        reject(new Error(obj.errorMsg || 'Failed to create GIF'))
      } else {
        resolve(obj.image)
      }
    })
  })
}

/**
 * Generate a pulsing QR code GIF
 */
export async function generatePulsingQR(
  content: string,
  baseOptions: Omit<QRCodeOptions, 'content'>
): Promise<string> {
  const frames: string[] = []
  const sizes = [280, 290, 300, 310, 320, 310, 300, 290]

  for (const size of sizes) {
    const result = await generateQRCode({
      ...baseOptions,
      content,
      size
    })
    frames.push(result.dataUrl)
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF({
      images: frames,
      gifWidth: 320,
      gifHeight: 320,
      interval: 0.1,
      numFrames: frames.length,
    }, (obj: any) => {
      if (obj.error) {
        reject(new Error(obj.errorMsg || 'Failed to create GIF'))
      } else {
        resolve(obj.image)
      }
    })
  })
}

/**
 * Download a GIF
 */
export function downloadGIF(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
