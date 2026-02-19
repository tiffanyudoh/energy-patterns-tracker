import { DailyEntry } from '@/types';
import { getEntries } from './storage';
import { getLastNDays } from './dateUtils';

/**
 * Pattern Detection Utilities (Phase 2: Tasks 2.1-2.4)
 *
 * Functions for analyzing energy patterns from daily entries
 */

// ============================================================================
// TASK 2.1: Weekly Data Retrieval
// ============================================================================

export interface WeeklyData {
  entries: DailyEntry[];
  avg_energy: number;
  previous_week_avg: number | null;
  days_logged: number;
  previous_week_entries: DailyEntry[];
  previous_week_days_logged: number;
}

export type WeeklyDataResult =
  | { success: true; data: WeeklyData }
  | { success: false; error: string };

/**
 * Get last 7 days of entries for analysis (Spec 2.1)
 *
 * - Retrieves all daily entries from last 7 days
 * - If fewer than 3 days exist, returns error
 * - Calculates average energy (rounded to 1 decimal)
 * - Retrieves previous week average for comparison
 */
export function getWeeklyData(): WeeklyDataResult {
  const allEntries = getEntries();
  const last7Days = getLastNDays(7);
  // Get previous 7 days: start from the day BEFORE the oldest current week day
  const oldestCurrentDay = last7Days[last7Days.length - 1];
  const previous7Days = getLastNDays(8, oldestCurrentDay).slice(1); // Skip the first (which is oldestCurrentDay)

  // Get entries for current week
  const currentWeekEntries: DailyEntry[] = [];
  for (const date of last7Days) {
    if (allEntries[date]) {
      currentWeekEntries.push(allEntries[date]);
    }
  }

  // Check minimum data requirement
  if (currentWeekEntries.length < 3) {
    return {
      success: false,
      error: 'Keep logging to see patterns (need at least 3 days of data)',
    };
  }

  // Calculate current week average energy
  const totalEnergy = currentWeekEntries.reduce((sum, entry) => sum + entry.energy_score, 0);
  const avg_energy = Math.round((totalEnergy / currentWeekEntries.length) * 10) / 10;

  // Calculate previous week average (if data exists)
  let previous_week_avg: number | null = null;
  const previousWeekEntries: DailyEntry[] = [];
  for (const date of previous7Days) {
    if (allEntries[date]) {
      previousWeekEntries.push(allEntries[date]);
    }
  }

  if (previousWeekEntries.length >= 3) {
    const prevTotal = previousWeekEntries.reduce((sum, entry) => sum + entry.energy_score, 0);
    previous_week_avg = Math.round((prevTotal / previousWeekEntries.length) * 10) / 10;
  }

  return {
    success: true,
    data: {
      entries: currentWeekEntries,
      avg_energy,
      previous_week_avg,
      days_logged: currentWeekEntries.length,
      previous_week_entries: previousWeekEntries,
      previous_week_days_logged: previousWeekEntries.length,
    },
  };
}

// ============================================================================
// TASK 2.2: Drain Pattern Detection
// ============================================================================

export interface PatternInfo {
  activity: string;
  frequency: number;
  avg_energy: number;
  energy_range: { min: number; max: number };
  confidence: 'Strong pattern' | 'Emerging pattern' | 'Weak signal';
}

/**
 * Extract all drains from a single entry (all time blocks + custom fields)
 */
function extractAllDrains(entry: DailyEntry): Array<{ activity: string; energy: number }> {
  const drains: Array<{ activity: string; energy: number }> = [];
  const energy = entry.energy_score;

  // Morning drains
  entry.morning_drains.forEach((d) => drains.push({ activity: d, energy }));
  if (entry.morning_custom_drain.trim()) {
    drains.push({ activity: entry.morning_custom_drain.trim(), energy });
  }

  // Afternoon drains
  entry.afternoon_drains.forEach((d) => drains.push({ activity: d, energy }));
  if (entry.afternoon_custom_drain.trim()) {
    drains.push({ activity: entry.afternoon_custom_drain.trim(), energy });
  }

  // Evening drains
  entry.evening_drains.forEach((d) => drains.push({ activity: d, energy }));
  if (entry.evening_custom_drain.trim()) {
    drains.push({ activity: entry.evening_custom_drain.trim(), energy });
  }

  // Whole-day custom drain
  if (entry.custom_drain.trim()) {
    drains.push({ activity: entry.custom_drain.trim(), energy });
  }

  return drains;
}

