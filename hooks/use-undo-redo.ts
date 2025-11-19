import { useState, useCallback, useEffect } from 'react'

export function useUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentState = history[currentIndex]

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prev => {
      const current = prev[currentIndex]
      const next = typeof newState === 'function'
        ? (newState as (prev: T) => T)(current)
        : newState

      // Remove any future history when making a new change
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(next)

      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift()
        return newHistory
      }

      return newHistory
    })
    setCurrentIndex(prev => {
      const newIndex = prev + 1
      return newIndex >= maxHistory ? maxHistory - 1 : newIndex
    })
  }, [currentIndex, maxHistory])

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [canUndo])

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [canRedo])

  const reset = useCallback(() => {
    setHistory([initialState])
    setCurrentIndex(0)
  }, [initialState])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.shiftKey && e.key === 'z' || e.key === 'y')
      ) {
        e.preventDefault()
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historySize: history.length,
    currentIndex
  }
}
