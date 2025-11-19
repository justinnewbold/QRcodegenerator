"use client"

import { useEffect } from 'react'
import { useEscapeKey } from '@/hooks/use-escape-key'
import FocusLock from 'react-focus-lock'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'
import { motion, AnimatePresence } from 'framer-motion'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}

const sideClasses = {
  left: 'left-0 top-0 h-full w-80 max-w-[85vw]',
  right: 'right-0 top-0 h-full w-80 max-w-[85vw]',
  top: 'top-0 left-0 w-full h-auto max-h-[85vh]',
  bottom: 'bottom-0 left-0 w-full h-auto max-h-[85vh]'
}

const slideVariants = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' }
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' }
  },
  top: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' }
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' }
  }
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = 'left',
  className
}: DrawerProps) {
  useEscapeKey(onClose, isOpen)

  // Prevent body scroll when drawer is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <FocusLock returnFocus>
            <motion.div
              initial={slideVariants[side].initial}
              animate={slideVariants[side].animate}
              exit={slideVariants[side].exit}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "fixed z-50 bg-background shadow-lg",
                sideClasses[side],
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "drawer-title" : undefined}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 id="drawer-title" className="text-lg font-semibold">
                    {title}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close drawer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="overflow-y-auto h-full p-4">
                {children}
              </div>
            </motion.div>
          </FocusLock>
        </>
      )}
    </AnimatePresence>
  )
}
