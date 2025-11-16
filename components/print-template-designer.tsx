"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  PRINT_TEMPLATES,
  generateBusinessCard,
  generateNameBadge,
  generateEventTicket,
  type PrintTemplate,
} from "@/lib/print-templates"
import { Download, X, CreditCard, Badge, Ticket, Tag } from "lucide-react"

interface PrintTemplateDesignerProps {
  qrDataUrl: string;
  onClose: () => void;
}

export default function PrintTemplateDesigner({ qrDataUrl, onClose }: PrintTemplateDesignerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('business-card')
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate>(PRINT_TEMPLATES[0])

  // Business Card fields
  const [bcName, setBcName] = useState("")
  const [bcTitle, setBcTitle] = useState("")
  const [bcCompany, setBcCompany] = useState("")
  const [bcContact, setBcContact] = useState("")

  // Name Badge fields
  const [nbName, setNbName] = useState("")
  const [nbRole, setNbRole] = useState("")
  const [nbCompany, setNbCompany] = useState("")

  // Event Ticket fields
  const [etEvent, setEtEvent] = useState("")
  const [etDate, setEtDate] = useState("")
  const [etLocation, setEtLocation] = useState("")
  const [etTicket, setEtTicket] = useState("")

  const categoryTemplates = PRINT_TEMPLATES.filter(t => t.category === selectedCategory)

  const handleDownload = () => {
    let pdf;

    if (selectedCategory === 'business-card') {
      pdf = generateBusinessCard(qrDataUrl, bcName, bcTitle, bcCompany, bcContact)
    } else if (selectedCategory === 'name-badge') {
      pdf = generateNameBadge(qrDataUrl, nbName, nbCompany, nbRole)
    } else if (selectedCategory === 'ticket') {
      pdf = generateEventTicket(qrDataUrl, etEvent, etDate, etLocation, etTicket)
    }

    if (pdf) {
      pdf.save(`${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business-card': return <CreditCard className="h-5 w-5" />
      case 'name-badge': return <Badge className="h-5 w-5" />
      case 'ticket': return <Ticket className="h-5 w-5" />
      case 'label': return <Tag className="h-5 w-5" />
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Print-Ready Templates
              </CardTitle>
              <CardDescription>
                Create professional business cards, badges, and tickets with QR codes
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="grid grid-cols-4 gap-2">
            {['business-card', 'name-badge', 'ticket', 'label'].map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category)
                  const firstTemplate = PRINT_TEMPLATES.find(t => t.category === category)
                  if (firstTemplate) setSelectedTemplate(firstTemplate)
                }}
                className="gap-2"
              >
                {getCategoryIcon(category)}
                {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Button>
            ))}
          </div>

          {/* Template Selection */}
          <div>
            <Label>Template</Label>
            <Select
              value={selectedTemplate.id}
              onValueChange={(value) => {
                const template = PRINT_TEMPLATES.find(t => t.id === value)
                if (template) setSelectedTemplate(template)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.width}×{template.height}mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{selectedTemplate.description}</p>
          </div>

          {/* Preview */}
          <div className="border-2 border-dashed rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-center">
              <div
                className="bg-white shadow-lg border relative"
                style={{
                  width: `${Math.min(400, selectedTemplate.width * 3)}px`,
                  height: `${Math.min(400, selectedTemplate.height * 3)}px`,
                }}
              >
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="absolute"
                  style={{
                    width: '35%',
                    right: '5%',
                    top: '15%',
                  }}
                />
                <div className="absolute top-3 left-3">
                  <p className="text-xs text-muted-foreground">{selectedTemplate.width}×{selectedTemplate.height}mm @ {selectedTemplate.dpi} DPI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Fields */}
          <div className="space-y-4">
            <h3 className="font-medium">Content</h3>

            {selectedCategory === 'business-card' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={bcName} onChange={(e) => setBcName(e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={bcTitle} onChange={(e) => setBcTitle(e.target.value)} placeholder="CEO" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={bcCompany} onChange={(e) => setBcCompany(e.target.value)} placeholder="Acme Corp" />
                </div>
                <div>
                  <Label>Contact</Label>
                  <Input value={bcContact} onChange={(e) => setBcContact(e.target.value)} placeholder="email@company.com" />
                </div>
              </div>
            )}

            {selectedCategory === 'name-badge' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={nbName} onChange={(e) => setNbName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={nbRole} onChange={(e) => setNbRole(e.target.value)} placeholder="Speaker" />
                </div>
                <div className="col-span-2">
                  <Label>Company/Organization</Label>
                  <Input value={nbCompany} onChange={(e) => setNbCompany(e.target.value)} placeholder="Tech Conference 2024" />
                </div>
              </div>
            )}

            {selectedCategory === 'ticket' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Event Name</Label>
                  <Input value={etEvent} onChange={(e) => setEtEvent(e.target.value)} placeholder="Summer Music Festival" />
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input value={etDate} onChange={(e) => setEtDate(e.target.value)} placeholder="July 15, 2024 - 7:00 PM" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={etLocation} onChange={(e) => setEtLocation(e.target.value)} placeholder="Central Park" />
                </div>
                <div className="col-span-2">
                  <Label>Ticket Number</Label>
                  <Input value={etTicket} onChange={(e) => setEtTicket(e.target.value)} placeholder="001234" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1 gap-2" size="lg">
              <Download className="h-5 w-5" />
              Download Print-Ready PDF
            </Button>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Print Tips:</strong> PDFs are generated at {selectedTemplate.dpi} DPI for high-quality printing.
              Use professional printing services for best results. The QR code is sized for optimal scannability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
