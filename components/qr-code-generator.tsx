"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  generateQRCode,
  generateWiFiString,
  generateVCardString,
  generateEmailString,
  generateSMSString,
  generatePhoneString,
  generateCalendarString,
  generateCryptoString,
  generateAppStoreString,
  generateSocialMediaString,
  generateLocationString,
  generatePDF,
  type ErrorCorrectionLevel,
  type QRCodeOptions,
  type QRStyle,
  type FinderPattern,
  type FrameStyle,
  type GradientConfig,
} from "@/lib/qr-generator"
import { compressImage, estimateQRDataSize, getQRCodeCapacity } from "@/lib/image-utils"
import { saveToHistory, getHistory, clearHistory, deleteHistoryItem, type QRHistoryItem } from "@/lib/qr-history"
import { Download, QrCode, Wifi, Mail, Phone, MessageSquare, User, Link2, Heart, Plus, X, AlertTriangle, Info, Calendar, Coins, Smartphone, History, FileText, Printer, Trash2, MapPin, Twitter, Instagram, Linkedin, Facebook, Music } from "lucide-react"

export default function QRCodeGenerator() {
  const [qrType, setQrType] = useState<string>("url")
  const [content, setContent] = useState<string>("")
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [qrSvg, setQrSvg] = useState<string>("")
  const [sizeWarning, setSizeWarning] = useState<string>("")

  // Customization options
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M")
  const [size, setSize] = useState<number>(300)
  const [fgColor, setFgColor] = useState<string>("#000000")
  const [bgColor, setBgColor] = useState<string>("#ffffff")
  const [margin, setMargin] = useState<number>(4)
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [qrStyle, setQrStyle] = useState<QRStyle>("squares")

  // History
  const [history, setHistory] = useState<QRHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)

  // Form fields for different QR types
  const [url, setUrl] = useState<string>("")
  const [wifiSsid, setWifiSsid] = useState<string>("")
  const [wifiPassword, setWifiPassword] = useState<string>("")
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA")
  const [vcardFirstName, setVcardFirstName] = useState<string>("")
  const [vcardLastName, setVcardLastName] = useState<string>("")
  const [vcardPhone, setVcardPhone] = useState<string>("")
  const [vcardEmail, setVcardEmail] = useState<string>("")
  const [vcardOrg, setVcardOrg] = useState<string>("")
  const [vcardWebsite, setVcardWebsite] = useState<string>("")
  const [emailAddress, setEmailAddress] = useState<string>("")
  const [emailSubject, setEmailSubject] = useState<string>("")
  const [emailBody, setEmailBody] = useState<string>("")
  const [smsPhone, setSmsPhone] = useState<string>("")
  const [smsMessage, setSmsMessage] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [plainText, setPlainText] = useState<string>("")

  // Pet ID fields
  const [petName, setPetName] = useState<string>("")
  const [petSpecies, setPetSpecies] = useState<string>("")
  const [petBreed, setPetBreed] = useState<string>("")
  const [petColor, setPetColor] = useState<string>("")
  const [petAge, setPetAge] = useState<string>("")
  const [petMicrochip, setPetMicrochip] = useState<string>("")
  const [petMedical, setPetMedical] = useState<string>("")
  const [petContacts, setPetContacts] = useState<Array<{name: string, phone: string, email: string, relation: string}>>([
    {name: "", phone: "", email: "", relation: "Owner"}
  ])
  const [petCustomFields, setPetCustomFields] = useState<Array<{label: string, value: string}>>([])
  const [petReward, setPetReward] = useState<string>("")

  // Calendar Event fields
  const [calendarTitle, setCalendarTitle] = useState<string>("")
  const [calendarLocation, setCalendarLocation] = useState<string>("")
  const [calendarStart, setCalendarStart] = useState<string>("")
  const [calendarEnd, setCalendarEnd] = useState<string>("")
  const [calendarDescription, setCalendarDescription] = useState<string>("")

  // Cryptocurrency fields
  const [cryptoAddress, setCryptoAddress] = useState<string>("")
  const [cryptoAmount, setCryptoAmount] = useState<string>("")
  const [cryptoLabel, setCryptoLabel] = useState<string>("")

  // App Store fields
  const [appPlatform, setAppPlatform] = useState<'ios' | 'android'>('ios')
  const [appId, setAppId] = useState<string>("")

  // Social Media fields
  const [socialPlatform, setSocialPlatform] = useState<string>('twitter')
  const [socialUsername, setSocialUsername] = useState<string>("")

  // Location fields
  const [locationLat, setLocationLat] = useState<string>("")
  const [locationLng, setLocationLng] = useState<string>("")
  const [locationLabel, setLocationLabel] = useState<string>("")

  // Advanced styling
  const [finderPattern, setFinderPattern] = useState<FinderPattern>("square")
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none")
  const [frameText, setFrameText] = useState<string>("")
  const [transparentBg, setTransparentBg] = useState<boolean>(false)
  const [gradientEnabled, setGradientEnabled] = useState<boolean>(false)
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [gradientColorStart, setGradientColorStart] = useState<string>("#667eea")
  const [gradientColorEnd, setGradientColorEnd] = useState<string>("#764ba2")
  const [gradientRotation, setGradientRotation] = useState<number>(45)

  // Pet ID advanced toggle
  const [showPetAdvanced, setShowPetAdvanced] = useState<boolean>(false)

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory())
  }, [])

  // Auto-switch to Low error correction when switching TO Pet ID (they have more data)
  // But allow user to change it afterwards
  useEffect(() => {
    if (qrType === 'pet') {
      setErrorLevel('L')
    }
  }, [qrType])

  useEffect(() => {
    let newContent = ""

    switch (qrType) {
      case "url":
        newContent = url
        break
      case "wifi":
        if (wifiSsid) {
          newContent = generateWiFiString(wifiSsid, wifiPassword, wifiEncryption)
        }
        break
      case "vcard":
        if (vcardFirstName || vcardLastName) {
          newContent = generateVCardString({
            firstName: vcardFirstName,
            lastName: vcardLastName,
            phone: vcardPhone,
            email: vcardEmail,
            organization: vcardOrg,
            website: vcardWebsite,
          })
        }
        break
      case "email":
        if (emailAddress) {
          newContent = generateEmailString(emailAddress, emailSubject, emailBody)
        }
        break
      case "sms":
        if (smsPhone) {
          newContent = generateSMSString(smsPhone, smsMessage)
        }
        break
      case "phone":
        newContent = generatePhoneString(phoneNumber)
        break
      case "text":
        newContent = plainText
        break
      case "pet":
        if (petName) {
          try {
            const petData = {
              name: petName,
              species: petSpecies,
              breed: petBreed,
              color: petColor,
              age: petAge,
              microchip: petMicrochip,
              medical: petMedical,
              contacts: petContacts.filter(c => c.name || c.phone),
              customFields: petCustomFields.filter(f => f.label && f.value),
              reward: petReward,
            }
            // Create URL to pet viewer page with encoded data
            // Use encodeURIComponent to handle special characters safely
            const jsonString = JSON.stringify(petData)
            const encodedData = btoa(encodeURIComponent(jsonString))
            newContent = `${typeof window !== 'undefined' ? window.location.origin : 'https://qrgen.newbold.cloud'}/pet#${encodedData}`
          } catch (error) {
            console.error("Error encoding pet data:", error)
            newContent = ""
          }
        }
        break
      case "calendar":
        if (calendarTitle && calendarStart && calendarEnd) {
          newContent = generateCalendarString({
            title: calendarTitle,
            location: calendarLocation,
            startDate: calendarStart,
            endDate: calendarEnd,
            description: calendarDescription,
          })
        }
        break
      case "crypto":
        if (cryptoAddress) {
          newContent = generateCryptoString(cryptoAddress, cryptoAmount, cryptoLabel)
        }
        break
      case "app":
        if (appId) {
          newContent = generateAppStoreString(appPlatform, appId)
        }
        break
      case "social":
        if (socialUsername) {
          newContent = generateSocialMediaString(socialPlatform, socialUsername)
        }
        break
      case "location":
        if (locationLat && locationLng) {
          newContent = generateLocationString(locationLat, locationLng, locationLabel)
        }
        break
    }

    setContent(newContent)
  }, [qrType, url, wifiSsid, wifiPassword, wifiEncryption, vcardFirstName, vcardLastName,
      vcardPhone, vcardEmail, vcardOrg, vcardWebsite, emailAddress, emailSubject, emailBody,
      smsPhone, smsMessage, phoneNumber, plainText, petName, petSpecies, petBreed, petColor,
      petAge, petMicrochip, petMedical, petContacts, petCustomFields, petReward,
      calendarTitle, calendarLocation, calendarStart, calendarEnd, calendarDescription,
      cryptoAddress, cryptoAmount, cryptoLabel, appPlatform, appId,
      socialPlatform, socialUsername, locationLat, locationLng, locationLabel])

  const generateQR = useCallback(async () => {
    if (!content) {
      setSizeWarning("")
      return
    }

    // Check data size
    const dataSize = estimateQRDataSize(content)
    const maxCapacity = getQRCodeCapacity(errorLevel)

    if (dataSize > maxCapacity) {
      setSizeWarning(`QR code data (${dataSize} bytes) exceeds ${errorLevel} error correction limit (${maxCapacity} bytes). Try reducing the amount of information or use Low error correction.`)
      setQrDataUrl("")
      setQrSvg("")
      return
    }

    setSizeWarning("")

    try {
      const gradientConfig: GradientConfig = {
        enabled: gradientEnabled,
        type: gradientType,
        colorStart: gradientColorStart,
        colorEnd: gradientColorEnd,
        rotation: gradientRotation,
      };

      const options: QRCodeOptions = {
        content,
        errorCorrectionLevel: errorLevel,
        size,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        margin,
        logoUrl: logoUrl || undefined,
        style: qrStyle,
        gradient: gradientConfig,
        finderPattern,
        frameStyle,
        frameText: frameText || undefined,
        transparentBackground: transparentBg,
      }

      const result = await generateQRCode(options)
      setQrDataUrl(result.dataUrl)
      setQrSvg(result.svg)

      // Save to history
      saveToHistory({
        type: qrType,
        content,
        preview: result.dataUrl,
        options: {
          errorLevel,
          size,
          fgColor,
          bgColor,
          margin,
          style: qrStyle,
        },
      })

      // Refresh history
      setHistory(getHistory())
    } catch (error: any) {
      console.error("Error generating QR code:", error)
      if (error?.message?.includes('too big')) {
        setSizeWarning("QR code data is too large. Try reducing the amount of information.")
      }
    }
  }, [content, errorLevel, size, fgColor, bgColor, margin, logoUrl, qrStyle, qrType,
      gradientEnabled, gradientType, gradientColorStart, gradientColorEnd, gradientRotation,
      finderPattern, frameStyle, frameText, transparentBg])

  useEffect(() => {
    if (content) {
      generateQR()
    }
  }, [content, generateQR])

  const downloadQR = (format: "png" | "svg" | "pdf") => {
    if (format === "png" && qrDataUrl) {
      const link = document.createElement("a")
      link.href = qrDataUrl
      link.download = `qrcode-${Date.now()}.png`
      link.click()
    } else if (format === "svg" && qrSvg) {
      const blob = new Blob([qrSvg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `qrcode-${Date.now()}.svg`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === "pdf" && qrDataUrl) {
      generatePDF(qrDataUrl, `qrcode-${Date.now()}.pdf`)
    }
  }

  const loadFromHistory = (item: QRHistoryItem) => {
    // Set options
    setErrorLevel(item.options.errorLevel as ErrorCorrectionLevel)
    setSize(item.options.size)
    setFgColor(item.options.fgColor)
    setBgColor(item.options.bgColor)
    setMargin(item.options.margin)
    if (item.options.style) {
      setQrStyle(item.options.style as QRStyle)
    }

    // Set type and content
    setQrType(item.type)
    // Note: This will set the raw content, user will see the QR but not the individual fields
    // For a full implementation, we'd need to store and restore all field values
    setShowHistory(false)
  }

  const handleDeleteHistoryItem = (id: string) => {
    deleteHistoryItem(id)
    setHistory(getHistory())
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory()
      setHistory([])
    }
  }

  const openPrintView = () => {
    if (qrDataUrl) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: white;
                }
                img {
                  max-width: 90%;
                  height: auto;
                }
                @media print {
                  body {
                    margin: 0;
                  }
                  img {
                    max-width: 100%;
                    page-break-after: avoid;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${qrDataUrl}" alt="QR Code" />
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => printWindow.print(), 250)
      }
    }
  }

  const loadExample = () => {
    switch (qrType) {
      case 'url':
        setUrl('https://qrgen.newbold.cloud')
        break
      case 'text':
        setPlainText('Hello, World! This is a sample QR code.')
        break
      case 'wifi':
        setWifiSsid('MyHomeWiFi')
        setWifiPassword('SecurePassword123')
        setWifiEncryption('WPA')
        break
      case 'vcard':
        setVcardFirstName('John')
        setVcardLastName('Doe')
        setVcardPhone('+1234567890')
        setVcardEmail('john.doe@example.com')
        setVcardOrg('Acme Corporation')
        setVcardWebsite('https://example.com')
        break
      case 'email':
        setEmailAddress('contact@example.com')
        setEmailSubject('Hello from QR Code')
        setEmailBody('This email was triggered by scanning a QR code!')
        break
      case 'sms':
        setSmsPhone('+1234567890')
        setSmsMessage('Hello from QR Code!')
        break
      case 'phone':
        setPhoneNumber('+1234567890')
        break
      case 'pet':
        setPetName('Buddy')
        setPetSpecies('Dog')
        setPetBreed('Golden Retriever')
        setPetColor('Golden')
        setPetAge('3 years')
        setPetMicrochip('123456789')
        setPetMedical('No known allergies')
        setPetContacts([{
          name: 'Jane Doe',
          phone: '+1234567890',
          email: 'jane@example.com',
          relation: 'Owner'
        }])
        setPetReward('$100 reward if found')
        break
      case 'calendar':
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(14, 0, 0, 0)
        const end = new Date(tomorrow)
        end.setHours(15, 0, 0, 0)
        setCalendarTitle('Team Meeting')
        setCalendarLocation('Conference Room A')
        setCalendarStart(tomorrow.toISOString().slice(0, 16))
        setCalendarEnd(end.toISOString().slice(0, 16))
        setCalendarDescription('Discuss Q4 goals and project updates')
        break
      case 'crypto':
        setCryptoAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
        setCryptoAmount('0.001')
        setCryptoLabel('Donation')
        break
      case 'app':
        if (appPlatform === 'ios') {
          setAppId('310633997')
        } else {
          setAppId('com.whatsapp')
        }
        break
      case 'social':
        setSocialUsername('username')
        break
      case 'location':
        setLocationLat('37.7749')
        setLocationLng('-122.4194')
        setLocationLabel('San Francisco, CA')
        break
    }
  }

  const applySizePreset = (preset: string) => {
    switch (preset) {
      case 'business':
        setSize(300) // 1" at 300 DPI
        break
      case 'flyer':
        setSize(900) // 3" at 300 DPI
        break
      case 'poster':
        setSize(1800) // 6" at 300 DPI
        break
      case 'tshirt':
        setSize(3000) // 10" at 300 DPI (high res for printing)
        break
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Create beautiful, customizable QR codes for free</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>QR Code Type</CardTitle>
                <CardDescription>Choose what type of QR code to generate</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadExample}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Example
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={qrType} onValueChange={setQrType}>
                <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-2 h-auto">
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    <span className="hidden sm:inline">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center gap-1">
                    <Music className="h-4 w-4" />
                    <span className="hidden sm:inline">Social</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Map</span>
                  </TabsTrigger>
                  <TabsTrigger value="pet" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Pet ID</span>
                  </TabsTrigger>
                  <TabsTrigger value="wifi" className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">WiFi</span>
                  </TabsTrigger>
                  <TabsTrigger value="vcard" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">vCard</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">SMS</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Phone</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Event</span>
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span className="hidden sm:inline">Crypto</span>
                  </TabsTrigger>
                  <TabsTrigger value="app" className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden sm:inline">App</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="text">Plain Text</Label>
                    <Input
                      id="text"
                      placeholder="Enter any text"
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="wifi" className="space-y-4">
                  <div>
                    <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                    <Input
                      id="wifi-ssid"
                      placeholder="My WiFi Network"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wifi-password">Password</Label>
                    <Input
                      id="wifi-password"
                      type="password"
                      placeholder="WiFi password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wifi-encryption">Encryption</Label>
                    <Select
                      id="wifi-encryption"
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as "WPA" | "WEP" | "nopass")}
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Password</option>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="vcard" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vcard-firstname">First Name</Label>
                      <Input
                        id="vcard-firstname"
                        placeholder="John"
                        value={vcardFirstName}
                        onChange={(e) => setVcardFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vcard-lastname">Last Name</Label>
                      <Input
                        id="vcard-lastname"
                        placeholder="Doe"
                        value={vcardLastName}
                        onChange={(e) => setVcardLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vcard-phone">Phone</Label>
                    <Input
                      id="vcard-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcard-email">Email</Label>
                    <Input
                      id="vcard-email"
                      type="email"
                      placeholder="john@example.com"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcard-org">Organization</Label>
                    <Input
                      id="vcard-org"
                      placeholder="Company Name"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcard-website">Website</Label>
                    <Input
                      id="vcard-website"
                      type="url"
                      placeholder="https://example.com"
                      value={vcardWebsite}
                      onChange={(e) => setVcardWebsite(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="contact@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-subject">Subject (optional)</Label>
                    <Input
                      id="email-subject"
                      placeholder="Email subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-body">Message (optional)</Label>
                    <Input
                      id="email-body"
                      placeholder="Email body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div>
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-message">Message (optional)</Label>
                    <Input
                      id="sms-message"
                      placeholder="SMS message"
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pet" className="space-y-4">
                  <div className="space-y-4">
                    {/* Essential Fields */}
                    <div>
                      <Label htmlFor="pet-name">Pet Name *</Label>
                      <Input
                        id="pet-name"
                        placeholder="Buddy"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                      />
                    </div>

                    {/* Primary Contact Info */}
                    <div>
                      <Label htmlFor="contact-name-0">Owner/Contact Name</Label>
                      <Input
                        id="contact-name-0"
                        placeholder="John Doe"
                        value={petContacts[0]?.name || ""}
                        onChange={(e) => {
                          const newContacts = [...petContacts]
                          if (!newContacts[0]) newContacts[0] = {name: "", phone: "", email: "", relation: "Owner"}
                          newContacts[0].name = e.target.value
                          setPetContacts(newContacts)
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-phone-0">Phone to Call/Text</Label>
                      <Input
                        id="contact-phone-0"
                        type="tel"
                        placeholder="+1234567890"
                        value={petContacts[0]?.phone || ""}
                        onChange={(e) => {
                          const newContacts = [...petContacts]
                          if (!newContacts[0]) newContacts[0] = {name: "", phone: "", email: "", relation: "Owner"}
                          newContacts[0].phone = e.target.value
                          setPetContacts(newContacts)
                        }}
                      />
                    </div>

                    {/* One Custom Field */}
                    <div>
                      <Label>Custom Field (Optional)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Label (e.g., Favorite Toy)"
                          value={petCustomFields[0]?.label || ""}
                          onChange={(e) => {
                            const newFields = [...petCustomFields]
                            if (!newFields[0]) newFields[0] = {label: "", value: ""}
                            newFields[0].label = e.target.value
                            setPetCustomFields(newFields)
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={petCustomFields[0]?.value || ""}
                          onChange={(e) => {
                            const newFields = [...petCustomFields]
                            if (!newFields[0]) newFields[0] = {label: "", value: ""}
                            newFields[0].value = e.target.value
                            setPetCustomFields(newFields)
                          }}
                        />
                      </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="border-t pt-4">
                      <Button
                        type="button"
                        variant={showPetAdvanced ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowPetAdvanced(!showPetAdvanced)}
                        className="w-full"
                      >
                        {showPetAdvanced ? "Hide" : "Show"} Advanced Options
                      </Button>
                      {!showPetAdvanced && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Keep it simple for better scanning reliability
                        </p>
                      )}
                    </div>

                    {/* Advanced Fields - Warning + All Extra Options */}
                    {showPetAdvanced && (
                      <div className="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-4 bg-amber-50/50 dark:bg-amber-950/20">
                        <div className="flex items-start gap-2 mb-4">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Warning: More Data = Harder to Scan</p>
                            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                              Adding more information increases QR code complexity and reduces error correction.
                              Only add essential details for best scanning reliability.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pet-species">Species</Label>
                            <Input
                              id="pet-species"
                              placeholder="Dog, Cat, etc."
                              value={petSpecies}
                              onChange={(e) => setPetSpecies(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pet-breed">Breed</Label>
                            <Input
                              id="pet-breed"
                              placeholder="Golden Retriever"
                              value={petBreed}
                              onChange={(e) => setPetBreed(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pet-color">Color/Markings</Label>
                            <Input
                              id="pet-color"
                              placeholder="Golden, white chest"
                              value={petColor}
                              onChange={(e) => setPetColor(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pet-age">Age</Label>
                            <Input
                              id="pet-age"
                              placeholder="3 years"
                              value={petAge}
                              onChange={(e) => setPetAge(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pet-microchip">Microchip #</Label>
                            <Input
                              id="pet-microchip"
                              placeholder="123456789"
                              value={petMicrochip}
                              onChange={(e) => setPetMicrochip(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pet-reward">Reward</Label>
                            <Input
                              id="pet-reward"
                              placeholder="$100 if found"
                              value={petReward}
                              onChange={(e) => setPetReward(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="pet-medical">Medical Info / Allergies</Label>
                          <Input
                            id="pet-medical"
                            placeholder="Allergic to peanuts, takes heart medication"
                            value={petMedical}
                            onChange={(e) => setPetMedical(e.target.value)}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label>Additional Contacts</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setPetContacts([...petContacts, {name: "", phone: "", email: "", relation: ""}])}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>

                          {petContacts.slice(1).map((contact, index) => (
                            <div key={index + 1} className="space-y-2 mb-4 p-3 border rounded-lg relative bg-white dark:bg-gray-900">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={() => setPetContacts(petContacts.filter((_, i) => i !== index + 1))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Name"
                                  value={contact.name}
                                  onChange={(e) => {
                                    const newContacts = [...petContacts]
                                    newContacts[index + 1].name = e.target.value
                                    setPetContacts(newContacts)
                                  }}
                                />
                                <Input
                                  placeholder="Phone"
                                  type="tel"
                                  value={contact.phone}
                                  onChange={(e) => {
                                    const newContacts = [...petContacts]
                                    newContacts[index + 1].phone = e.target.value
                                    setPetContacts(newContacts)
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label>More Custom Fields</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setPetCustomFields([...petCustomFields, {label: "", value: ""}])}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>

                          {petCustomFields.slice(1).map((field, index) => (
                            <div key={index + 1} className="grid grid-cols-2 gap-2 mb-3">
                              <Input
                                placeholder="Label"
                                value={field.label}
                                onChange={(e) => {
                                  const newFields = [...petCustomFields]
                                  newFields[index + 1].label = e.target.value
                                  setPetCustomFields(newFields)
                                }}
                              />
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Value"
                                  value={field.value}
                                  onChange={(e) => {
                                    const newFields = [...petCustomFields]
                                    newFields[index + 1].value = e.target.value
                                    setPetCustomFields(newFields)
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPetCustomFields(petCustomFields.filter((_, i) => i !== index + 1))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                  <div>
                    <Label htmlFor="calendar-title">Event Title *</Label>
                    <Input
                      id="calendar-title"
                      placeholder="Team Meeting"
                      value={calendarTitle}
                      onChange={(e) => setCalendarTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="calendar-location">Location</Label>
                    <Input
                      id="calendar-location"
                      placeholder="Conference Room A"
                      value={calendarLocation}
                      onChange={(e) => setCalendarLocation(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calendar-start">Start Date/Time *</Label>
                      <Input
                        id="calendar-start"
                        type="datetime-local"
                        value={calendarStart}
                        onChange={(e) => setCalendarStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="calendar-end">End Date/Time *</Label>
                      <Input
                        id="calendar-end"
                        type="datetime-local"
                        value={calendarEnd}
                        onChange={(e) => setCalendarEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="calendar-description">Description</Label>
                    <Input
                      id="calendar-description"
                      placeholder="Discuss Q4 goals"
                      value={calendarDescription}
                      onChange={(e) => setCalendarDescription(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="crypto" className="space-y-4">
                  <div>
                    <Label htmlFor="crypto-address">Wallet Address *</Label>
                    <Input
                      id="crypto-address"
                      placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh (Bitcoin) or 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (Ethereum)"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crypto-amount">Amount (optional)</Label>
                    <Input
                      id="crypto-amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.001"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crypto-label">Label (optional)</Label>
                    <Input
                      id="crypto-label"
                      placeholder="Donation to..."
                      value={cryptoLabel}
                      onChange={(e) => setCryptoLabel(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports Bitcoin and Ethereum addresses. Address format is auto-detected.
                  </p>
                </TabsContent>

                <TabsContent value="app" className="space-y-4">
                  <div>
                    <Label htmlFor="app-platform">Platform</Label>
                    <Select
                      id="app-platform"
                      value={appPlatform}
                      onChange={(e) => setAppPlatform(e.target.value as 'ios' | 'android')}
                    >
                      <option value="ios">iOS (App Store)</option>
                      <option value="android">Android (Google Play)</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="app-id">App ID *</Label>
                    <Input
                      id="app-id"
                      placeholder={appPlatform === 'ios' ? '123456789 (numeric ID)' : 'com.example.app (package name)'}
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appPlatform === 'ios'
                      ? 'Find the App ID in your app\'s App Store URL: apps.apple.com/app/id[YOUR-ID]'
                      : 'Use your app\'s package name (e.g., com.example.myapp)'}
                  </p>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div>
                    <Label htmlFor="social-platform">Platform</Label>
                    <Select
                      id="social-platform"
                      value={socialPlatform}
                      onChange={(e) => setSocialPlatform(e.target.value)}
                    >
                      <option value="twitter">Twitter / X</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="social-username">Username / Profile *</Label>
                    <Input
                      id="social-username"
                      placeholder="@username or profile URL"
                      value={socialUsername}
                      onChange={(e) => setSocialUsername(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your username (with or without @) or full profile URL
                  </p>
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location-lat">Latitude *</Label>
                      <Input
                        id="location-lat"
                        type="number"
                        step="any"
                        placeholder="37.7749"
                        value={locationLat}
                        onChange={(e) => setLocationLat(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-lng">Longitude *</Label>
                      <Input
                        id="location-lng"
                        type="number"
                        step="any"
                        placeholder="-122.4194"
                        value={locationLng}
                        onChange={(e) => setLocationLng(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location-label">Location Name (optional)</Label>
                    <Input
                      id="location-label"
                      placeholder="San Francisco, CA"
                      value={locationLabel}
                      onChange={(e) => setLocationLabel(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creates a Google Maps link. Find coordinates by right-clicking on Google Maps.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Customize your QR code appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="error-level">Error Correction Level</Label>
                  <div className="group relative">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-3 bg-popover text-popover-foreground border rounded-lg shadow-lg z-10">
                      <p className="text-sm font-semibold mb-2">Error Correction Levels</p>
                      <p className="text-xs mb-2">QR codes can still work even if partially damaged or dirty:</p>
                      <ul className="text-xs space-y-1">
                        <li><strong>Low (7%):</strong> Maximum data capacity, best for clean surfaces</li>
                        <li><strong>Medium (15%):</strong> Good balance - recommended default</li>
                        <li><strong>Quartile (25%):</strong> Better damage resistance, good for outdoor use</li>
                        <li><strong>High (30%):</strong> Best damage resistance, ideal when adding logos</li>
                      </ul>
                      <p className="text-xs mt-2 text-muted-foreground">Higher correction = less data capacity but more damage resistance</p>
                    </div>
                  </div>
                </div>
                <Select
                  id="error-level"
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                >
                  <option value="L">Low (7%) - Maximum Data</option>
                  <option value="M">Medium (15%) - Recommended</option>
                  <option value="Q">Quartile (25%) - Outdoor Use</option>
                  <option value="H">High (30%) - Best with Logos</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="qr-style">QR Code Style</Label>
                <Select
                  id="qr-style"
                  value={qrStyle}
                  onChange={(e) => setQrStyle(e.target.value as QRStyle)}
                >
                  <option value="squares">Squares (Classic)</option>
                  <option value="dots">Dots (Rounded)</option>
                  <option value="rounded">Rounded Squares</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="finder-pattern">Corner Pattern</Label>
                <Select
                  id="finder-pattern"
                  value={finderPattern}
                  onChange={(e) => setFinderPattern(e.target.value as FinderPattern)}
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="extra-rounded">Extra Rounded</option>
                </Select>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Size Presets</Label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => applySizePreset('business')}>
                    Business Card
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applySizePreset('flyer')}>
                    Flyer
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applySizePreset('poster')}>
                    Poster
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applySizePreset('tshirt')}>
                    T-Shirt
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="size">Size: {size}px</Label>
                <Slider
                  id="size"
                  value={size}
                  onValueChange={setSize}
                  min={200}
                  max={1000}
                  step={50}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fg-color">Foreground Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fg-color"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="margin">Margin: {margin}</Label>
                <Slider
                  id="margin"
                  value={margin}
                  onValueChange={setMargin}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="transparent-bg"
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="transparent-bg" className="cursor-pointer">Transparent Background</Label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="gradient-enabled"
                    type="checkbox"
                    checked={gradientEnabled}
                    onChange={(e) => setGradientEnabled(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="gradient-enabled" className="cursor-pointer">Enable Gradient</Label>
                </div>
                {gradientEnabled && (
                  <div className="space-y-3 pl-6 border-l-2">
                    <div>
                      <Label htmlFor="gradient-type">Gradient Type</Label>
                      <Select
                        id="gradient-type"
                        value={gradientType}
                        onChange={(e) => setGradientType(e.target.value as 'linear' | 'radial')}
                      >
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gradient-start">Start Color</Label>
                        <Input
                          id="gradient-start"
                          type="color"
                          value={gradientColorStart}
                          onChange={(e) => setGradientColorStart(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gradient-end">End Color</Label>
                        <Input
                          id="gradient-end"
                          type="color"
                          value={gradientColorEnd}
                          onChange={(e) => setGradientColorEnd(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>
                    {gradientType === 'linear' && (
                      <div>
                        <Label htmlFor="gradient-rotation">Rotation: {gradientRotation}°</Label>
                        <Slider
                          id="gradient-rotation"
                          value={gradientRotation}
                          onValueChange={setGradientRotation}
                          min={0}
                          max={360}
                          step={15}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label>Frame & Text</Label>
                <div>
                  <Label htmlFor="frame-style">Frame Style</Label>
                  <Select
                    id="frame-style"
                    value={frameStyle}
                    onChange={(e) => setFrameStyle(e.target.value as FrameStyle)}
                  >
                    <option value="none">None</option>
                    <option value="simple">Simple</option>
                    <option value="rounded">Rounded</option>
                    <option value="banner">Banner</option>
                  </Select>
                </div>
                {frameStyle !== 'none' && (
                  <div>
                    <Label htmlFor="frame-text">Frame Text</Label>
                    <Input
                      id="frame-text"
                      placeholder="Scan Me!"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      maxLength={30}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label>{qrType === 'pet' ? 'Add Image (Optional - Add Last)' : 'Logo (Optional - Add Last)'}</Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="logo-file" className="text-sm font-normal text-muted-foreground">
                      Upload Image
                    </Label>
                    <Input
                      id="logo-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Higher quality for logo since it's just overlaid, not encoded in QR data
                          compressImage(file, 300, 300, 0.9)
                            .then((compressed) => {
                              setLogoUrl(compressed)
                            })
                            .catch((error) => {
                              console.error('Error compressing image:', error)
                              alert('Failed to compress image. Please try a different image.')
                            })
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 border-t" />
                  </div>
                  <div>
                    <Label htmlFor="logo-url" className="text-sm font-normal text-muted-foreground">
                      Image URL
                    </Label>
                    <Input
                      id="logo-url"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </div>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLogoUrl("")}
                      className="w-full"
                    >
                      {qrType === 'pet' ? 'Clear Image' : 'Clear Logo'}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {qrType === 'pet'
                    ? 'Upload last - Image appears in center of QR code'
                    : 'Upload last - Logo appears in center (works best with high error correction)'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Your generated QR code</CardDescription>
            </CardHeader>
            <CardContent>
              {sizeWarning && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">QR Code Too Large</p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{sizeWarning}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center justify-center space-y-4">
                {qrDataUrl ? (
                  <>
                    <div className="p-8 bg-white rounded-lg shadow-lg">
                      <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={() => downloadQR("png")} className="gap-2">
                        <Download className="h-4 w-4" />
                        PNG
                      </Button>
                      <Button onClick={() => downloadQR("svg")} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        SVG
                      </Button>
                      <Button onClick={() => downloadQR("pdf")} variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button onClick={openPrintView} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Enter some content to generate a QR code</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>History</CardTitle>
                <CardDescription>Your recently generated QR codes</CardDescription>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No history yet</p>
                  <p className="text-xs">Generated QR codes will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer group"
                      onClick={() => loadFromHistory(item)}
                    >
                      <img
                        src={item.preview}
                        alt="QR Preview"
                        className="w-16 h-16 rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">{item.type}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteHistoryItem(item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This QR code generator is completely free to use and doesn&apos;t require any registration.
                All QR codes are generated in your browser - no data is sent to any server.
              </p>
              <p>
                <strong>Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>13 QR code types (URL, Text, Social Media, Location/Maps, Pet ID, WiFi, vCard, Email, SMS, Phone, Calendar Events, Cryptocurrency, App Store)</li>
                <li>3 QR visual styles (Squares, Dots, Rounded)</li>
                <li>4 custom corner patterns (Square, Rounded, Dots, Extra Rounded)</li>
                <li>Gradient support (Linear & Radial)</li>
                <li>Frame styles with custom text</li>
                <li>Transparent background option</li>
                <li>Size presets (Business Card, Flyer, Poster, T-Shirt)</li>
                <li>Customizable colors, sizes, and margins</li>
                <li>Adjustable error correction levels</li>
                <li>Logo embedding support</li>
                <li>Download as PNG, SVG, or PDF</li>
                <li>Print-optimized view</li>
                <li>Local history (last 10 QR codes)</li>
                <li>Quick example templates</li>
                <li>100% client-side - no server uploads</li>
                <li>No tracking, no ads, completely free</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