/**
 * Detect top 2 drain patterns from weekly data (Spec 2.2)
 *
 * - Extracts ALL drain activities from all time blocks
 * - Includes ALL custom text fields
 * - Groups identical activities (case-insensitive)
 * - Calculates frequency, average energy, range, confidence
 * - Returns top 2 sorted by frequency
 */
export function detectDrainPatterns(entries: DailyEntry[]): PatternInfo[] {
  // Collect all drains with their energy scores
  const allDrains: Array<{ activity: string; energy: number }> = [];
  for (const entry of entries) {
    allDrains.push(...extractAllDrains(entry));
  }

  // Group by activity (case-insensitive)
  const grouped = new Map<string, { originalName: string; energyScores: number[] }>();

  for (const { activity, energy } of allDrains) {
    const key = activity.toLowerCase();
    if (!grouped.has(key)) {
      grouped.set(key, { originalName: activity, energyScores: [] });
    }
    grouped.get(key)!.energyScores.push(energy);
  }

  // Calculate pattern info for each activity
  const patterns: PatternInfo[] = [];

  for (const [, data] of grouped) {
    const frequency = data.energyScores.length;

    // Exclude if frequency < 2
    if (frequency < 2) continue;

    const min = Math.min(...data.energyScores);
    const max = Math.max(...data.energyScores);
    const range = max - min;
    const avg_energy = Math.round((data.energyScores.reduce((a, b) => a + b, 0) / frequency) * 10) / 10;

    // Determine confidence level
    let confidence: PatternInfo['confidence'];
    if (frequency >= 5 && range <= 4) {
      confidence = 'Strong pattern';
    } else if (frequency >= 3 && range <= 4) {
      confidence = 'Emerging pattern';
    } else {
      confidence = 'Weak signal';
    }

    patterns.push({
      activity: data.originalName,
      frequency,
      avg_energy,
      energy_range: { min, max },
      confidence,
    });
  }

  // Sort by frequency (descending), then alphabetically for ties
  patterns.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return a.activity.toLowerCase().localeCompare(b.activity.toLowerCase());
  });
  return patterns.slice(0, 2);
}

// ============================================================================
// TASK 2.3: Boost Pattern Detection
// ============================================================================

/**
 * Extract all boosts from a single entry (all time blocks + custom fields)
 */
function extractAllBoosts(entry: DailyEntry): Array<{ activity: string; energy: number }> {
  const boosts: Array<{ activity: string; energy: number }> = [];
  const energy = entry.energy_score;

  // Morning boosts
  entry.morning_boosts.forEach((r) => boosts.push({ activity: r, energy }));
  if (entry.morning_custom_boost.trim()) {
    boosts.push({ activity: entry.morning_custom_boost.trim(), energy });
  }

  // Afternoon boosts
  entry.afternoon_boosts.forEach((r) => boosts.push({ activity: r, energy }));
  if (entry.afternoon_custom_boost.trim()) {
    boosts.push({ activity: entry.afternoon_custom_boost.trim(), energy });
  }

  // Evening boosts
  entry.evening_boosts.forEach((r) => boosts.push({ activity: r, energy }));
  if (entry.evening_custom_boost.trim()) {
    boosts.push({ activity: entry.evening_custom_boost.trim(), energy });
  }

  // Whole-day custom boost
  if (entry.custom_boost.trim()) {
    boosts.push({ activity: entry.custom_boost.trim(), energy });
  }

  return boosts;
}

/**
 * Detect top 2 boost patterns from weekly data (Spec 2.3)
 *
 * Same logic as drain detection but for boosts
 */
export function detectBoostPatterns(entries: DailyEntry[]): PatternInfo[] {
  // Collect all boosts with their energy scores
  const allBoosts: Array<{ activity: string; energy: number }> = [];
  for (const entry of entries) {
    allBoosts.push(...extractAllBoosts(entry));
  }

  // Group by activity (case-insensitive)
  const grouped = new Map<string, { originalName: string; energyScores: number[] }>();

  for (const { activity, energy } of allBoosts) {
    const key = activity.toLowerCase();
    if (!grouped.has(key)) {
      grouped.set(key, { originalName: activity, energyScores: [] });
    }
    grouped.get(key)!.energyScores.push(energy);
  }

  // Calculate pattern info for each activity
  const patterns: PatternInfo[] = [];

  for (const [, data] of grouped) {
    const frequency = data.energyScores.length;

    // Exclude if frequency < 2
    if (frequency < 2) continue;

    const min = Math.min(...data.energyScores);
    const max = Math.max(...data.energyScores);
    const range = max - min;
    const avg_energy = Math.round((data.energyScores.reduce((a, b) => a + b, 0) / frequency) * 10) / 10;

    // Determine confidence level
    let confidence: PatternInfo['confidence'];
    if (frequency >= 5 && range <= 4) {
      confidence = 'Strong pattern';
    } else if (frequency >= 3 && range <= 4) {
      confidence = 'Emerging pattern';
    } else {
      confidence = 'Weak signal';
    }

    patterns.push({
      activity: data.originalName,
      frequency,
      avg_energy,
      energy_range: { min, max },
      confidence,
    });
  }

  // Sort by frequency (descending), then alphabetically for ties
  patterns.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return a.activity.toLowerCase().localeCompare(b.activity.toLowerCase());
  });
  return patterns.slice(0, 2);
}

