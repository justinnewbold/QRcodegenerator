'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Keyboard, Command, Search, Download, History, Settings, Palette, Undo, Redo, Copy, Save } from 'lucide-react';

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts', icon: <Keyboard className="h-4 w-4" /> },
      { keys: ['Esc'], description: 'Close modal / Cancel', icon: <X className="h-4 w-4" /> },
      { keys: ['Ctrl', 'K'], description: 'Quick search', icon: <Search className="h-4 w-4" /> },
      { keys: ['Ctrl', 'S'], description: 'Save / Download QR', icon: <Save className="h-4 w-4" /> },
    ],
  },
  {
    name: 'QR Code',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Generate QR code' },
      { keys: ['Ctrl', 'D'], description: 'Download as PNG', icon: <Download className="h-4 w-4" /> },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Download as SVG' },
      { keys: ['Ctrl', 'C'], description: 'Copy QR to clipboard', icon: <Copy className="h-4 w-4" /> },
    ],
  },
  {
    name: 'History & Presets',
    shortcuts: [
      { keys: ['Ctrl', 'H'], description: 'Open history', icon: <History className="h-4 w-4" /> },
      { keys: ['Ctrl', 'P'], description: 'Open presets', icon: <Palette className="h-4 w-4" /> },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Save as preset' },
    ],
  },
  {
    name: 'Edit',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo', icon: <Undo className="h-4 w-4" /> },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo', icon: <Redo className="h-4 w-4" /> },
      { keys: ['Ctrl', 'Y'], description: 'Redo (alternative)' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['Tab'], description: 'Move to next field' },
      { keys: ['Shift', 'Tab'], description: 'Move to previous field' },
      { keys: ['Arrow Up/Down'], description: 'Adjust numeric values' },
      { keys: ['Ctrl', ','], description: 'Open settings', icon: <Settings className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Accessibility',
    shortcuts: [
      { keys: ['Alt', 'H'], description: 'Toggle high contrast mode' },
      { keys: ['Alt', 'R'], description: 'Announce current state (screen reader)' },
      { keys: ['F6'], description: 'Move focus to main content' },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function KeyboardShortcutsHelp({ isOpen: controlledOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
    setSearchQuery('');
  }, [onClose]);

  // Listen for ? key to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if ? is pressed (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        e.preventDefault();
        if (controlledOpen === undefined) {
          setInternalOpen(true);
        }
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, controlledOpen, handleClose]);

  // Filter shortcuts based on search
  const filteredCategories = SHORTCUTS.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter(category => category.shortcuts.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-lg font-semibold">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-muted-foreground">
                Quick reference for all available shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No shortcuts found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {category.name}
                  </h3>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          {shortcut.icon && (
                            <span className="text-muted-foreground">
                              {shortcut.icon}
                            </span>
                          )}
                          <span className="text-sm">{shortcut.description}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center gap-1">
                              <kbd className="inline-flex min-w-[24px] items-center justify-center rounded bg-muted px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                                {key === 'Ctrl' && (
                                  <Command className="mr-1 h-3 w-3" />
                                )}
                                {key === 'Ctrl' ? (navigator.platform.includes('Mac') ? '' : 'Ctrl') : key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-xs text-muted-foreground">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">?</kbd> anywhere to open this help
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{
    keys: string[];
    callback: () => void;
    preventDefault?: boolean;
  }>
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlRequired = shortcut.keys.includes('Ctrl');
        const shiftRequired = shortcut.keys.includes('Shift');
        const altRequired = shortcut.keys.includes('Alt');

        const mainKey = shortcut.keys.find(
          k => !['Ctrl', 'Shift', 'Alt', 'Meta'].includes(k)
        );

        if (!mainKey) continue;

        const ctrlMatch = ctrlRequired ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey);
        const shiftMatch = shiftRequired ? e.shiftKey : !e.shiftKey;
        const altMatch = altRequired ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === mainKey.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.callback();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default KeyboardShortcutsHelp;
