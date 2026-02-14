import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, DailyEntry, WeeklyFocus } from '@/types';
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const persistedState = getAppState();
    dispatch({ type: 'LOAD_STATE', payload: persistedState });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
