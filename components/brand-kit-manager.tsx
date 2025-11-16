"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getBrandKits,
  saveBrandKit,
  deleteBrandKit,
  duplicateBrandKit,
  updateBrandKit,
  getDefaultBrandKits,
  exportBrandKits,
  importBrandKits,
  type BrandKit
} from "@/lib/brand-kits"
import type { QRStyle, FinderPattern } from "@/lib/qr-generator"
import { X, Plus, Trash2, Copy, Download, Upload, Palette, Star, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BrandKitManagerProps {
  onClose: () => void
  onApplyKit: (kit: BrandKit) => void
}

export default function BrandKitManager({ onClose, onApplyKit }: BrandKitManagerProps) {
  const [kits, setKits] = useState<BrandKit[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formFgColor, setFormFgColor] = useState("#000000")
  const [formBgColor, setFormBgColor] = useState("#ffffff")
  const [formStyle, setFormStyle] = useState<QRStyle>('squares')
  const [formPattern, setFormPattern] = useState<FinderPattern>('square')

  useEffect(() => {
    loadKits()
  }, [])

  const loadKits = () => {
    setKits(getBrandKits())
  }

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Please enter a name for the brand kit')
      return
    }

    if (editingKit) {
      updateBrandKit(editingKit.id, {
        name: formName,
        description: formDescription,
        colors: { foreground: formFgColor, background: formBgColor },
        style: formStyle,
        finderPattern: formPattern,
      })
    } else {
      saveBrandKit({
        name: formName,
        description: formDescription,
        colors: { foreground: formFgColor, background: formBgColor },
        style: formStyle,
        finderPattern: formPattern,
      })
    }

    resetForm()
    loadKits()
  }

  const resetForm = () => {
    setFormName("")
    setFormDescription("")
    setFormFgColor("#000000")
    setFormBgColor("#ffffff")
    setFormStyle('squares')
    setFormPattern('square')
    setShowCreateForm(false)
    setEditingKit(null)
  }

  const handleEdit = (kit: BrandKit) => {
    setEditingKit(kit)
    setFormName(kit.name)
    setFormDescription(kit.description || "")
    setFormFgColor(kit.colors.foreground)
    setFormBgColor(kit.colors.background)
    setFormStyle(kit.style)
    setFormPattern(kit.finderPattern)
    setShowCreateForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this brand kit?')) {
      deleteBrandKit(id)
      loadKits()
    }
  }

  const handleDuplicate = (id: string) => {
    duplicateBrandKit(id)
    loadKits()
  }

  const handleApply = (kit: BrandKit) => {
    onApplyKit(kit)
    onClose()
  }

  const handleExport = () => {
    const json = exportBrandKits()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brand-kits-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const result = importBrandKits(json)
        alert(`Imported ${result.imported} brand kits. Skipped ${result.skipped} duplicates.`)
        loadKits()
      } catch (error) {
        alert('Error importing: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
    reader.readAsText(file)
  }

  const handleLoadDefault = (preset: Omit<BrandKit, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveBrandKit(preset)
    loadKits()
  }

  const filteredKits = searchQuery
    ? kits.filter(kit =>
        kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kit.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : kits

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6" />
              <CardTitle>Brand Kit Manager</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Save and reuse your brand colors, logos, and QR styles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Actions Bar */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brand kits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={kits.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-input')?.click()}>
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <input
                id="import-input"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Kit
              </Button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingKit ? 'Edit Brand Kit' : 'Create Brand Kit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="My Brand"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formFgColor}
                        onChange={(e) => setFormFgColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formFgColor}
                        onChange={(e) => setFormFgColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formBgColor}
                        onChange={(e) => setFormBgColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formBgColor}
                        onChange={(e) => setFormBgColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>QR Style</Label>
                    <Select value={formStyle} onValueChange={(v) => setFormStyle(v as QRStyle)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="squares">Squares</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Finder Pattern</Label>
                    <Select value={formPattern} onValueChange={(v) => setFormPattern(v as FinderPattern)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingKit ? 'Update' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Default Presets */}
          {kits.length === 0 && !showCreateForm && (
            <div className="space-y-2">
              <Label>Default Presets</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getDefaultBrandKits().map((preset, idx) => (
                  <div key={idx} className="border rounded-lg p-3 hover:bg-accent cursor-pointer" onClick={() => handleLoadDefault(preset)}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: preset.colors.foreground }} />
                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: preset.colors.background }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Kits List */}
          {filteredKits.length > 0 && (
            <div className="space-y-2">
              <Label>{filteredKits.length} Brand Kits</Label>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                {filteredKits.map((kit) => (
                  <div key={kit.id} className="border rounded-lg p-3 hover:bg-accent group">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: kit.colors.foreground }} />
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: kit.colors.background }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{kit.name}</div>
                        {kit.description && (
                          <div className="text-xs text-muted-foreground truncate">{kit.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {kit.style} • {kit.finderPattern}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleApply(kit)} title="Apply">
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(kit)} title="Edit">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicate(kit.id)} title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(kit.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredKits.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              No brand kits found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
