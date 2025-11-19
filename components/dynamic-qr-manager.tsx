"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Edit, Trash2, Power, Clock, Lock, Eye, RefreshCw, ExternalLink } from "lucide-react"
import {
  getDynamicQRs,
  createDynamicQR,
  updateDynamicQRDestination,
  deleteDynamicQR,
  toggleDynamicQR,
  isDynamicQRValid,
  getDynamicQRRedirectURL,
  getDynamicQRStats,
  type DynamicQR
} from "@/lib/dynamic-qr"

interface DynamicQRManagerProps {
  onClose: () => void
  onGenerateQR: (url: string, name: string) => void
}

export default function DynamicQRManager({ onClose, onGenerateQR }: DynamicQRManagerProps) {
  const [qrs, setQRs] = useState<DynamicQR[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingQR, setEditingQR] = useState<DynamicQR | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDestination, setFormDestination] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formMaxScans, setFormMaxScans] = useState("")
  const [formExpireDays, setFormExpireDays] = useState("")

  useEffect(() => {
    loadQRs()
  }, [])

  const loadQRs = () => {
    setQRs(getDynamicQRs())
  }

  const handleCreate = () => {
    if (!formName.trim() || !formDestination.trim()) {
      toast.warning('Please enter a name and destination URL')
      return
    }

    const options: any = {}

    if (formPassword) {
      options.password = formPassword
    }

    if (formMaxScans) {
      options.maxScans = parseInt(formMaxScans, 10)
    }

    if (formExpireDays) {
      const days = parseInt(formExpireDays, 10)
      options.expiresAt = Date.now() + days * 24 * 60 * 60 * 1000
    }

    const newQR = createDynamicQR(formName, formDestination, options)

    // Generate QR code with redirect URL
    const redirectURL = getDynamicQRRedirectURL(newQR.shortCode)
    onGenerateQR(redirectURL, formName)

    resetForm()
    loadQRs()
  }

  const handleUpdate = () => {
    if (!editingQR || !formDestination.trim()) {
      toast.warning('Please enter a destination URL')
      return
    }

    updateDynamicQRDestination(editingQR.id, formDestination, 'Manual update')
    resetForm()
    loadQRs()
  }

  const resetForm = () => {
    setFormName("")
    setFormDestination("")
    setFormPassword("")
    setFormMaxScans("")
    setFormExpireDays("")
    setShowCreateForm(false)
    setEditingQR(null)
  }

  const handleEditDestination = (qr: DynamicQR) => {
    setEditingQR(qr)
    setFormDestination(qr.currentDestination)
    setShowCreateForm(true)
  }

  const handleDelete = (id: string) => {
    toast('Are you sure you want to delete this dynamic QR code?', {
      action: {
        label: 'Delete',
        onClick: () => {
          deleteDynamicQR(id)
          loadQRs()
          toast.success('Dynamic QR code deleted')
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    })
  }

  const handleToggle = (id: string) => {
    toggleDynamicQR(id)
    loadQRs()
  }

  const stats = getDynamicQRStats()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl my-8" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              <CardTitle>Dynamic QR Codes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Create QR codes with editable destinations - no reprinting needed!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total QRs</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalScans}</div>
                  <div className="text-xs text-muted-foreground">Total Scans</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.avgScansPerQR}</div>
                  <div className="text-xs text-muted-foreground">Avg/QR</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingQR ? 'Update Destination' : 'Create Dynamic QR Code'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editingQR && (
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="My Dynamic QR"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Destination URL *</Label>
                  <Input
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    {editingQR ? 'Update the destination - QR code stays the same!' : 'You can change this later without reprinting the QR code'}
                  </p>
                </div>

                {!editingQR && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Password (Optional)</Label>
                        <Input
                          type="password"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Max Scans (Optional)</Label>
                        <Input
                          type="number"
                          value={formMaxScans}
                          onChange={(e) => setFormMaxScans(e.target.value)}
                          placeholder="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expire in Days (Optional)</Label>
                        <Input
                          type="number"
                          value={formExpireDays}
                          onChange={(e) => setFormExpireDays(e.target.value)}
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={editingQR ? handleUpdate : handleCreate}>
                    {editingQR ? 'Update Destination' : 'Create & Generate QR'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Button */}
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Dynamic QR Code
            </Button>
          )}

          {/* QR List */}
          {qrs.length > 0 && (
            <div className="space-y-2">
              <Label>{qrs.length} Dynamic QR Codes</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {qrs.map((qr) => {
                  const validity = isDynamicQRValid(qr)

                  return (
                    <Card key={qr.id} className={!validity.valid ? 'opacity-50' : ''}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{qr.name}</h4>
                                <code className="text-xs bg-muted px-2 py-1 rounded">{qr.shortCode}</code>
                                {!qr.enabled && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Disabled</span>
                                )}
                                {qr.password && <Lock className="h-3 w-3 text-muted-foreground" />}
                                {qr.expiresAt && <Clock className="h-3 w-3 text-muted-foreground" />}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                <a href={qr.currentDestination} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                  {qr.currentDestination}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {qr.scanCount} scans • Updated {new Date(qr.updated).toLocaleDateString()}
                                {!validity.valid && <span className="text-red-600 ml-2">• {validity.reason}</span>}
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggle(qr.id)}
                                title={qr.enabled ? 'Disable' : 'Enable'}
                              >
                                <Power className={`h-4 w-4 ${qr.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDestination(qr)}
                                title="Edit Destination"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(qr.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {qr.history.length > 1 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                View history ({qr.history.length} changes)
                              </summary>
                              <div className="mt-2 space-y-1 pl-4 border-l-2">
                                {qr.history.slice(0, 5).map((entry, idx) => (
                                  <div key={idx} className="text-muted-foreground">
                                    <div>{new Date(entry.timestamp).toLocaleString()}</div>
                                    <div className="font-mono">{entry.destination}</div>
                                    {entry.reason && <div className="italic">Reason: {entry.reason}</div>}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {qrs.length === 0 && !showCreateForm && (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No dynamic QR codes yet.</p>
              <p className="text-sm">Create one to get started!</p>
            </div>
          )}

          {/* Info */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">How Dynamic QR Codes Work:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Each QR code gets a unique short URL</li>
                  <li>Update the destination anytime without reprinting</li>
                  <li>Set expiration dates, scan limits, and passwords</li>
                  <li>Track scans and view change history</li>
                </ul>
                <p className="text-xs text-muted-foreground italic mt-2">
                  Note: This demo stores data locally. For production use, you&apos;d need a backend redirect service.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
