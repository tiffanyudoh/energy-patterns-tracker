import { ExperimentSuggestion } from '@/utils/experimentGeneration';
import { CognitiveLoadStats } from '@/utils/patternDetection';

interface InsightCardProps {
  suggestion: ExperimentSuggestion;
  previousWeekComparison?: {
    prevFrequency: number;
    currentFrequency: number;
  };
}

/**
 * Insight Card Component (Spec 2.7)
 *
 * Three card types:
 * 1. DRAIN CARD - "What's draining your energy?"
 * 2. RESTORER CARD - "What's restoring your energy?"
 * 3. COGNITIVE LOAD CARD - "⚠️ What's draining your energy?"
 *
 * Styling: Compact, friendly, minimal
 */
export function InsightCard({ suggestion, previousWeekComparison }: InsightCardProps) {
  const { activity, confidence, experiment, type } = suggestion;

  // Determine card styling based on type - using ribbon accents
  const getCardStyles = () => {
    switch (type) {
      case 'drain':
        return {
          cardClass: 'bg-bg-secondary border-l-4 border-l-drain-accent border border-accent-light/50 shadow-[0_1px_3px_rgba(107,68,68,0.08)]',
          headerColor: 'text-drain-accent',
          header: "What's draining your energy?",
          badgeBg: 'bg-drain-accent/15',
          linkColor: 'text-accent-rich',
        };
      case 'restorer':
        return {
          cardClass: 'bg-bg-secondary border-l-4 border-l-restorer-accent border border-accent-light/50 shadow-[0_1px_3px_rgba(107,68,68,0.08)]',
          headerColor: 'text-restorer-accent',
          header: "What's restoring your energy?",
          badgeBg: 'bg-restorer-accent/15',
          linkColor: 'text-accent-rich',
        };
      case 'cognitive_load':
        return {
          cardClass: 'bg-bg-secondary border-l-4 border-l-accent-rich border border-accent-light/50 shadow-[0_1px_3px_rgba(107,68,68,0.08)]',
          headerColor: 'text-accent-rich',
          header: "⚠️ Cognitive Load",
          badgeBg: 'bg-accent-rich/15',
          linkColor: 'text-accent-rich',
        };
    }
  };

  // Get confidence badge styling
  const getConfidenceBadgeStyles = () => {
    switch (confidence) {
      case 'Strong pattern':
        return 'bg-accent-rich text-white px-2 py-0.5 rounded-xl text-xs font-medium';
      case 'Emerging pattern':
        return `${styles.badgeBg} text-text-primary px-2 py-0.5 rounded-xl text-xs font-medium`;
      case 'Weak signal':
        return 'bg-accent/15 text-text-secondary px-2 py-0.5 rounded-xl text-xs font-medium';
      default:
        return 'bg-accent/15 text-text-secondary px-2 py-0.5 rounded-xl text-xs font-medium';
    }
  };

  const styles = getCardStyles();

  // Format activity display
  const getActivityDisplay = () => {
    if (type === 'cognitive_load') {
      return `Background Cognitive Load: ${activity.replace('Background Cognitive Load', '').trim() || 'Coordination & planning tasks'}`;
    }
    return activity;
  };

  return (
    <div className={`rounded-lg p-4 ${styles.cardClass}`}>
      {/* Header */}
      <h3 className={`text-sm font-semibold ${styles.headerColor} mb-2`}>
        {styles.header}
      </h3>

      {/* Activity + Confidence Badge */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-text-primary">{getActivityDisplay()}</span>
          <span className={getConfidenceBadgeStyles()}>{confidence}</span>
        </div>
        {/* Comparison to previous week */}
        {previousWeekComparison && previousWeekComparison.prevFrequency > 0 && (
          <div className="mt-2 text-sm">
            {previousWeekComparison.currentFrequency > previousWeekComparison.prevFrequency ? (
              <span className="text-drain-accent">
                ↑ Up from {previousWeekComparison.prevFrequency}x last week
              </span>
            ) : previousWeekComparison.currentFrequency < previousWeekComparison.prevFrequency ? (
              <span className="text-restorer-accent">
                ↓ Down from {previousWeekComparison.prevFrequency}x last week
              </span>
            ) : (
              <span className="text-text-secondary">
                → Same as last week ({previousWeekComparison.prevFrequency}x)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Experiment */}
      <div className="border-t border-accent-light pt-3">
        <p className="text-sm text-text-secondary leading-relaxed">
          {experiment}
        </p>
      </div>
    </div>
  );
}

/**
 * Container for all insight cards in correct display order
 */
interface InsightCardsProps {
  drainSuggestions: ExperimentSuggestion[];
  restorerSuggestions: ExperimentSuggestion[];
  cognitiveLoadSuggestion: ExperimentSuggestion | null;
  cognitiveLoadComparison?: {
    currentStats: CognitiveLoadStats;
    previousStats: CognitiveLoadStats;
  };
}

export function InsightCards({
  drainSuggestions,
  restorerSuggestions,
  cognitiveLoadSuggestion,
  cognitiveLoadComparison,
}: InsightCardsProps) {
  // Build cognitive load comparison for display
  const cogLoadComparison = cognitiveLoadComparison && cognitiveLoadComparison.previousStats.frequency > 0
    ? {
        prevFrequency: cognitiveLoadComparison.previousStats.frequency,
        currentFrequency: cognitiveLoadComparison.currentStats.frequency,
      }
    : undefined;

  return (
    <div className="space-y-4">
      {/* Top drain card (max 1) */}
      {drainSuggestions.slice(0, 1).map((suggestion, index) => (
        <InsightCard key={`drain-${index}`} suggestion={suggestion} />
      ))}

      {/* Top restorer card (max 1) */}
      {restorerSuggestions.slice(0, 1).map((suggestion, index) => (
        <InsightCard key={`restorer-${index}`} suggestion={suggestion} />
      ))}

      {/* Cognitive load card - always shown */}
      {cognitiveLoadSuggestion ? (
        <InsightCard
          suggestion={cognitiveLoadSuggestion}
          previousWeekComparison={cogLoadComparison}
        />
      ) : (
        <CognitiveLoadWithinLimitsCard comparison={cognitiveLoadComparison} />
      )}

      {/* Empty state if no drain/restorer patterns detected */}
      {drainSuggestions.length === 0 &&
        restorerSuggestions.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            <p>No significant patterns detected yet.</p>
            <p className="text-sm mt-1">
              Continue logging to see clearer patterns emerge.
            </p>
          </div>
        )}
    </div>
  );
}

/**
 * Card shown when cognitive load is within normal limits
 */
interface CognitiveLoadWithinLimitsCardProps {
  comparison?: {
    currentStats: CognitiveLoadStats;
    previousStats: CognitiveLoadStats;
  };
}

function CognitiveLoadWithinLimitsCard({ comparison }: CognitiveLoadWithinLimitsCardProps) {
  const currentFreq = comparison?.currentStats.frequency ?? 0;
  const prevFreq = comparison?.previousStats.frequency ?? 0;

  return (
    <div className="bg-bg-secondary border-l-4 border-l-restorer-accent border border-accent-light/50 rounded-lg p-4 shadow-[0_1px_3px_rgba(107,68,68,0.08)]">
      <h3 className="text-sm font-semibold text-restorer-accent mb-2">
        ✓ Cognitive Load
      </h3>
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">Within normal limits</span>
          <span className="bg-restorer-accent/15 text-text-primary px-2 py-0.5 rounded-xl text-xs font-medium">
            Healthy
          </span>
        </div>
        {/* Comparison to previous week */}
        {comparison && prevFreq > 0 && (
          <div className="mt-2 text-sm">
            {currentFreq < prevFreq ? (
              <span className="text-restorer-accent">
                ↓ Down from {prevFreq} coordination tasks last week
              </span>
            ) : currentFreq > prevFreq ? (
              <span className="text-text-secondary">
                ↑ Up from {prevFreq} tasks, but still within limits
              </span>
            ) : (
              <span className="text-text-secondary">
                → Same as last week ({prevFreq} tasks)
              </span>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-accent-light pt-3">
        <p className="text-sm text-text-secondary leading-relaxed">
          No significant coordination or planning burden detected this week. Keep it up!
        </p>
      </div>
    </div>
  );
}
