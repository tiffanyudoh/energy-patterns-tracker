import { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { DailyLog } from '@/pages/DailyLog';
import { WeeklyInsights } from '@/pages/WeeklyInsights';
import { Settings } from '@/pages/Settings';

type View = 'daily' | 'insights' | 'settings';

/**
 * Energy Patterns Tracker - Main App Component
 *
 * Phase 1: Daily Logging (MVP Core)
 * - Battery visualization
 * - Time-blocked activity selection
 * - Save/edit functionality
 * - Read-only vs edit modes
 * - Date navigation
 *
 * Phase 2: Weekly Pattern Analysis
 * - Pattern detection (drains, restorers, cognitive load)
 * - Experiment generation
 * - Weekly summary and insight cards
 */
function App() {
  const [currentView, setCurrentView] = useState<View>('daily');

  return (
    <AppProvider>
      <Layout onSettingsClick={() => setCurrentView('settings')}>
        {currentView === 'daily' && (
          <DailyLog onAnalyze={() => setCurrentView('insights')} />
        )}
        {currentView === 'insights' && (
          <WeeklyInsights onBack={() => setCurrentView('daily')} />
        )}
        {currentView === 'settings' && (
          <Settings onBack={() => setCurrentView('daily')} />
        )}
      </Layout>
    </AppProvider>
  );
}

export default App;
