import { useState, useEffect } from 'react';
import { WeeklySummary } from '@/components/WeeklySummary';
import { InsightCards } from '@/components/InsightCard';
import {
  getWeeklyData,
  detectDrainPatterns,
  detectRestorerPatterns,
  detectCognitiveLoad,
  getCognitiveLoadStats,
  WeeklyData,
  CognitiveLoadStats,
} from '@/utils/patternDetection';
import {
  generateAllExperiments,
  AllExperiments,
} from '@/utils/experimentGeneration';

interface WeeklyInsightsProps {
  onBack: () => void;
}

interface WeekAnalysis {
  weeklyData: WeeklyData;
  experiments: AllExperiments;
  cognitiveLoadStats: CognitiveLoadStats;
}

type AnalysisState =
  | { status: 'loading' }
  | { status: 'insufficient_data'; message: string }
  | {
      status: 'success';
      current: WeekAnalysis;
      previous: WeekAnalysis | null;
    };

/**
 * Weekly Insights Page (Spec 2.6-2.8)
 *
 * Shows weekly pattern analysis:
 * - Weekly summary with battery and trend
 * - Insight cards for drains, restorers, cognitive load
 * - Generated experiments for each pattern
 */
type WeekView = 'current' | 'previous';

export function WeeklyInsights({ onBack }: WeeklyInsightsProps) {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'loading',
  });
  const [weekView, setWeekView] = useState<WeekView>('current');

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = () => {
    setAnalysisState({ status: 'loading' });

    // Get weekly data
    const weeklyResult = getWeeklyData();

    if (!weeklyResult.success) {
      setAnalysisState({
        status: 'insufficient_data',
        message: weeklyResult.error,
      });
      return;
    }

    const weeklyData = weeklyResult.data;

    // Analyze current week
    const currentDrainPatterns = detectDrainPatterns(weeklyData.entries);
    const currentRestorerPatterns = detectRestorerPatterns(weeklyData.entries);
    const currentCognitiveLoad = detectCognitiveLoad(weeklyData.entries);
    const currentCognitiveStats = getCognitiveLoadStats(weeklyData.entries);

    const currentExperiments = generateAllExperiments(
      currentDrainPatterns,
      currentRestorerPatterns,
      currentCognitiveLoad,
      weeklyData.entries
    );

    const currentAnalysis: WeekAnalysis = {
      weeklyData,
      experiments: currentExperiments,
      cognitiveLoadStats: currentCognitiveStats,
    };

    // Analyze previous week (if enough data)
    let previousAnalysis: WeekAnalysis | null = null;

    if (weeklyData.previous_week_days_logged >= 3) {
      const prevDrainPatterns = detectDrainPatterns(weeklyData.previous_week_entries);
      const prevRestorerPatterns = detectRestorerPatterns(weeklyData.previous_week_entries);
      const prevCognitiveLoad = detectCognitiveLoad(weeklyData.previous_week_entries);
      const prevCognitiveStats = getCognitiveLoadStats(weeklyData.previous_week_entries);

      const prevExperiments = generateAllExperiments(
        prevDrainPatterns,
        prevRestorerPatterns,
        prevCognitiveLoad,
        weeklyData.previous_week_entries
      );

      // Create a synthetic WeeklyData for previous week display
      const prevWeeklyData: WeeklyData = {
        entries: weeklyData.previous_week_entries,
        avg_energy: weeklyData.previous_week_avg!,
        previous_week_avg: null, // No week before that
        days_logged: weeklyData.previous_week_days_logged,
        previous_week_entries: [],
        previous_week_days_logged: 0,
      };

      previousAnalysis = {
        weeklyData: prevWeeklyData,
        experiments: prevExperiments,
        cognitiveLoadStats: prevCognitiveStats,
      };
    }

    setAnalysisState({
      status: 'success',
      current: currentAnalysis,
      previous: previousAnalysis,
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg"
            aria-label="Back to daily log"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-text-primary">
            Weekly Patterns
          </h1>
        </div>

        {/* Loading state */}
        {analysisState.status === 'loading' && (
          <div className="text-center py-12">
            <div className="animate-pulse text-text-secondary">
              Analyzing your patterns...
            </div>
          </div>
        )}

        {/* Insufficient data state */}
        {analysisState.status === 'insufficient_data' && (
          <div className="bg-bg-secondary border border-accent-light/50 rounded-lg p-6 text-center shadow-[0_1px_3px_rgba(107,68,68,0.08)]">
            <div className="text-text-tertiary mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-text-primary font-medium mb-2">
              {analysisState.message}
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Log a few more days to see your energy patterns emerge.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-accent-rich text-white rounded-lg hover:brightness-90"
            >
              Back to Daily Log
            </button>
          </div>
        )}

        {/* Success state - show insights */}
        {analysisState.status === 'success' && (
          <div className="space-y-6">
            {/* Week Selector Tabs */}
            {analysisState.previous && (
              <div className="flex gap-2 bg-bg-tertiary p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setWeekView('current')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    weekView === 'current'
                      ? 'bg-bg-secondary text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setWeekView('previous')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    weekView === 'previous'
                      ? 'bg-bg-secondary text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Last Week
                </button>
              </div>
            )}

            {/* Current Week View */}
            {weekView === 'current' && (
              <>
                <WeeklySummary
                  avgEnergy={analysisState.current.weeklyData.avg_energy}
                  previousWeekAvg={analysisState.current.weeklyData.previous_week_avg}
                  daysLogged={analysisState.current.weeklyData.days_logged}
                />
                <InsightCards
                  drainSuggestions={analysisState.current.experiments.drains}
                  restorerSuggestions={analysisState.current.experiments.restorers}
                  cognitiveLoadSuggestion={analysisState.current.experiments.cognitiveLoad}
                  cognitiveLoadComparison={
                    analysisState.previous
                      ? {
                          currentStats: analysisState.current.cognitiveLoadStats,
                          previousStats: analysisState.previous.cognitiveLoadStats,
                        }
                      : undefined
                  }
                />
              </>
            )}

            {/* Previous Week View */}
            {weekView === 'previous' && analysisState.previous && (
              <>
                <WeeklySummary
                  avgEnergy={analysisState.previous.weeklyData.avg_energy}
                  previousWeekAvg={null}
                  daysLogged={analysisState.previous.weeklyData.days_logged}
                />
                <InsightCards
                  drainSuggestions={analysisState.previous.experiments.drains}
                  restorerSuggestions={analysisState.previous.experiments.restorers}
                  cognitiveLoadSuggestion={analysisState.previous.experiments.cognitiveLoad}
                />
              </>
            )}

            {/* Back to daily log button */}
            <div className="pt-4 border-t border-accent-light">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 px-4 text-text-secondary bg-bg-tertiary border border-accent-light rounded-lg hover:bg-accent-light/50"
              >
                Back to Daily Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
