import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { AppState, DailyEntry, WeeklyFocus, CustomCategories, EMPTY_CUSTOM_CATEGORIES } from '@/types';
import {
  getAppState,
  saveEntry,
  setActiveFocus,
  setPreviousFocus,
} from '@/utils/storage';

// Actions
type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SAVE_ENTRY'; payload: DailyEntry }
  | { type: 'SET_ACTIVE_FOCUS'; payload: WeeklyFocus | null }
  | { type: 'SET_PREVIOUS_FOCUS'; payload: WeeklyFocus | null };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SAVE_ENTRY':
      saveEntry(action.payload);
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.payload.date]: action.payload,
        },
      };

    case 'SET_ACTIVE_FOCUS':
      setActiveFocus(action.payload);
      return {
        ...state,
        active_focus: action.payload,
      };

    case 'SET_PREVIOUS_FOCUS':
      setPreviousFocus(action.payload);
      return {
        ...state,
        previous_focus: action.payload,
      };

    default:
      return state;
  }
}

// Initial state
const initialState: AppState = {
  entries: {},
  active_focus: null,
  previous_focus: null,
  last_analysis_date: null,
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  showWeekStrip: boolean;
  setShowWeekStrip: (value: boolean) => void;
  customCategories: CustomCategories;
  setCustomCategories: (value: CustomCategories) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

const SHOW_WEEK_STRIP_KEY = 'show_week_strip';
const CUSTOM_CATEGORIES_KEY = 'custom_categories';

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [showWeekStrip, setShowWeekStripState] = useState(() => {
    const stored = localStorage.getItem(SHOW_WEEK_STRIP_KEY);
    return stored !== null ? JSON.parse(stored) : true;
  });

  const setShowWeekStrip = (value: boolean) => {
    setShowWeekStripState(value);
    localStorage.setItem(SHOW_WEEK_STRIP_KEY, JSON.stringify(value));
  };

  const [customCategories, setCustomCategoriesState] = useState<CustomCategories>(() => {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (stored) {
      try {
        // Merge with defaults so newly added keys (e.g. whole_day_*) are present
        const parsed = JSON.parse(stored);
        const merged = { ...EMPTY_CUSTOM_CATEGORIES, ...parsed };
        localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(merged));
        return merged;
      } catch { /* fall through to create default */ }
    }
    // Key missing or corrupt — seed localStorage immediately
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(EMPTY_CUSTOM_CATEGORIES));
    return EMPTY_CUSTOM_CATEGORIES;
  });

  const setCustomCategories = (value: CustomCategories) => {
    setCustomCategoriesState(value);
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(value));
  };

  // Load persisted state on mount
  useEffect(() => {
    const persistedState = getAppState();
    dispatch({ type: 'LOAD_STATE', payload: persistedState });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showWeekStrip, setShowWeekStrip, customCategories, setCustomCategories }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
