'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import isEqual from 'fast-deep-equal';

interface UndoRedoOptions<T> {
  maxHistory?: number;
  debounceMs?: number;
  onChange?: (state: T, action: 'undo' | 'redo' | 'set') => void;
}

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoResult<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initialState: T) => void;
  clear: () => void;
  history: {
    past: number;
    future: number;
    total: number;
  };
}

/**
 * Custom hook for managing undo/redo state history
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions<T> = {}
): UndoRedoResult<T> {
  const { maxHistory = 50, debounceMs = 300, onChange } = options;

  const [state, setInternalState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const skipNextRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Set new state with history tracking
  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      const now = Date.now();
      const shouldDebounce = now - lastUpdateRef.current < debounceMs;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const updateState = () => {
        setInternalState((prevState) => {
          const resolvedNewState =
            typeof newState === 'function'
              ? (newState as (prev: T) => T)(prevState.present)
              : newState;

          // Don't add to history if state hasn't changed (using fast-deep-equal for performance)
          if (isEqual(resolvedNewState, prevState.present)) {
            return prevState;
          }

          // Add current state to past, limit history size
          const newPast = [...prevState.past, prevState.present].slice(-maxHistory);

          onChange?.(resolvedNewState, 'set');

          return {
            past: newPast,
            present: resolvedNewState,
            future: [], // Clear future on new changes
          };
        });

        lastUpdateRef.current = Date.now();
      };

      if (shouldDebounce && !skipNextRef.current) {
        // Debounce rapid changes (like typing)
        debounceRef.current = setTimeout(updateState, debounceMs);
      } else {
        updateState();
        skipNextRef.current = false;
      }
    },
    [maxHistory, debounceMs, onChange]
  );

  // Undo action
  const undo = useCallback(() => {
    setInternalState((prevState) => {
      if (prevState.past.length === 0) {
        return prevState;
      }

      const previous = prevState.past[prevState.past.length - 1];
      const newPast = prevState.past.slice(0, -1);

      onChange?.(previous, 'undo');
      skipNextRef.current = true;

      return {
        past: newPast,
        present: previous,
        future: [prevState.present, ...prevState.future],
      };
    });
  }, [onChange]);

  // Redo action
  const redo = useCallback(() => {
    setInternalState((prevState) => {
      if (prevState.future.length === 0) {
        return prevState;
      }

      const next = prevState.future[0];
      const newFuture = prevState.future.slice(1);

      onChange?.(next, 'redo');
      skipNextRef.current = true;

      return {
        past: [...prevState.past, prevState.present],
        present: next,
        future: newFuture,
      };
    });
  }, [onChange]);

  // Reset to a new initial state
  const reset = useCallback((newInitialState: T) => {
    setInternalState({
      past: [],
      present: newInitialState,
      future: [],
    });
  }, []);

  // Clear history but keep current state
  const clear = useCallback(() => {
    setInternalState((prevState) => ({
      past: [],
      present: prevState.present,
      future: [],
    }));
  }, []);

  return {
    state: state.present,
    setState,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    reset,
    clear,
    history: {
      past: state.past.length,
      future: state.future.length,
      total: state.past.length + state.future.length + 1,
    },
  };
}

/**
 * Keyboard shortcuts for undo/redo
 */
export function useUndoRedoKeyboard(
  undo: () => void,
  redo: () => void,
  canUndo: boolean,
  canRedo: boolean
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      } else if (modifier && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault();
        redo();
      } else if (modifier && e.key === 'y' && canRedo) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}
