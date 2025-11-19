"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Search, X, Wifi, Mail, Phone, User, Link2, MapPin, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: any
  preview: string
  config: any
}

const TEMPLATES: Template[] = [
  {
    id: 'wifi-restaurant',
    name: 'Restaurant WiFi',
    description: 'Share your WiFi with customers',
    category: 'WiFi',
    icon: Wifi,
    preview: '📶 Guest WiFi',
    config: { type: 'wifi', ssid: 'Restaurant-WiFi', security: 'WPA' }
  },
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Professional contact vCard',
    category: 'Contact',
    icon: User,
    preview: '👤 John Doe',
    config: { type: 'vcard', name: 'John Doe', title: 'CEO' }
  },
  {
    id: 'website-link',
    name: 'Website Link',
    description: 'Direct link to your website',
    category: 'URL',
    icon: Link2,
    preview: '🌐 Website',
    config: { type: 'url', url: 'https://example.com' }
  },
  {
    id: 'email-contact',
    name: 'Email Contact',
    description: 'Quick email composition',
    category: 'Email',
    icon: Mail,
    preview: '✉️ Contact Us',
    config: { type: 'email', email: 'contact@example.com', subject: 'Inquiry' }
  },
  {
    id: 'phone-call',
    name: 'Phone Call',
    description: 'One-tap phone dialing',
    category: 'Phone',
    icon: Phone,
    preview: '📞 Call Us',
    config: { type: 'phone', number: '+1234567890' }
  },
  {
    id: 'event-ticket',
    name: 'Event Ticket',
    description: 'Calendar event invitation',
    category: 'Event',
    icon: Calendar,
    preview: '📅 Conference 2025',
    config: { type: 'calendar', title: 'Event Name', location: 'Venue' }
  },
  {
    id: 'location-map',
    name: 'Location Map',
    description: 'GPS coordinates for navigation',
    category: 'Location',
    icon: MapPin,
    preview: '📍 Our Store',
    config: { type: 'location', latitude: '37.7749', longitude: '-122.4194' }
  },
]

interface TemplateGalleryProps {
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

export default function TemplateGallery({ onClose, onSelectTemplate }: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)))

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Template Gallery</CardTitle>
              <CardDescription>
                Start with a pre-made template for common QR code use cases
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mt-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template, index) => {
              const Icon = template.icon
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      onSelectTemplate(template)
                      onClose()
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {template.preview}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No templates found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
