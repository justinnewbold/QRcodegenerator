"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  generateAnimationFrames,
  getAnimationPreview,
  ANIMATION_PRESETS,
  type AnimationEffect,
} from "@/lib/animated-qr"
import type { QRCodeOptions } from "@/lib/qr-generator"
import { X, Play, Download, Zap } from "lucide-react"

interface AnimatedQRGeneratorProps {
  qrOptions: QRCodeOptions;
  onClose: () => void;
}

export default function AnimatedQRGenerator({ qrOptions, onClose }: AnimatedQRGeneratorProps) {
  const [effect, setEffect] = useState<AnimationEffect>('pulse')
  const [duration, setDuration] = useState(2)
  const [fps, setFps] = useState(15)
  const [frames, setFrames] = useState<string[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length)
      }, 1000 / fps)
      return () => clearInterval(interval)
    }
  }, [isPlaying, frames.length, fps])

  const generateAnimation = async () => {
    setIsGenerating(true)
    setIsPlaying(false)

    try {
      const generatedFrames = await generateAnimationFrames({
        ...qrOptions,
        effect,
        duration,
        fps,
      })
      setFrames(generatedFrames)
      setCurrentFrame(0)
    } catch (error) {
      console.error('Error generating animation:', error)
      alert('Failed to generate animation')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFrames = () => {
    frames.forEach((frame, index) => {
      const link = document.createElement('a')
      link.href = frame
      link.download = `qr-animation-frame-${String(index).padStart(3, '0')}.png`
      link.click()
    })
  }

  const applyPreset = (preset: typeof ANIMATION_PRESETS[0]) => {
    setEffect(preset.effect)
    setDuration(preset.duration)
    setFps(preset.fps)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Animated QR Codes
              </CardTitle>
              <CardDescription>
                Create eye-catching animated QR codes with various effects
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <Label className="mb-2 block">Preview</Label>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center p-8 border-2">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Generating {frames.length}/{Math.floor(duration * fps)} frames...</p>
                  </div>
                ) : frames.length > 0 ? (
                  <img src={frames[currentFrame]} alt="Animated QR" className="max-w-full" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Zap className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Configure and generate</p>
                  </div>
                )}
              </div>

              {frames.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant={isPlaying ? "default" : "outline"}
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex-1 gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button variant="outline" onClick={downloadFrames} className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download Frames
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Frame {currentFrame + 1} of {frames.length}
                  </p>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <Label>Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ANIMATION_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="justify-start"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Animation Effect</Label>
                <Select value={effect} onValueChange={(v) => setEffect(v as AnimationEffect)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="rotate">Rotate</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAnimationPreview(effect)}
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Duration: {duration}s</Label>
                <Slider
                  id="duration"
                  value={duration}
                  onValueChange={setDuration}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>

              <div>
                <Label htmlFor="fps">Frame Rate: {fps} FPS</Label>
                <Slider
                  id="fps"
                  value={fps}
                  onValueChange={setFps}
                  min={10}
                  max={30}
                  step={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total frames: {Math.floor(duration * fps)}
                </p>
              </div>

              <Button
                onClick={generateAnimation}
                disabled={isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                <Zap className="h-5 w-5" />
                {isGenerating ? 'Generating...' : 'Generate Animation'}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Frames are exported as individual PNG images.
              Use video editing software or online GIF makers to create the final animated GIF or video.
              Lower FPS and shorter duration = fewer frames = smaller file size.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
