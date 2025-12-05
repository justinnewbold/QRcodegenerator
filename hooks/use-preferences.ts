'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserPreferences,
  getPreferences,
  savePreferences,
  getDefaultPreferences,
} from '@/lib/user-preferences';

/**
 * Hook for reactively accessing and updating user preferences
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    setPreferences(getPreferences());
    setIsLoaded(true);
  }, []);

  // Listen for preference changes (from other tabs/components)
  useEffect(() => {
    const handleChange = (e: CustomEvent<UserPreferences>) => {
      setPreferences(e.detail);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'qr-generator-preferences') {
        setPreferences(getPreferences());
      }
    };

    window.addEventListener('preferences-changed', handleChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('preferences-changed', handleChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update a single preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      savePreferences({ [key]: value });
      return updated;
    });
  }, []);

  // Update multiple preferences at once
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      savePreferences(updates);
      return updated;
    });
  }, []);

  return {
    preferences,
    isLoaded,
    updatePreference,
    updatePreferences,
  };
}

/**
 * Hook for a single preference value
 */
export function usePreference<K extends keyof UserPreferences>(key: K) {
  const { preferences, updatePreference, isLoaded } = usePreferences();

  const setValue = useCallback(
    (value: UserPreferences[K]) => {
      updatePreference(key, value);
    },
    [key, updatePreference]
  );

  return [preferences[key], setValue, isLoaded] as const;
}
