export function compressImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to compressed base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Estimate QR code data size in bytes
export function estimateQRDataSize(data: string): number {
  // Account for encoding overhead
  return new Blob([data]).size
}

// Get maximum QR code capacity based on error correction level
export function getQRCodeCapacity(errorLevel: string): number {
  const capacities: { [key: string]: number } = {
    'L': 2953,  // Low - 7% error correction
    'M': 2331,  // Medium - 15% error correction
    'Q': 1663,  // Quartile - 25% error correction
    'H': 1273,  // High - 30% error correction
  }
  return capacities[errorLevel] || capacities['M']
}
