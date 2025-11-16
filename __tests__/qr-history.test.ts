import {
  saveToHistory,
  getHistory,
  clearHistory,
  toggleFavorite,
  searchHistory,
  getHistoryStats,
} from '@/lib/qr-history'

describe('QR History', () => {
  beforeEach(() => {
    clearHistory()
  })

  afterEach(() => {
    clearHistory()
  })

  describe('saveToHistory', () => {
    it('should save a QR code to history', () => {
      const item = {
        type: 'url',
        content: 'https://example.com',
        preview: 'data:image/png;base64,test',
        options: {
          errorLevel: 'M',
          size: 300,
          fgColor: '#000000',
          bgColor: '#ffffff',
          margin: 4,
        },
      }

      saveToHistory(item)
      const history = getHistory()

      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('url')
      expect(history[0].content).toBe('https://example.com')
    })

    it('should limit history to MAX_HISTORY items', () => {
      // Save 101 items
      for (let i = 0; i < 101; i++) {
        saveToHistory({
          type: 'text',
          content: `Test ${i}`,
          preview: 'data:image/png;base64,test',
          options: {
            errorLevel: 'M',
            size: 300,
            fgColor: '#000000',
            bgColor: '#ffffff',
            margin: 4,
          },
        })
      }

      const history = getHistory()
      expect(history.length).toBeLessThanOrEqual(100)
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      saveToHistory({
        type: 'url',
        content: 'https://example.com',
        preview: 'data:image/png;base64,test',
        options: {
          errorLevel: 'M',
          size: 300,
          fgColor: '#000000',
          bgColor: '#ffffff',
          margin: 4,
        },
      })

      const history = getHistory()
      const id = history[0].id

      toggleFavorite(id)
      const updated = getHistory()
      expect(updated[0].favorite).toBe(true)

      toggleFavorite(id)
      const toggled = getHistory()
      expect(toggled[0].favorite).toBe(false)
    })
  })

  describe('searchHistory', () => {
    beforeEach(() => {
      saveToHistory({
        type: 'url',
        content: 'https://example.com',
        preview: 'data:image/png;base64,test',
        options: {
          errorLevel: 'M',
          size: 300,
          fgColor: '#000000',
          bgColor: '#ffffff',
          margin: 4,
        },
      })

      saveToHistory({
        type: 'email',
        content: 'test@example.com',
        preview: 'data:image/png;base64,test',
        options: {
          errorLevel: 'M',
          size: 300,
          fgColor: '#000000',
          bgColor: '#ffffff',
          margin: 4,
        },
      })
    })

    it('should search by content', () => {
      const results = searchHistory('https')
      expect(results).toHaveLength(1)
      expect(results[0].content).toBe('https://example.com')
    })

    it('should search by type', () => {
      const results = searchHistory('email')
      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('email')
    })

    it('should return all items for empty query', () => {
      const results = searchHistory('')
      expect(results).toHaveLength(2)
    })
  })

  describe('getHistoryStats', () => {
    it('should return correct stats', () => {
      saveToHistory({
        type: 'url',
        content: 'https://example.com',
        preview: 'data:image/png;base64,test',
        options: {
          errorLevel: 'M',
          size: 300,
          fgColor: '#000000',
          bgColor: '#ffffff',
          margin: 4,
        },
      })

      const history = getHistory()
      toggleFavorite(history[0].id)

      const stats = getHistoryStats()
      expect(stats.total).toBe(1)
      expect(stats.favorites).toBe(1)
      expect(stats.byType.url).toBe(1)
    })
  })

  describe('clearHistory', () => {
    it('should clear all history', () => {
      saveToHistory({
        type: 'url',
        content: 'https://example.com',
        preview: 'data:image/png;base64,test',
        options: {
          errorLevel: 'M',
          size: 300,
          fgColor: '#000000',
          bgColor: '#ffffff',
          margin: 4,
        },
      })

      clearHistory()
      const history = getHistory()
      expect(history).toHaveLength(0)
    })
  })
})
