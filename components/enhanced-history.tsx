"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getHistory,
  deleteHistoryItem,
  toggleFavorite,
  updateHistoryItem,
  addTagToItem,
  removeTagFromItem,
  searchHistory,
  filterHistory,
  sortHistory,
  getAllTags,
  bulkDeleteHistory,
  exportHistoryToCSV,
  getHistoryStats,
  type QRHistoryItem,
} from "@/lib/qr-history"
import {
  Search,
  Star,
  StarOff,
  Trash2,
  Tag,
  Download,
  X,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  Edit2,
  Check,
  Plus,
} from "lucide-react"

interface EnhancedHistoryProps {
  onClose: () => void;
  onRestore?: (item: QRHistoryItem) => void;
}

export default function EnhancedHistory({ onClose, onRestore }: EnhancedHistoryProps) {
  const [history, setHistory] = useState<QRHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<QRHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [newTag, setNewTag] = useState("")
  const [selectedTagFilter, setSelectedTagFilter] = useState<string[]>([])
  const [showStats, setShowStats] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [searchQuery, selectedType, showFavoritesOnly, sortBy, sortOrder, selectedTagFilter, history])

  const loadHistory = () => {
    const data = getHistory()
    setHistory(data)
    setAllTags(getAllTags())
  }

  const applyFiltersAndSort = () => {
    let result = history

    // Search
    if (searchQuery) {
      result = searchHistory(searchQuery)
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType)
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter(item => item.favorite)
    }

    // Filter by tags
    if (selectedTagFilter.length > 0) {
      result = filterHistory({ tags: selectedTagFilter })
    }

    // Sort
    result = sortHistory(result, sortBy, sortOrder)

    setFilteredHistory(result)
  }

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id)
    loadHistory()
  }

  const handleDelete = (id: string) => {
    deleteHistoryItem(id)
    loadHistory()
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return

    toast(`Delete ${selectedIds.size} selected items?`, {
      action: {
        label: 'Delete',
        onClick: () => {
          bulkDeleteHistory(Array.from(selectedIds))
          setSelectedIds(new Set())
          loadHistory()
          toast.success(`Deleted ${selectedIds.size} items`)
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    })
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredHistory.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredHistory.map(item => item.id)))
    }
  }

  const handleStartEdit = (item: QRHistoryItem) => {
    setEditingId(item.id)
    setEditName(item.name || '')
    setEditNotes(item.notes || '')
  }

  const handleSaveEdit = () => {
    if (!editingId) return

    updateHistoryItem(editingId, {
      name: editName,
      notes: editNotes,
    })
    setEditingId(null)
    loadHistory()
  }

  const handleAddTag = (itemId: string) => {
    if (!newTag.trim()) return

    addTagToItem(itemId, newTag.trim())
    setNewTag("")
    loadHistory()
    setAllTags(getAllTags())
  }

  const handleRemoveTag = (itemId: string, tag: string) => {
    removeTagFromItem(itemId, tag)
    loadHistory()
    setAllTags(getAllTags())
  }

  const handleExportCSV = () => {
    const csv = exportHistoryToCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-history-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleTagFilter = (tag: string) => {
    setSelectedTagFilter(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const stats = getHistoryStats()
  const types = ['all', ...Object.keys(stats.byType)]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                History ({filteredHistory.length})
              </CardTitle>
              <CardDescription>
                Manage and organize your generated QR codes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Dashboard */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total QR Codes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.favorites}</div>
                <div className="text-xs text-muted-foreground">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.tagged}</div>
                <div className="text-xs text-muted-foreground">Tagged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.allTags.length}</div>
                <div className="text-xs text-muted-foreground">Unique Tags</div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.keys(stats.byType).map(type => (
                    <SelectItem key={type} value={type}>{type} ({stats.byType[type]})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTagFilter(tag)}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedTagFilter.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Sort and Bulk Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Label className="text-sm">Sort:</Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedIds.size === filteredHistory.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedIds.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.size})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* History Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map(item => (
              <Card key={item.id} className={`relative ${selectedIds.has(item.id) ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="cursor-pointer"
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(item.id)}
                      >
                        {item.favorite ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <CardTitle className="text-sm">{item.name || `${item.type} QR Code`}</CardTitle>
                      <CardDescription className="text-xs">{new Date(item.timestamp).toLocaleString()}</CardDescription>
                      {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="bg-white p-2 rounded">
                    <img src={item.preview} alt="QR Code" className="w-full" />
                  </div>

                  <div className="text-xs">
                    <span className="font-medium">Type:</span> {item.type}
                  </div>

                  <div className="text-xs break-all">
                    <span className="font-medium">Content:</span> {item.content.substring(0, 50)}
                    {item.content.length > 50 && '...'}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 rounded flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(item.id, tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex gap-1">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(item.id)}
                        className="h-6 text-xs w-20"
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleAddTag(item.id)} className="h-6 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {onRestore && (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => onRestore(item)}>
                      Restore
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No history items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
