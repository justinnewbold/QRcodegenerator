"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Phone, Mail, AlertCircle, Award, Stethoscope, Home } from "lucide-react"
import Link from "next/link"

interface PetContact {
  name: string
  phone: string
  email: string
  relation: string
}

interface CustomField {
  label: string
  value: string
}

interface PetData {
  name: string
  species?: string
  breed?: string
  color?: string
  age?: string
  microchip?: string
  medical?: string
  photo?: string
  contacts: PetContact[]
  customFields?: CustomField[]
  reward?: string
}

export default function PetViewer() {
  const [petData, setPetData] = useState<PetData | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    try {
      // Get data from URL hash
      const hash = window.location.hash.slice(1)
      if (hash) {
        const decoded = decodeURIComponent(atob(hash))
        const data = JSON.parse(decoded)
        console.log('Decoded pet data:', data)
        console.log('Photo exists:', !!data.photo)
        console.log('Photo length:', data.photo?.length)
        setPetData(data)
      } else {
        setError("No pet information found in QR code")
      }
    } catch (err) {
      setError("Error loading pet information")
      console.error('Decoding error:', err)
    }
  }, [])

  const callPhone = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const sendEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const sendSMS = (phone: string) => {
    window.location.href = `sms:${phone}`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to QR Generator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!petData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pet information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full mb-4">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Lost Pet - Please Help!</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden">
          {petData.photo && petData.photo.trim() !== "" && (
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img
                src={petData.photo}
                alt={petData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load')
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => console.log('Image loaded successfully')}
              />
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              {petData.name}
            </CardTitle>
            {(petData.species || petData.breed) && (
              <p className="text-lg text-muted-foreground">
                {petData.species && petData.breed
                  ? `${petData.species} - ${petData.breed}`
                  : petData.species || petData.breed}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              {petData.color && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color/Markings</p>
                  <p className="text-base">{petData.color}</p>
                </div>
              )}
              {petData.age && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-base">{petData.age}</p>
                </div>
              )}
              {petData.microchip && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Microchip #</p>
                  <p className="text-base font-mono">{petData.microchip}</p>
                </div>
              )}
            </div>

            {/* Medical Info */}
            {petData.medical && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Stethoscope className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">Medical Information</p>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{petData.medical}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reward */}
            {petData.reward && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Reward</p>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">{petData.reward}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {petData.customFields && petData.customFields.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Additional Information</p>
                <div className="grid grid-cols-1 gap-2">
                  {petData.customFields.map((field, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium text-muted-foreground">{field.label}</span>
                      <span className="text-sm">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Emergency Contacts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Please contact to help reunite this pet with their family
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {petData.contacts.map((contact, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-lg">{contact.name}</p>
                  {contact.relation && (
                    <p className="text-sm text-muted-foreground">{contact.relation}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {contact.phone && (
                    <>
                      <Button
                        onClick={() => callPhone(contact.phone)}
                        className="flex-1 min-w-[140px]"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        onClick={() => sendSMS(contact.phone)}
                        variant="outline"
                        className="flex-1 min-w-[140px]"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Text
                      </Button>
                    </>
                  )}
                  {contact.email && (
                    <Button
                      onClick={() => sendEmail(contact.email)}
                      variant="outline"
                      className="flex-1 min-w-[140px]"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                </div>

                {contact.phone && (
                  <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
                )}
                {contact.email && (
                  <p className="text-sm text-muted-foreground break-all">{contact.email}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>
              This QR code was generated with{" "}
              <Link href="/" className="text-primary hover:underline">
                qrgen.newbold.cloud
              </Link>
            </p>
            <p className="mt-2">Free QR code generator - No tracking, 100% private</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
