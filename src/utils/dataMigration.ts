import { DailyEntry } from '@/types';

const MIGRATION_KEY = 'energy_tracker_migration_restorer_to_boost';
const ENTRIES_KEY = 'energy_tracker_entries';

/**
 * Migrate localStorage data from "restorer" field names to "boost" field names.
 *
 * - Reads all entries from localStorage
 * - Renames restorer fields to boost fields in each entry
 * - Writes migrated entries back
 * - Sets a migration flag so this only runs once
 * - Keeps old data intact (the full entry is overwritten with renamed fields)
 */
export function migrateRestorerToBoost(): void {
  // Skip if already migrated
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) {
      // No data to migrate, mark as done
      localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
      return;
    }

    const entries: Record<string, Record<string, unknown>> = JSON.parse(raw);
    const migrated: Record<string, DailyEntry> = {};

    for (const [date, entry] of Object.entries(entries)) {
      migrated[date] = {
        date: entry.date as string,
        energy_score: entry.energy_score as number,
        morning_drains: (entry.morning_drains as string[]) ?? [],
        morning_custom_drain: (entry.morning_custom_drain as string) ?? '',
        morning_boosts: ((entry.morning_boosts ?? entry.morning_restorers) as string[]) ?? [],
        morning_custom_boost: ((entry.morning_custom_boost ?? entry.morning_custom_restorer) as string) ?? '',
        afternoon_drains: (entry.afternoon_drains as string[]) ?? [],
        afternoon_custom_drain: (entry.afternoon_custom_drain as string) ?? '',
        afternoon_boosts: ((entry.afternoon_boosts ?? entry.afternoon_restorers) as string[]) ?? [],
        afternoon_custom_boost: ((entry.afternoon_custom_boost ?? entry.afternoon_custom_restorer) as string) ?? '',
        evening_drains: (entry.evening_drains as string[]) ?? [],
        evening_custom_drain: (entry.evening_custom_drain as string) ?? '',
        evening_boosts: ((entry.evening_boosts ?? entry.evening_restorers) as string[]) ?? [],
        evening_custom_boost: ((entry.evening_custom_boost ?? entry.evening_custom_restorer) as string) ?? '',
        custom_drain: (entry.custom_drain as string) ?? '',
        custom_boost: ((entry.custom_boost ?? entry.custom_restorer) as string) ?? '',
      };
    }

    localStorage.setItem(ENTRIES_KEY, JSON.stringify(migrated));
    localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
