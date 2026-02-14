import { useState, useEffect } from 'react';
import { WeeklySummary } from '@/components/WeeklySummary';
import { InsightCards } from '@/components/InsightCard';
import {
  getWeeklyData,
  detectDrainPatterns,
  detectRestorerPatterns,
  detectCognitiveLoad,
  WeeklyData,
} from '@/utils/patternDetection';
import {
  generateAllExperiments,
  AllExperiments,
} from '@/utils/experimentGeneration';

interface WeeklyInsightsProps {
  onBack: () => void;
}

type AnalysisState =
  | { status: 'loading' }
  | { status: 'insufficient_data'; message: string }
  | { status: 'success'; weeklyData: WeeklyData; experiments: AllExperiments };

/**
 * Weekly Insights Page (Spec 2.6-2.8)
 *
 * Shows weekly pattern analysis:
 * - Weekly summary with battery and trend
 * - Insight cards for drains, restorers, cognitive load
 * - Generated experiments for each pattern
 */
export function WeeklyInsights({ onBack }: WeeklyInsightsProps) {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'loading',
  });

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

    // Detect patterns
    const drainPatterns = detectDrainPatterns(weeklyData.entries);
    const restorerPatterns = detectRestorerPatterns(weeklyData.entries);
    const cognitiveLoad = detectCognitiveLoad(weeklyData.entries);

    // Generate experiments
    const experiments = generateAllExperiments(
      drainPatterns,
      restorerPatterns,
      cognitiveLoad,
      weeklyData.entries
    );

    setAnalysisState({
      status: 'success',
      weeklyData,
      experiments,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
          <h1 className="text-xl font-semibold text-gray-900">
            Weekly Patterns
          </h1>
        </div>

        {/* Loading state */}
        {analysisState.status === 'loading' && (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">
              Analyzing your patterns...
            </div>
          </div>
        )}

        {/* Insufficient data state */}
        {analysisState.status === 'insufficient_data' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-4">
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
            <p className="text-gray-700 font-medium mb-2">
              {analysisState.message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Log a few more days to see your energy patterns emerge.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Daily Log
            </button>
          </div>
        )}

        {/* Success state - show insights */}
        {analysisState.status === 'success' && (
          <div className="space-y-6">
            {/* Weekly Summary */}
            <WeeklySummary
              avgEnergy={analysisState.weeklyData.avg_energy}
              previousWeekAvg={analysisState.weeklyData.previous_week_avg}
              daysLogged={analysisState.weeklyData.days_logged}
            />

            {/* Insight Cards */}
            <InsightCards
              drainSuggestions={analysisState.experiments.drains}
              restorerSuggestions={analysisState.experiments.restorers}
              cognitiveLoadSuggestion={analysisState.experiments.cognitiveLoad}
            />

            {/* Back to daily log button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
