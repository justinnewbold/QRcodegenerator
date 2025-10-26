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
  type ErrorCorrectionLevel,
  type QRCodeOptions,
} from "@/lib/qr-generator"
import { Download, QrCode, Wifi, Mail, Phone, MessageSquare, User, Link2, Heart, Plus, X } from "lucide-react"

export default function QRCodeGenerator() {
  const [qrType, setQrType] = useState<string>("url")
  const [content, setContent] = useState<string>("")
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [qrSvg, setQrSvg] = useState<string>("")

  // Customization options
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M")
  const [size, setSize] = useState<number>(300)
  const [fgColor, setFgColor] = useState<string>("#000000")
  const [bgColor, setBgColor] = useState<string>("#ffffff")
  const [margin, setMargin] = useState<number>(4)
  const [logoUrl, setLogoUrl] = useState<string>("")

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
  const [petPhoto, setPetPhoto] = useState<string>("")
  const [petContacts, setPetContacts] = useState<Array<{name: string, phone: string, email: string, relation: string}>>([
    {name: "", phone: "", email: "", relation: "Owner"}
  ])
  const [petCustomFields, setPetCustomFields] = useState<Array<{label: string, value: string}>>([])
  const [petReward, setPetReward] = useState<string>("")

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
          const petData = {
            name: petName,
            species: petSpecies,
            breed: petBreed,
            color: petColor,
            age: petAge,
            microchip: petMicrochip,
            medical: petMedical,
            photo: petPhoto,
            contacts: petContacts.filter(c => c.name || c.phone),
            customFields: petCustomFields.filter(f => f.label && f.value),
            reward: petReward,
          }
          // Create URL to pet viewer page with encoded data
          const encodedData = btoa(JSON.stringify(petData))
          newContent = `${typeof window !== 'undefined' ? window.location.origin : 'https://qrgen.newbold.cloud'}/pet#${encodedData}`
        }
        break
    }

    setContent(newContent)
  }, [qrType, url, wifiSsid, wifiPassword, wifiEncryption, vcardFirstName, vcardLastName,
      vcardPhone, vcardEmail, vcardOrg, vcardWebsite, emailAddress, emailSubject, emailBody,
      smsPhone, smsMessage, phoneNumber, plainText, petName, petSpecies, petBreed, petColor,
      petAge, petMicrochip, petMedical, petPhoto, petContacts, petCustomFields, petReward])

  const generateQR = useCallback(async () => {
    if (!content) return

    try {
      const options: QRCodeOptions = {
        content,
        errorCorrectionLevel: errorLevel,
        size,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        margin,
        logoUrl: logoUrl || undefined,
      }

      const result = await generateQRCode(options)
      setQrDataUrl(result.dataUrl)
      setQrSvg(result.svg)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }, [content, errorLevel, size, fgColor, bgColor, margin, logoUrl])

  useEffect(() => {
    if (content) {
      generateQR()
    }
  }, [content, generateQR])

  const downloadQR = (format: "png" | "svg") => {
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
            <CardHeader>
              <CardTitle>QR Code Type</CardTitle>
              <CardDescription>Choose what type of QR code to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={qrType} onValueChange={setQrType}>
                <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto">
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    <span className="hidden sm:inline">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Text</span>
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
                    <div>
                      <Label htmlFor="pet-photo">Pet Photo</Label>
                      <Input
                        id="pet-photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setPetPhoto(event.target?.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pet-name">Pet Name *</Label>
                        <Input
                          id="pet-name"
                          placeholder="Buddy"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pet-species">Species</Label>
                        <Input
                          id="pet-species"
                          placeholder="Dog, Cat, etc."
                          value={petSpecies}
                          onChange={(e) => setPetSpecies(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pet-breed">Breed</Label>
                        <Input
                          id="pet-breed"
                          placeholder="Golden Retriever"
                          value={petBreed}
                          onChange={(e) => setPetBreed(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pet-color">Color/Markings</Label>
                        <Input
                          id="pet-color"
                          placeholder="Golden, white chest"
                          value={petColor}
                          onChange={(e) => setPetColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pet-age">Age</Label>
                        <Input
                          id="pet-age"
                          placeholder="3 years"
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pet-microchip">Microchip #</Label>
                        <Input
                          id="pet-microchip"
                          placeholder="123456789"
                          value={petMicrochip}
                          onChange={(e) => setPetMicrochip(e.target.value)}
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

                    <div>
                      <Label htmlFor="pet-reward">Reward Info (optional)</Label>
                      <Input
                        id="pet-reward"
                        placeholder="$100 reward if found"
                        value={petReward}
                        onChange={(e) => setPetReward(e.target.value)}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Emergency Contacts</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPetContacts([...petContacts, {name: "", phone: "", email: "", relation: ""}])}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Contact
                        </Button>
                      </div>

                      {petContacts.map((contact, index) => (
                        <div key={index} className="space-y-3 mb-4 p-3 border rounded-lg relative">
                          {petContacts.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2"
                              onClick={() => setPetContacts(petContacts.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`contact-name-${index}`}>Name</Label>
                              <Input
                                id={`contact-name-${index}`}
                                placeholder="John Doe"
                                value={contact.name}
                                onChange={(e) => {
                                  const newContacts = [...petContacts]
                                  newContacts[index].name = e.target.value
                                  setPetContacts(newContacts)
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`contact-relation-${index}`}>Relation</Label>
                              <Input
                                id={`contact-relation-${index}`}
                                placeholder="Owner, Vet, etc."
                                value={contact.relation}
                                onChange={(e) => {
                                  const newContacts = [...petContacts]
                                  newContacts[index].relation = e.target.value
                                  setPetContacts(newContacts)
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`contact-phone-${index}`}>Phone</Label>
                              <Input
                                id={`contact-phone-${index}`}
                                type="tel"
                                placeholder="+1234567890"
                                value={contact.phone}
                                onChange={(e) => {
                                  const newContacts = [...petContacts]
                                  newContacts[index].phone = e.target.value
                                  setPetContacts(newContacts)
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`contact-email-${index}`}>Email</Label>
                              <Input
                                id={`contact-email-${index}`}
                                type="email"
                                placeholder="john@example.com"
                                value={contact.email}
                                onChange={(e) => {
                                  const newContacts = [...petContacts]
                                  newContacts[index].email = e.target.value
                                  setPetContacts(newContacts)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Custom Fields (optional)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPetCustomFields([...petCustomFields, {label: "", value: ""}])}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Field
                        </Button>
                      </div>

                      {petCustomFields.map((field, index) => (
                        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                          <Input
                            placeholder="Label (e.g., Favorite Toy)"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...petCustomFields]
                              newFields[index].label = e.target.value
                              setPetCustomFields(newFields)
                            }}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Value"
                              value={field.value}
                              onChange={(e) => {
                                const newFields = [...petCustomFields]
                                newFields[index].value = e.target.value
                                setPetCustomFields(newFields)
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setPetCustomFields(petCustomFields.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                <Label htmlFor="error-level">Error Correction Level</Label>
                <Select
                  id="error-level"
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </Select>
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

              <div className="space-y-3">
                <Label>Logo (optional)</Label>
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
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            setLogoUrl(event.target?.result as string)
                          }
                          reader.readAsDataURL(file)
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
                      Clear Logo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add a logo in the center (works best with high error correction)
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
              <div className="flex flex-col items-center justify-center space-y-4">
                {qrDataUrl ? (
                  <>
                    <div className="p-8 bg-white rounded-lg shadow-lg">
                      <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadQR("png")} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PNG
                      </Button>
                      <Button onClick={() => downloadQR("svg")} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download SVG
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
                <li>Multiple QR code types (URL, WiFi, vCard, Email, SMS, Phone, Text)</li>
                <li>Customizable colors and size</li>
                <li>Adjustable error correction levels</li>
                <li>Logo embedding support</li>
                <li>Download as PNG or SVG</li>
                <li>No tracking, no ads, completely free</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
