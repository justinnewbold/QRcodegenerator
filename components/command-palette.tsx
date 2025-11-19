"use client"

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useEscapeKey } from '@/hooks/use-escape-key'
import {
  Link as LinkIcon,
  Type,
  Wifi,
  Mail,
  Phone,
  User,
  Calendar,
  Bitcoin,
  MapPin,
  Settings,
  History,
  Download,
  Palette,
  Search,
  MessageSquare
} from 'lucide-react'

interface CommandPaletteProps {
  onSelectQRType?: (type: string) => void
  onOpenHistory?: () => void
  onOpenSettings?: () => void
}

const QR_TYPES = [
  { value: 'url', label: 'URL', icon: LinkIcon },
  { value: 'text', label: 'Text', icon: Type },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'vcard', label: 'vCard', icon: User },
  { value: 'calendar', label: 'Calendar', icon: Calendar },
  { value: 'crypto', label: 'Crypto', icon: Bitcoin },
  { value: 'location', label: 'Location', icon: MapPin },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
]

export function CommandPalette({
  onSelectQRType,
  onOpenHistory,
  onOpenSettings
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)

  useEscapeKey(() => setOpen(false), open)

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl px-4">
        <Command
          className="rounded-lg border shadow-md bg-background"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="QR Code Types" className="mb-2">
              {QR_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <Command.Item
                    key={type.value}
                    value={type.value}
                    onSelect={() => {
                      onSelectQRType?.(type.value)
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    <span>Create {type.label} QR Code</span>
                  </Command.Item>
                )
              })}
            </Command.Group>

            <Command.Group heading="Actions" className="mb-2">
              <Command.Item
                value="history"
                onSelect={() => {
                  onOpenHistory?.()
                  setOpen(false)
                }}
                className="flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <History className="h-4 w-4" />
                <span>View History</span>
              </Command.Item>
              <Command.Item
                value="settings"
                onSelect={() => {
                  onOpenSettings?.()
                  setOpen(false)
                }}
                className="flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Settings className="h-4 w-4" />
                <span>Open Settings</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded">Esc</kbd> to close
          </div>
        </Command>
      </div>
    </div>
  )
}
