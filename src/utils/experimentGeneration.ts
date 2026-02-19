import { DailyEntry } from '@/types';
import { PatternInfo, CognitiveLoadResult } from './patternDetection';

/**
 * Template-Based Experiment Generation (Spec 2.5)
 *
 * Generates specific, actionable experiments based on pattern characteristics.
 * Uses intelligent template selection - no AI/API required for MVP.
 *
 * LANGUAGE RULES:
 * - NEVER use "you should"
 * - Always use: "Consider", "Worth trying", "Worth exploring"
 * - Be specific: insert actual activity names, frequencies, time blocks
 * - Keep to 1-2 sentences max
 */

// ============================================================================
// Types
// ============================================================================

export type ExperimentStrategy =
  | 'batching'
  | 'time_shifting'
  | 'buffering'
  | 'reducing_frequency'
  | 'delegating'
  | 'schedule_it'
  | 'protect_it'
  | 'increase_frequency'
  | 'pair_it';

export interface ExperimentSuggestion {
  activity: string;
  confidence: string;
  strategy: ExperimentStrategy;
  experiment: string;
  type: 'drain' | 'boost' | 'cognitive_load';
}

export interface TimeBlockAnalysis {
  morning: number;
  afternoon: number;
  evening: number;
  mostCommon: 'morning' | 'afternoon' | 'evening';
  isScattered: boolean; // appears in 2+ time blocks
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Analyze which time blocks an activity appears in most frequently
 */
export function analyzeTimeBlocks(
  activity: string,
  entries: DailyEntry[]
): TimeBlockAnalysis {
  const counts = { morning: 0, afternoon: 0, evening: 0 };
  const activityLower = activity.toLowerCase();

  for (const entry of entries) {
    // Check morning
    if (
      entry.morning_drains.some((d) => d.toLowerCase() === activityLower) ||
      entry.morning_boosts.some((r) => r.toLowerCase() === activityLower) ||
      entry.morning_custom_drain.toLowerCase().includes(activityLower) ||
      entry.morning_custom_boost.toLowerCase().includes(activityLower)
    ) {
      counts.morning++;
    }

    // Check afternoon
    if (
      entry.afternoon_drains.some((d) => d.toLowerCase() === activityLower) ||
      entry.afternoon_boosts.some((r) => r.toLowerCase() === activityLower) ||
      entry.afternoon_custom_drain.toLowerCase().includes(activityLower) ||
      entry.afternoon_custom_boost.toLowerCase().includes(activityLower)
    ) {
      counts.afternoon++;
    }

    // Check evening
    if (
      entry.evening_drains.some((d) => d.toLowerCase() === activityLower) ||
      entry.evening_boosts.some((r) => r.toLowerCase() === activityLower) ||
      entry.evening_custom_drain.toLowerCase().includes(activityLower) ||
      entry.evening_custom_boost.toLowerCase().includes(activityLower)
    ) {
      counts.evening++;
    }
  }

  // Find most common time block
  const mostCommon = (Object.entries(counts) as [keyof typeof counts, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // Check if scattered (appears in 2+ time blocks)
  const blocksWithActivity = Object.values(counts).filter((c) => c > 0).length;
  const isScattered = blocksWithActivity >= 2;

  return {
    ...counts,
    mostCommon,
    isScattered,
  };
}

/**
 * Get suggested duration based on frequency
 */
function getSuggestedDuration(frequency: number): string {
  if (frequency >= 7) return '30-minute';
  if (frequency >= 5) return '20-30 minute';
  return '15-20 minute';
}

/**
 * Get suggested reduced frequency
 */
function getSuggestedReduction(frequency: number): string {
  if (frequency >= 7) return '4-5 times';
  if (frequency >= 5) return '3-4 times';
  return '2-3 times';
}

/**
 * Get suggested increased frequency
 */
function getSuggestedIncrease(frequency: number): string {
  if (frequency <= 2) return '3-4 times';
  if (frequency <= 4) return '5-6 times';
  return 'daily';
}

/**
 * Check if activity is coordination/admin type
 */
function isCoordinationType(activity: string): boolean {
  const keywords = [
    'coordination',
    'admin',
    'administrative',
    'scheduling',
    'planning',
    'organizing',
    'managing',
    'email',
    'meeting',
  ];
  const lower = activity.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

/**
 * Get time block label for display
 */
function getTimeLabel(block: 'morning' | 'afternoon' | 'evening'): string {
  const labels = {
    morning: 'morning',
    afternoon: 'early afternoon',
    evening: 'evening',
  };
  return labels[block];
}

/**
 * Get opposite/better time suggestion
 */
function getBetterTimeSlot(
  currentMostCommon: 'morning' | 'afternoon' | 'evening'
): string {
  // Suggest a different time block
  const suggestions = {
    morning: 'early afternoon when you may have settled into the day',
    afternoon: 'first thing in the morning when energy is often higher',
    evening: 'morning or early afternoon when you may have more capacity',
  };
  return suggestions[currentMostCommon];
}

// ============================================================================
// Drain Experiment Generation
// ============================================================================

/**
 * Select best strategy for a drain pattern
 */
function selectDrainStrategy(
  pattern: PatternInfo,
  timeAnalysis: TimeBlockAnalysis
): ExperimentStrategy {
  const { frequency, avg_energy } = pattern;
  const { isScattered } = timeAnalysis;

  // High frequency (≥5)
  if (frequency >= 5) {
    if (!isScattered) {
      return 'batching'; // Concentrated in one time block
    } else {
      return 'time_shifting'; // Scattered across blocks
    }
  }

  // Medium frequency (3-4)
  if (frequency >= 3) {
    if (avg_energy < 4) {
      return 'buffering'; // Low energy impact - needs recovery
    } else {
      return 'reducing_frequency';
    }
  }

  // Check if coordination/admin type for delegation
  if (isCoordinationType(pattern.activity)) {
    return 'delegating';
  }

  // Default to buffering for lower frequency drains
  return 'buffering';
}

/**
 * Generate experiment text for a drain pattern
 */
function generateDrainExperiment(
  pattern: PatternInfo,
  strategy: ExperimentStrategy,
  timeAnalysis: TimeBlockAnalysis
): string {
  const { activity, frequency } = pattern;
  const { mostCommon } = timeAnalysis;

  switch (strategy) {
    case 'batching':
      return `Consider batching ${activity.toLowerCase()} into one ${getSuggestedDuration(frequency)} block during the ${getTimeLabel(mostCommon)} instead of handling it ${frequency} times throughout the week.`;

    case 'time_shifting':
      return `Worth trying: Move ${activity.toLowerCase()} to ${getBetterTimeSlot(mostCommon)}.`;

    case 'buffering':
      return `Consider adding a 10-15 minute restorative break right after ${activity.toLowerCase()} to recover energy.`;

    case 'reducing_frequency':
      return `Worth trying: Reduce ${activity.toLowerCase()} from ${frequency} times to ${getSuggestedReduction(frequency)} per week.`;

    case 'delegating':
      return `Worth exploring: Identify parts of ${activity.toLowerCase()} that could be handled by someone else or automated.`;

    default:
      return `Consider experimenting with how you approach ${activity.toLowerCase()} to reduce its energy impact.`;
  }
}

/**
 * Generate experiment for a drain pattern
 */
export function generateDrainExperimentSuggestion(
  pattern: PatternInfo,
  entries: DailyEntry[]
): ExperimentSuggestion {
  const timeAnalysis = analyzeTimeBlocks(pattern.activity, entries);
  const strategy = selectDrainStrategy(pattern, timeAnalysis);
  const experiment = generateDrainExperiment(pattern, strategy, timeAnalysis);

  return {
    activity: pattern.activity,
    confidence: pattern.confidence,
    strategy,
    experiment,
    type: 'drain',
  };
}

// ============================================================================
// Boost Experiment Generation
// ============================================================================

/**
 * Select best strategy for a boost pattern
 */
function selectBoostStrategy(
  pattern: PatternInfo,
  _timeAnalysis: TimeBlockAnalysis,
  topDrain: PatternInfo | null
): ExperimentStrategy {
  const { frequency, avg_energy } = pattern;

  // High energy impact (avg > 7) - do more of it
  if (avg_energy > 7) {
    return 'increase_frequency';
  }

  // Low frequency - schedule it
  if (frequency < 3) {
    // If there's a common drain, suggest pairing
    if (topDrain && topDrain.frequency >= 3) {
      return 'pair_it';
    }
    return 'schedule_it';
  }

  // Medium frequency but inconsistent - protect it
  if (frequency >= 3 && frequency <= 5) {
    return 'protect_it';
  }

  // Default to increasing frequency
  return 'increase_frequency';
}

/**
 * Generate experiment text for a boost pattern
 */
function generateBoostExperiment(
  pattern: PatternInfo,
  strategy: ExperimentStrategy,
  topDrain: PatternInfo | null
): string {
  const { activity, frequency } = pattern;

  switch (strategy) {
    case 'schedule_it':
      return `Worth trying: Block ${activity.toLowerCase()} on your calendar as a recurring ${getSuggestedIncrease(frequency)} commitment.`;

    case 'protect_it':
      return `Consider protecting ${activity.toLowerCase()} time by setting boundaries (e.g., phone on Do Not Disturb, closing your door).`;

    case 'increase_frequency':
      return `Consider increasing ${activity.toLowerCase()} from ${frequency} times to ${getSuggestedIncrease(frequency)} per week.`;

    case 'pair_it':
      const drainName = topDrain ? topDrain.activity.toLowerCase() : 'draining activities';
      return `Worth trying: Schedule ${activity.toLowerCase()} right after ${drainName} to create an energy buffer.`;

    default:
      return `Consider making more time for ${activity.toLowerCase()} in your weekly routine.`;
  }
}

/**
 * Generate experiment for a boost pattern
 */
export function generateBoostExperimentSuggestion(
  pattern: PatternInfo,
  entries: DailyEntry[],
  topDrain: PatternInfo | null = null
): ExperimentSuggestion {
  const timeAnalysis = analyzeTimeBlocks(pattern.activity, entries);
  const strategy = selectBoostStrategy(pattern, timeAnalysis, topDrain);
  const experiment = generateBoostExperiment(pattern, strategy, topDrain);

  return {
    activity: pattern.activity,
    confidence: pattern.confidence,
    strategy,
    experiment,
    type: 'boost',
  };
}

// ============================================================================
// Cognitive Load Experiment Generation
// ============================================================================

/**
 * Generate experiment for cognitive load pattern
 * Always uses batching strategy
 */
export function generateCognitiveLoadExperimentSuggestion(
  cognitiveLoad: CognitiveLoadResult
): ExperimentSuggestion {
  const { specific_activities, frequency } = cognitiveLoad;

  // Format activity list (max 3 for readability)
  const activityList = specific_activities
    .slice(0, 3)
    .map((a) => a.toLowerCase())
    .join(', ');

  // Suggest duration based on frequency
  let duration = '30-minute';
  if (frequency >= 7) {
    duration = '45-minute';
  } else if (frequency >= 5) {
    duration = '30-45 minute';
  }

  // Suggest a day (Sunday is common for weekly planning)
  const suggestedDay = 'Sunday evening or Monday morning';

  const experiment = `Consider batching ${activityList} into one ${duration} "command center" session on ${suggestedDay} instead of handling them as they arise throughout the week.`;

  return {
    activity: 'Background Cognitive Load',
    confidence: cognitiveLoad.confidence,
    strategy: 'batching',
    experiment,
    type: 'cognitive_load',
  };
}

// ============================================================================
// Main Generation Function
// ============================================================================

export interface AllExperiments {
  drains: ExperimentSuggestion[];
  boosts: ExperimentSuggestion[];
  cognitiveLoad: ExperimentSuggestion | null;
}

/**
 * Generate all experiments from detected patterns
 */
export function generateAllExperiments(
  drainPatterns: PatternInfo[],
  boostPatterns: PatternInfo[],
  cognitiveLoad: CognitiveLoadResult | null,
  entries: DailyEntry[]
): AllExperiments {
  // Generate drain experiments
  const drainExperiments = drainPatterns.map((pattern) =>
    generateDrainExperimentSuggestion(pattern, entries)
  );

  // Generate boost experiments (pass top drain for potential pairing)
  const topDrain = drainPatterns[0] || null;
  const boostExperiments = boostPatterns.map((pattern) =>
    generateBoostExperimentSuggestion(pattern, entries, topDrain)
  );

  // Generate cognitive load experiment
  const cognitiveLoadExperiment = cognitiveLoad
    ? generateCognitiveLoadExperimentSuggestion(cognitiveLoad)
    : null;

  return {
    drains: drainExperiments,
    boosts: boostExperiments,
    cognitiveLoad: cognitiveLoadExperiment,
  };
}
