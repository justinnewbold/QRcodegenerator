"use client"

import { useEffect } from 'react'
import { useEscapeKey } from '@/hooks/use-escape-key'
import FocusLock from 'react-focus-lock'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full mx-4'
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  size = 'md',
  showCloseButton = true
}: ModalProps) {
  useEscapeKey(onClose, isOpen)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <FocusLock returnFocus>
        <div
          className={cn(
            "relative w-full bg-background rounded-lg shadow-lg overflow-hidden",
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="ml-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </FocusLock>
    </div>
  )
}
