'use client';

import { useEffect, useState } from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { keys: ['/', 'Ctrl', 'K'], description: 'Focus search/content input', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close modal or clear selection', category: 'Navigation' },

  // QR Actions
  { keys: ['Ctrl/⌘', 'Enter'], description: 'Generate QR code', category: 'QR Actions' },
  { keys: ['Ctrl/⌘', 'S'], description: 'Download QR code', category: 'QR Actions' },
  { keys: ['Ctrl/⌘', 'C'], description: 'Copy QR code to clipboard', category: 'QR Actions' },
  { keys: ['Ctrl/⌘', 'Shift', 'C'], description: 'Copy shareable link', category: 'QR Actions' },

  // UI Controls
  { keys: ['Ctrl/⌘', ','], description: 'Open settings', category: 'UI Controls' },
  { keys: ['Ctrl/⌘', 'J'], description: 'Toggle dark/light mode', category: 'UI Controls' },
  { keys: ['Ctrl/⌘', 'H'], description: 'Open history', category: 'UI Controls' },
  { keys: ['Ctrl/⌘', 'Q'], description: 'Open quick actions', category: 'UI Controls' },

  // Editing
  { keys: ['Ctrl/⌘', 'Z'], description: 'Undo last change', category: 'Editing' },
  { keys: ['Ctrl/⌘', 'Shift', 'Z'], description: 'Redo last change', category: 'Editing' },
  { keys: ['Tab'], description: 'Move to next field', category: 'Editing' },
  { keys: ['Shift', 'Tab'], description: 'Move to previous field', category: 'Editing' },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const categories = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Keyboard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 id="shortcuts-title" className="text-lg font-semibold">Keyboard Shortcuts</h2>
            <p className="text-sm text-muted-foreground">Navigate faster with your keyboard</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="mb-3 text-sm font-semibold text-foreground">{category}</h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          {keyIndex > 0 && (
                            <span className="mx-1 text-xs text-muted-foreground">+</span>
                          )}
                          <KeyCap>{key}</KeyCap>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Press <KeyCap>?</KeyCap> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}

// Key Cap Component
function KeyCap({ children }: { children: React.ReactNode }) {
  const content = String(children);

  // Special handling for modifier keys
  if (content === 'Ctrl/⌘') {
    return (
      <span className="inline-flex items-center gap-0.5">
        <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-medium text-foreground shadow-sm">
          <Command className="h-3 w-3" />
        </kbd>
      </span>
    );
  }

  return (
    <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

// Keyboard Shortcuts Button for easy integration
export function KeyboardShortcutsButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for ? key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>
      <KeyboardShortcutsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// Global Keyboard Shortcuts Handler
export function GlobalKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Skip if in input field for most shortcuts
      const isInputField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      // Ctrl/⌘ + J - Toggle theme
      if (modifier && e.key === 'j' && !e.shiftKey) {
        e.preventDefault();
        // Toggle theme - dispatch custom event
        window.dispatchEvent(new CustomEvent('toggle-theme'));
      }

      // Ctrl/⌘ + , - Open settings
      if (modifier && e.key === ',' && !isInputField) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-settings'));
      }

      // Ctrl/⌘ + H - Open history
      if (modifier && e.key === 'h' && !isInputField) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-history'));
      }

      // Ctrl/⌘ + Q - Open quick actions
      if (modifier && e.key === 'q' && !isInputField) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-quick-actions'));
      }

      // Ctrl/⌘ + K or / - Focus content input
      if ((modifier && e.key === 'k') || (e.key === '/' && !isInputField)) {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('[data-content-input]');
        input?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
