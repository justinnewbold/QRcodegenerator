'use client';

import { Undo2, Redo2, History, Trash2 } from 'lucide-react';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear?: () => void;
  historyCount?: {
    past: number;
    future: number;
    total: number;
  };
  showHistory?: boolean;
  variant?: 'default' | 'compact' | 'floating';
}

export function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  historyCount,
  showHistory = false,
  variant = 'default',
}: UndoRedoToolbarProps) {
  const isMac = typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-muted"
          title={`Undo (${modKey}+Z)`}
        >
          <Undo2 className="h-4 w-4" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {historyCount && showHistory && (
          <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            <span>{historyCount.past}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>{historyCount.future}</span>
          </div>
        )}

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-muted"
          title={`Redo (${modKey}+Shift+Z)`}
        >
          <span className="hidden sm:inline">Redo</span>
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-0.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-muted enabled:hover:text-foreground"
          title={`Undo (${modKey}+Z)`}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-muted enabled:hover:text-foreground"
          title={`Redo (${modKey}+Shift+Z)`}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-muted"
        title={`Undo (${modKey}+Z)`}
      >
        <Undo2 className="h-4 w-4" />
        <span className="hidden sm:inline">Undo</span>
        {historyCount && historyCount.past > 0 && (
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {historyCount.past}
          </span>
        )}
      </button>

      <div className="h-4 w-px bg-border" />

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-muted"
        title={`Redo (${modKey}+Shift+Z)`}
      >
        <Redo2 className="h-4 w-4" />
        <span className="hidden sm:inline">Redo</span>
        {historyCount && historyCount.future > 0 && (
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {historyCount.future}
          </span>
        )}
      </button>

      {onClear && (historyCount?.past || historyCount?.future) ? (
        <>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Clear history"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </>
      ) : null}
    </div>
  );
}

// Keyboard shortcut hint component
export function UndoRedoHint() {
  const isMac = typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <span>+</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Z</kbd>
        <span className="ml-1">Undo</span>
      </div>
      <div className="flex items-center gap-1">
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <span>+</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⇧</kbd>
        <span>+</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Z</kbd>
        <span className="ml-1">Redo</span>
      </div>
    </div>
  );
}
