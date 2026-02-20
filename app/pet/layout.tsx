import type { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: "Lost Pet QR Code Generator - Help Find Missing Pets | newbold.cloud",
  description: "Create QR codes with your pet's information and emergency contacts. Help reunite lost pets with their owners using scannable QR tags.",
  openGraph: {
    title: "Lost Pet QR Code Generator - Help Find Missing Pets",
    description: "Create QR codes with pet info and emergency contacts for lost pet tags",
    type: "website",
    url: "https://newbold.cloud/pet",
  },
}

export default function PetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
