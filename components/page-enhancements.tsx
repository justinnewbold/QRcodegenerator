"use client"

import { useEffect } from 'react'
import { CommandPalette } from './command-palette'
import { useOnboardingTour } from '@/hooks/use-onboarding-tour'
import { Button } from './ui/button'
import { HelpCircle } from 'lucide-react'

interface PageEnhancementsProps {
  onSelectQRType?: (type: string) => void
  onOpenHistory?: () => void
  onOpenSettings?: () => void
}

export function PageEnhancements({
  onSelectQRType,
  onOpenHistory,
  onOpenSettings
}: PageEnhancementsProps) {
  const { hasSeenTour, startTour } = useOnboardingTour()

  useEffect(() => {
    // Auto-start tour for first-time users (with a small delay)
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTour, startTour])

  return (
    <>
      <CommandPalette
        onSelectQRType={onSelectQRType}
        onOpenHistory={onOpenHistory}
        onOpenSettings={onOpenSettings}
      />

      {/* Help button to restart tour */}
      <Button
        variant="outline"
        size="icon"
        onClick={startTour}
        title="Help & Tour"
        aria-label="Start help tour"
        className="fixed bottom-4 right-4 z-40 shadow-lg"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
    </>
  )
}
