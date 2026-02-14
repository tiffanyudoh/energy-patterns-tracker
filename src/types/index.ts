// Daily Entry Schema (from spec)
export interface DailyEntry {
  date: string; // YYYY-MM-DD
  energy_score: number; // 1-10
  morning_drains: string[];
  morning_custom_drain: string;
  morning_restorers: string[];
  morning_custom_restorer: string;
  afternoon_drains: string[];
  afternoon_custom_drain: string;
  afternoon_restorers: string[];
  afternoon_custom_restorer: string;
  evening_drains: string[];
  evening_custom_drain: string;
  evening_restorers: string[];
  evening_custom_restorer: string;
  custom_drain: string; // Whole-day custom
  custom_restorer: string; // Whole-day custom
}

// Weekly Focus Schema (for Phase 3)
export interface WeeklyFocus {
  focus_id: string;
  focus_text: string;
  focus_type: 'drain_reduce' | 'restorer_increase' | 'cognitive_load';
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
    morning_restorers: [],
    morning_custom_restorer: '',
    afternoon_drains: [],
    afternoon_custom_drain: '',
    afternoon_restorers: [],
    afternoon_custom_restorer: '',
    evening_drains: [],
    evening_custom_drain: '',
    evening_restorers: [],
    evening_custom_restorer: '',
    custom_drain: '',
    custom_restorer: '',
  };
}