// ============================================================================
// TASK 2.4: Cognitive Load Detection
// ============================================================================

// Keywords to detect cognitive load (case-insensitive, partial match)
const COGNITIVE_LOAD_KEYWORDS = [
  'coordination',
  'scheduling',
  'planning',
  'managing',
  'organizing',
  'emotional labor',
  'caregiving',
  'care coordination',
  'maintenance',
  'admin',
  'administrative',
  'context switching',
  'decision fatigue',
  'interruption',
  'family obligations',
];

/**
 * Check if an activity matches any cognitive load keyword
 */
function matchesCognitiveLoad(activity: string): boolean {
  const lower = activity.toLowerCase();
  return COGNITIVE_LOAD_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export interface CognitiveLoadResult {
  detected: boolean;
  category: string;
  frequency: number;
  avg_energy: number;
  confidence: 'Strong pattern' | 'Emerging pattern' | 'Weak signal';
  specific_activities: string[];
}

export interface CognitiveLoadStats {
  frequency: number;
  avg_energy: number | null;
}

/**
 * Get cognitive load statistics for a set of entries (used for comparison)
 * Returns frequency count and average energy regardless of threshold
 */
export function getCognitiveLoadStats(entries: DailyEntry[]): CognitiveLoadStats {
  const matchedActivities: Array<{ activity: string; energy: number }> = [];

  for (const entry of entries) {
    const drains = extractAllDrains(entry);
    for (const { activity, energy } of drains) {
      if (matchesCognitiveLoad(activity)) {
        matchedActivities.push({ activity, energy });
      }
    }
  }

  if (matchedActivities.length === 0) {
    return { frequency: 0, avg_energy: null };
  }

  const totalEnergy = matchedActivities.reduce((sum, item) => sum + item.energy, 0);
  const avg_energy = Math.round((totalEnergy / matchedActivities.length) * 10) / 10;

  return {
    frequency: matchedActivities.length,
    avg_energy,
  };
}

/**
 * Detect cognitive load patterns from weekly data (Spec 2.4)
 *
 * - Scans ALL drain activities for cognitive load keywords
 * - If ≥3 matches AND average energy ≤5 → Flag pattern
 * - Returns maximum ONE cognitive load insight
 */
export function detectCognitiveLoad(entries: DailyEntry[]): CognitiveLoadResult | null {
  const matchedActivities: Array<{ activity: string; energy: number }> = [];

  // Scan all drains from all entries
  for (const entry of entries) {
    const drains = extractAllDrains(entry);

    for (const { activity, energy } of drains) {
      if (matchesCognitiveLoad(activity)) {
        matchedActivities.push({ activity, energy });
      }
    }
  }

  // Check if enough matches exist
  if (matchedActivities.length < 3) {
    return null;
  }

  // Calculate average energy
  const totalEnergy = matchedActivities.reduce((sum, item) => sum + item.energy, 0);
  const avg_energy = Math.round((totalEnergy / matchedActivities.length) * 10) / 10;

  // Only flag if average energy ≤ 5
  if (avg_energy > 5) {
    return null;
  }

  // Get unique specific activities
  const uniqueActivities = [...new Set(matchedActivities.map((m) => m.activity))];

  // Determine confidence level
  const frequency = matchedActivities.length;
  let confidence: CognitiveLoadResult['confidence'];
  if (frequency >= 5) {
    confidence = 'Strong pattern';
  } else if (frequency >= 3) {
    confidence = 'Emerging pattern';
  } else {
    confidence = 'Weak signal';
  }

  return {
    detected: true,
    category: 'Coordination & planning tasks',
    frequency,
    avg_energy,
    confidence,
    specific_activities: uniqueActivities.slice(0, 5), // Limit to 5 examples
  };
}
