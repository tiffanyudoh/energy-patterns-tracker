import { useState, useCallback, useEffect } from 'react';
import { DailyEntry, createEmptyEntry } from '@/types';
import { getEntry, saveEntry as saveToStorage } from '@/utils/storage';

interface UseDailyEntryReturn {
  entry: DailyEntry;
  hasExistingEntry: boolean;
  isDirty: boolean;
  updateEntry: (updates: Partial<DailyEntry>) => void;
  saveEntry: () => Promise<{ success: boolean; error?: string }>;
  resetEntry: () => void;
  loadEntry: (date: string) => void;
}

/**
 * Hook for managing daily entry state and persistence
 *
 * - Loads existing entry or creates empty one
 * - Tracks dirty state (unsaved changes)
 * - Handles save with error handling
 */
export function useDailyEntry(initialDate: string): UseDailyEntryReturn {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [entry, setEntry] = useState<DailyEntry>(() => {
    const existing = getEntry(initialDate);
    return existing || createEmptyEntry(initialDate);
  });
  const [hasExistingEntry, setHasExistingEntry] = useState(() => {
    return getEntry(initialDate) !== null;
  });
  const [isDirty, setIsDirty] = useState(false);

  // Load entry for a specific date
  const loadEntry = useCallback((date: string) => {
    setCurrentDate(date);
    const existing = getEntry(date);
    if (existing) {
      setEntry(existing);
      setHasExistingEntry(true);
    } else {
      setEntry(createEmptyEntry(date));
      setHasExistingEntry(false);
    }
    setIsDirty(false);
  }, []);

  // Update entry fields
  const updateEntry = useCallback((updates: Partial<DailyEntry>) => {
    setEntry((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Save entry to storage
  const saveEntry = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      saveToStorage(entry);
      setHasExistingEntry(true);
      setIsDirty(false);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save entry. Please try again.';
      return { success: false, error: message };
    }
  }, [entry]);

  // Reset entry to last saved state or empty
  const resetEntry = useCallback(() => {
    const existing = getEntry(currentDate);
    if (existing) {
      setEntry(existing);
    } else {
      setEntry(createEmptyEntry(currentDate));
    }
    setIsDirty(false);
  }, [currentDate]);

  // Reload when date changes externally
  useEffect(() => {
    if (initialDate !== currentDate) {
      loadEntry(initialDate);
    }
  }, [initialDate, currentDate, loadEntry]);

  return {
    entry,
    hasExistingEntry,
    isDirty,
    updateEntry,
    saveEntry,
    resetEntry,
    loadEntry,
  };
}
