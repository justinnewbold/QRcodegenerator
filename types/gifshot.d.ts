declare module 'gifshot' {
  export interface GifShotOptions {
    images?: string[]
    gifWidth?: number
    gifHeight?: number
    interval?: number
    numFrames?: number
    frameDuration?: number
    sampleInterval?: number
  }

  export interface GifShotResult {
    error: boolean
    errorMsg?: string
    image?: string
  }

  export function createGIF(
    options: GifShotOptions,
    callback: (result: GifShotResult) => void
  ): void

  const gifshot: {
    createGIF: typeof createGIF
  }

  export default gifshot
}
