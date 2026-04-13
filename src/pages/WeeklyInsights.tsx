import { useState, useEffect, useMemo } from 'react';
import { WeeklySummary } from '@/components/WeeklySummary';
import { InsightCards } from '@/components/InsightCard';
import {
  getWeeklyData,
  detectDrainPatterns,
  detectBoostPatterns,
  detectCognitiveLoad,
  getCognitiveLoadStats,
  WeeklyData,
  CognitiveLoadStats,
} from '@/utils/patternDetection';
import {
  generateAllExperiments,
  AllExperiments,
} from '@/utils/experimentGeneration';
import { getEntries } from '@/utils/storage';
import { analyzeTimeCorrelations, ActivityTimeCorrelation } from '@/utils/timeCorrelationAnalysis';

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
 * - Insight cards for drains, boosts, cognitive load
 * - Generated experiments for each pattern
 */
type WeekView = 'current' | 'previous';

export function WeeklyInsights({ onBack }: WeeklyInsightsProps) {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'loading',
  });
  const [weekView, setWeekView] = useState<WeekView>('current');

  const timeCorrelations = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allEntries = getEntries();
    const recentEntries = Object.values(allEntries).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= thirtyDaysAgo;
    });

    return analyzeTimeCorrelations(recentEntries);
  }, [analysisState]);

  // Debug logging for time correlations
  useEffect(() => {
    if (timeCorrelations.length > 0) {
      console.log('Time Correlations Found:', timeCorrelations);
      console.log('Sample correlation:', timeCorrelations[0]);
    } else {
      console.log('No significant time correlations detected');
    }
  }, [timeCorrelations]);

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
    const currentBoostPatterns = detectBoostPatterns(weeklyData.entries);
    const currentCognitiveLoad = detectCognitiveLoad(weeklyData.entries);
    const currentCognitiveStats = getCognitiveLoadStats(weeklyData.entries);

    const currentExperiments = generateAllExperiments(
      currentDrainPatterns,
      currentBoostPatterns,
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
      const prevBoostPatterns = detectBoostPatterns(weeklyData.previous_week_entries);
      const prevCognitiveLoad = detectCognitiveLoad(weeklyData.previous_week_entries);
      const prevCognitiveStats = getCognitiveLoadStats(weeklyData.previous_week_entries);

      const prevExperiments = generateAllExperiments(
        prevDrainPatterns,
        prevBoostPatterns,
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
                  boostSuggestions={analysisState.current.experiments.boosts}
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

                {/* Time-of-Day Correlation Insights */}
                <section className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">
                    Time-of-Day Insights
                  </h3>

                  {timeCorrelations.length === 0 && (
                    <p className="text-sm italic text-text-tertiary">
                      No significant time-of-day patterns detected yet. Keep logging to see which
                      times work best for different activities.
                    </p>
                  )}

                  {timeCorrelations.length > 0 && (
                    <>
                      <p className="text-sm mb-4 text-text-secondary">
                        These activities affect your energy differently depending on when they occur.
                      </p>

                      {timeCorrelations.slice(0, 3).map(correlation => (
                        <TimeCorrelationCard key={correlation.activity} correlation={correlation} />
                      ))}
                    </>
                  )}
                </section>
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
                  boostSuggestions={analysisState.previous.experiments.boosts}
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

function TimeCorrelationCard({ correlation }: { correlation: ActivityTimeCorrelation }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="mb-3 p-3 rounded-lg"
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: `3px solid var(--${correlation.type === 'drain' ? 'error' : 'success'})`,
      }}
    >
      {/* Compact header with just the recommendation */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
          {correlation.recommendation}
        </p>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs shrink-0 px-2 py-1 rounded"
          style={{
            color: 'var(--accent)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--accent-light)',
          }}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Expandable details section */}
      {showDetails && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--accent-light)' }}>
          <div className="grid grid-cols-3 gap-3 text-xs mb-2">
            <TimeBlockDetail
              label="Morning"
              stats={correlation.morning}
              isBest={correlation.bestTime === 'morning'}
              isWorst={correlation.worstTime === 'morning'}
            />
            <TimeBlockDetail
              label="Afternoon"
              stats={correlation.afternoon}
              isBest={correlation.bestTime === 'afternoon'}
              isWorst={correlation.worstTime === 'afternoon'}
            />
            <TimeBlockDetail
              label="Evening"
              stats={correlation.evening}
              isBest={correlation.bestTime === 'evening'}
              isWorst={correlation.worstTime === 'evening'}
            />
          </div>

          {correlation.energyDifference && (
            <div
              className="text-xs font-medium mt-2 pt-2"
              style={{
                color: 'var(--text-tertiary)',
                borderTop: '1px solid var(--accent-light)',
              }}
            >
              Impact: {correlation.energyDifference.toFixed(1)} point difference between best and worst times
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TimeBlockDetail({ label, stats, isBest, isWorst }: {
  label: string;
  stats: { count: number; avgEnergy: number };
  isBest: boolean;
  isWorst: boolean;
}) {
  return (
    <div>
      <div className="mb-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>
        {label} {isWorst && '\u26A0\uFE0F'}{isBest && '\u2713'}
      </div>
      <div
        className="font-semibold"
        style={{
          color: isWorst
            ? 'var(--error)'
            : isBest
            ? 'var(--success)'
            : 'var(--text-primary)',
        }}
      >
        {stats.avgEnergy.toFixed(1)}
      </div>
      <div style={{ color: 'var(--text-tertiary)' }}>
        {stats.count} {stats.count === 1 ? 'time' : 'times'}
      </div>
    </div>
  );
}
