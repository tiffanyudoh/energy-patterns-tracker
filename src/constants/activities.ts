// Predefined energy drains (from spec 1.2)
export const PREDEFINED_DRAINS = [
  'Email catch-up',
  'Coordination tasks',
  'Household maintenance',
  'Context switching',
  'Unexpected interruptions',
  'Family obligations',
  'Administrative tasks',
  'Meeting overload',
] as const;

// Display labels with clarifying examples for ambiguous drains
// Keys are the stored values, values are the UI labels
export const DRAIN_DISPLAY_LABELS: Partial<Record<string, string>> = {
  'Administrative tasks': 'Administrative tasks (bills, paperwork, calls)',
  'Coordination tasks': 'Coordination tasks (scheduling, planning, organizing)',
  'Household maintenance': 'Household maintenance (repairs, cleaning, errands)',
};

// Get the display label for a drain, falling back to the stored value
export function getDrainDisplayLabel(drain: string): string {
  return DRAIN_DISPLAY_LABELS[drain] ?? drain;
}

// Predefined energy boosts (from spec 1.2)
export const PREDEFINED_BOOSTS = [
  'Morning coffee alone',
  'Focused work block',
  'Reading',
  'Walking',
  'Creative project time',
  'Quiet time',
  'Exercise',
  'Time in nature',
] as const;

// Battery color mapping (exact hex codes from spec 1.1)
export const BATTERY_COLORS: Record<string, string> = {
  '1': '#8B4513', // muted deep rust
  '2': '#8B4513',
  '3': '#CC5500', // burnt orange
  '4': '#CC5500',
  '5': '#708090', // neutral gray-blue
  '6': '#708090',
  '7': '#90EE90', // soft green
  '8': '#90EE90',
  '9': '#008B8B', // calm teal
  '10': '#008B8B',
};

// Get battery color for a given energy level
export function getBatteryColor(level: number): string {
  if (level <= 2) return BATTERY_COLORS['1'];
  if (level <= 4) return BATTERY_COLORS['3'];
  if (level <= 6) return BATTERY_COLORS['5'];
  if (level <= 8) return BATTERY_COLORS['7'];
  return BATTERY_COLORS['9'];
}

// Time block labels
export const TIME_BLOCK_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
} as const;
