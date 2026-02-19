// Daily Entry Schema (from spec)
export interface DailyEntry {
  date: string; // YYYY-MM-DD
  energy_score: number; // 1-10
  morning_drains: string[];
  morning_custom_drain: string;
  morning_boosts: string[];
  morning_custom_boost: string;
  afternoon_drains: string[];
  afternoon_custom_drain: string;
  afternoon_boosts: string[];
  afternoon_custom_boost: string;
  evening_drains: string[];
  evening_custom_drain: string;
  evening_boosts: string[];
  evening_custom_boost: string;
  custom_drain: string; // Whole-day custom
  custom_boost: string; // Whole-day custom
}

// Weekly Focus Schema (for Phase 3)
export interface WeeklyFocus {
  focus_id: string;
  focus_text: string;
  focus_type: 'drain_reduce' | 'boost_increase' | 'cognitive_load';
  pattern_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD (start + 7 days)
  impact_feedback: null | 'yes' | 'somewhat' | 'no' | 'hard_to_tell';
}

// App State (for context)
export interface AppState {
  entries: Record<string, DailyEntry>; // keyed by date
  active_focus: WeeklyFocus | null;
  previous_focus: WeeklyFocus | null;
  last_analysis_date: string | null;
}

// Time block type
export type TimeBlock = 'morning' | 'afternoon' | 'evening';

// Category type for drains/boosts
export type CategoryType = 'drains' | 'boosts';

// Custom categories saved per time block
export interface CustomCategories {
  morning_drains: string[];
  morning_boosts: string[];
  afternoon_drains: string[];
  afternoon_boosts: string[];
  evening_drains: string[];
  evening_boosts: string[];
  whole_day_drains: string[];
  whole_day_boosts: string[];
}

export const EMPTY_CUSTOM_CATEGORIES: CustomCategories = {
  morning_drains: [],
  morning_boosts: [],
  afternoon_drains: [],
  afternoon_boosts: [],
  evening_drains: [],
  evening_boosts: [],
  whole_day_drains: [],
  whole_day_boosts: [],
};

// Battery component props
export interface BatteryProps {
  value: number; // 1-10
  onChange?: (newScore: number) => void;
  interactive?: boolean;
}

// Create an empty daily entry
export function createEmptyEntry(date: string): DailyEntry {
  return {
    date,
    energy_score: 5, // Default to middle
    morning_drains: [],
    morning_custom_drain: '',
    morning_boosts: [],
    morning_custom_boost: '',
    afternoon_drains: [],
    afternoon_custom_drain: '',
    afternoon_boosts: [],
    afternoon_custom_boost: '',
    evening_drains: [],
    evening_custom_drain: '',
    evening_boosts: [],
    evening_custom_boost: '',
    custom_drain: '',
    custom_boost: '',
  };
}
