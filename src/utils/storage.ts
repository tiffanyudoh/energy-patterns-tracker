import { DailyEntry, AppState, WeeklyFocus } from '@/types';

const STORAGE_KEYS = {
  ENTRIES: 'energy_tracker_entries',
  ACTIVE_FOCUS: 'energy_tracker_active_focus',
  PREVIOUS_FOCUS: 'energy_tracker_previous_focus',
  LAST_ANALYSIS_DATE: 'energy_tracker_last_analysis_date',
} as const;

/**
 * Storage utilities for persisting app data to localStorage
 */

// Entries (keyed by date)
export function getEntries(): Record<string, DailyEntry> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading entries from localStorage:', error);
    return {};
  }
}

export function saveEntry(entry: DailyEntry): void {
  try {
    const entries = getEntries();
    entries[entry.date] = entry;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry to localStorage:', error);
    throw new Error('Unable to save entry. Please try again.');
  }
}

export function getEntry(date: string): DailyEntry | null {
  const entries = getEntries();
  return entries[date] || null;
}

export function deleteEntry(date: string): void {
  try {
    const entries = getEntries();
    delete entries[date];
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error deleting entry from localStorage:', error);
    throw new Error('Unable to delete entry. Please try again.');
  }
}

// Weekly Focus (for Phase 3)
export function getActiveFocus(): WeeklyFocus | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_FOCUS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading active focus:', error);
    return null;
  }
}

export function setActiveFocus(focus: WeeklyFocus | null): void {
  try {
    if (focus) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FOCUS, JSON.stringify(focus));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_FOCUS);
    }
  } catch (error) {
    console.error('Error saving active focus:', error);
    throw new Error('Unable to save focus. Please try again.');
  }
}

export function getPreviousFocus(): WeeklyFocus | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREVIOUS_FOCUS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading previous focus:', error);
    return null;
  }
}

export function setPreviousFocus(focus: WeeklyFocus | null): void {
  try {
    if (focus) {
      localStorage.setItem(STORAGE_KEYS.PREVIOUS_FOCUS, JSON.stringify(focus));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PREVIOUS_FOCUS);
    }
  } catch (error) {
    console.error('Error saving previous focus:', error);
  }
}

// Last analysis date
export function getLastAnalysisDate(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_ANALYSIS_DATE);
}

export function setLastAnalysisDate(date: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS_DATE, date);
}

// Full app state (for context initialization)
export function getAppState(): AppState {
  return {
    entries: getEntries(),
    active_focus: getActiveFocus(),
    previous_focus: getPreviousFocus(),
    last_analysis_date: getLastAnalysisDate(),
  };
}
