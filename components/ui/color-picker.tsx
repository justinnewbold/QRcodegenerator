"use client"

import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Input } from './input'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  presets?: string[]
  showRecentColors?: boolean
}

const DEFAULT_PRESETS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

export function ColorPicker({
  value,
  onChange,
  label,
  presets = DEFAULT_PRESETS,
  showRecentColors = true
}: ColorPickerProps) {
  const [recentColors, setRecentColors] = useState<string[]>([])

  const handleColorChange = (newColor: string) => {
    onChange(newColor)
    if (showRecentColors && !recentColors.includes(newColor)) {
      setRecentColors(prev => [newColor, ...prev.slice(0, 9)])
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            aria-label={`Select color: ${value}`}
          >
            <div
              className="h-6 w-6 rounded border-2 border-border"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-sm">{value.toUpperCase()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <HexColorPicker color={value} onChange={handleColorChange} />

            <div className="space-y-2">
              <Label>Hex Color</Label>
              <Input
                value={value}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#000000"
                className="font-mono"
              />
            </div>

            {presets.length > 0 && (
              <div className="space-y-2">
                <Label>Presets</Label>
                <div className="grid grid-cols-5 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      className={cn(
                        "h-8 w-8 rounded border-2 transition-transform hover:scale-110",
                        preset === value ? "border-primary ring-2 ring-primary" : "border-border"
                      )}
                      style={{ backgroundColor: preset }}
                      onClick={() => handleColorChange(preset)}
                      aria-label={`Select preset color ${preset}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {showRecentColors && recentColors.length > 0 && (
              <div className="space-y-2">
                <Label>Recent Colors</Label>
                <div className="grid grid-cols-5 gap-2">
                  {recentColors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      className="h-8 w-8 rounded border-2 border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Select recent color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
