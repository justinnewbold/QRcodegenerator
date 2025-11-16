import { generateQRCode, type QRCodeOptions } from './qr-generator';

export type AnimationEffect = 'pulse' | 'fade' | 'rotate' | 'bounce' | 'wave';

export interface AnimatedQROptions extends QRCodeOptions {
  effect: AnimationEffect;
  duration: number; // in seconds
  fps: number;
}

/**
 * Generate frames for animated QR code
 */
export async function generateAnimationFrames(
  options: AnimatedQROptions
): Promise<string[]> {
  const { effect, duration, fps, ...qrOptions } = options;
  const frameCount = Math.floor(duration * fps);
  const frames: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const progress = i / frameCount;
    const frameDataUrl = await generateAnimatedFrame(qrOptions, effect, progress);
    frames.push(frameDataUrl);
  }

  return frames;
}

/**
 * Generate a single frame with animation effect
 */
async function generateAnimatedFrame(
  options: QRCodeOptions,
  effect: AnimationEffect,
  progress: number
): Promise<string> {
  // Generate base QR code
  const result = await generateQRCode(options);

  // Create canvas for animation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = options.size;
  canvas.height = options.size;

  // Load QR image
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = result.dataUrl;
  });

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply animation effect
  switch (effect) {
    case 'pulse':
      applyPulseEffect(ctx, img, progress, options.size);
      break;
    case 'fade':
      applyFadeEffect(ctx, img, progress, options.size);
      break;
    case 'rotate':
      applyRotateEffect(ctx, img, progress, options.size);
      break;
    case 'bounce':
      applyBounceEffect(ctx, img, progress, options.size);
      break;
    case 'wave':
      applyWaveEffect(ctx, img, progress, options.size);
      break;
  }

  return canvas.toDataURL();
}

function applyPulseEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number
) {
  // Pulse from 0.9 to 1.1 scale
  const scale = 0.9 + 0.2 * Math.abs(Math.sin(progress * Math.PI * 2));
  const scaledSize = size * scale;
  const offset = (size - scaledSize) / 2;

  ctx.drawImage(img, offset, offset, scaledSize, scaledSize);
}

function applyFadeEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number
) {
  // Fade in and out
  const alpha = 0.3 + 0.7 * Math.abs(Math.sin(progress * Math.PI * 2));
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, 0, 0, size, size);
  ctx.globalAlpha = 1;
}

function applyRotateEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number
) {
  // Rotate 360 degrees
  const angle = progress * Math.PI * 2;
  ctx.translate(size / 2, size / 2);
  ctx.rotate(angle);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function applyBounceEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number
) {
  // Bounce up and down
  const bounceHeight = size * 0.1;
  const y = bounceHeight * Math.abs(Math.sin(progress * Math.PI * 4));
  ctx.drawImage(img, 0, -y, size, size);
}

function applyWaveEffect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  size: number
) {
  // Wave effect - draw in strips with sine wave offset
  const strips = 20;
  const stripHeight = size / strips;

  for (let i = 0; i < strips; i++) {
    const offset = Math.sin((progress * Math.PI * 2) + (i / strips * Math.PI)) * 10;
    ctx.drawImage(
      img,
      0, i * stripHeight, size, stripHeight,
      offset, i * stripHeight, size, stripHeight
    );
  }
}

/**
 * Note: Actual GIF encoding would require a library like gif.js
 * For now, we'll export frames as individual images or a video format
 */
export function getAnimationPreview(effect: AnimationEffect): string {
  const descriptions: Record<AnimationEffect, string> = {
    pulse: 'QR code gently grows and shrinks in a pulsing rhythm',
    fade: 'QR code fades in and out smoothly',
    rotate: 'QR code continuously rotates 360 degrees',
    bounce: 'QR code bounces up and down playfully',
    wave: 'QR code ripples with a wave effect',
  };

  return descriptions[effect];
}

export const ANIMATION_PRESETS = [
  { effect: 'pulse' as AnimationEffect, duration: 2, fps: 15, name: 'Gentle Pulse' },
  { effect: 'fade' as AnimationEffect, duration: 3, fps: 15, name: 'Smooth Fade' },
  { effect: 'rotate' as AnimationEffect, duration: 4, fps: 20, name: 'Full Rotation' },
  { effect: 'bounce' as AnimationEffect, duration: 2, fps: 20, name: 'Playful Bounce' },
  { effect: 'wave' as AnimationEffect, duration: 3, fps: 15, name: 'Wave Effect' },
];
