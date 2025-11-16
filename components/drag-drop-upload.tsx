"use client"

import { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DragDropUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  currentImage?: string
  onClear?: () => void
  maxSize?: number // in MB
  label?: string
}

export default function DragDropUpload({
  onFileSelect,
  accept = 'image/*',
  currentImage,
  onClear,
  maxSize = 5,
  label = 'Upload Image'
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const validateFile = (file: File): boolean => {
    setError('')

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return false
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }, [onFileSelect, maxSize])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }

  return (
    <div className="space-y-2">
      {currentImage ? (
        <div className="relative border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <img
              src={currentImage}
              alt="Uploaded"
              className="w-16 h-16 object-contain rounded border"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Image uploaded</p>
              <p className="text-xs text-muted-foreground">Ready to use in QR code</p>
            </div>
            {onClear && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium mb-1">
            {isDragging ? 'Drop image here' : label}
          </p>
          <p className="text-xs text-muted-foreground">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {maxSize}MB
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
