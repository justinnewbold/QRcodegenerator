"use client"

import { useEffect, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function useOnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useState(true)

  useEffect(() => {
    // Check if user has seen the tour
    const tourCompleted = localStorage.getItem('onboarding-tour-completed')
    setHasSeenTour(!!tourCompleted)
  }, [])

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: '#qr-type-tabs',
          popover: {
            title: 'Choose QR Code Type',
            description: 'Select from 17+ different QR code types including URL, WiFi, vCard, and more.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#qr-content-form',
          popover: {
            title: 'Enter Your Content',
            description: 'Fill in the details for your QR code. Each type has specific fields tailored to that format.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#qr-customization',
          popover: {
            title: 'Customize Your QR Code',
            description: 'Personalize your QR code with colors, logos, error correction levels, and more.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#qr-preview',
          popover: {
            title: 'Preview Your QR Code',
            description: 'See a live preview of your QR code as you make changes.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#download-button',
          popover: {
            title: 'Download Your QR Code',
            description: 'Export your QR code in various formats: PNG, JPEG, SVG, WebP, or PDF.',
            side: 'top',
            align: 'center'
          }
        },
        {
          popover: {
            title: 'Pro Tip: Keyboard Shortcuts',
            description: 'Press Cmd+K (or Ctrl+K) to open the command palette for quick navigation. Press Cmd+Z to undo changes!',
          }
        }
      ],
      onDestroyStarted: () => {
        localStorage.setItem('onboarding-tour-completed', 'true')
        setHasSeenTour(true)
        driverObj.destroy()
      }
    })

    driverObj.drive()
  }

  const resetTour = () => {
    localStorage.removeItem('onboarding-tour-completed')
    setHasSeenTour(false)
  }

  return {
    hasSeenTour,
    startTour,
    resetTour
  }
}
