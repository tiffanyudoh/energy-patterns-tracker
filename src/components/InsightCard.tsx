import { ExperimentSuggestion } from '@/utils/experimentGeneration';

interface InsightCardProps {
  suggestion: ExperimentSuggestion;
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
export function InsightCard({ suggestion }: InsightCardProps) {
  const { activity, confidence, experiment, type } = suggestion;

  // Determine card styling based on type
  const getCardStyles = () => {
    switch (type) {
      case 'drain':
        return {
          borderColor: 'border-orange-200',
          bgColor: 'bg-orange-50',
          headerColor: 'text-orange-900',
          header: "What's draining your energy?",
        };
      case 'restorer':
        return {
          borderColor: 'border-teal-200',
          bgColor: 'bg-teal-50',
          headerColor: 'text-teal-900',
          header: "What's restoring your energy?",
        };
      case 'cognitive_load':
        return {
          borderColor: 'border-amber-200',
          bgColor: 'bg-amber-50',
          headerColor: 'text-amber-900',
          header: "⚠️ What's draining your energy?",
        };
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
    <div
      className={`
        border rounded-lg p-4
        ${styles.borderColor} ${styles.bgColor}
      `}
    >
      {/* Header */}
      <h3 className={`text-sm font-medium ${styles.headerColor} mb-2`}>
        {styles.header}
      </h3>

      {/* Activity + Confidence */}
      <div className="mb-3">
        <span className="font-medium text-gray-900">{getActivityDisplay()}</span>
        <span className="text-gray-500 text-sm ml-2">— {confidence}</span>
      </div>

      {/* Experiment */}
      <div className="border-t border-gray-200 pt-3">
        <p className="text-sm text-gray-600 leading-relaxed">
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
}

export function InsightCards({
  drainSuggestions,
  restorerSuggestions,
  cognitiveLoadSuggestion,
}: InsightCardsProps) {
  return (
    <div className="space-y-4">
      {/* Drain cards (max 2) */}
      {drainSuggestions.slice(0, 2).map((suggestion, index) => (
        <InsightCard key={`drain-${index}`} suggestion={suggestion} />
      ))}

      {/* Restorer cards (max 2) */}
      {restorerSuggestions.slice(0, 2).map((suggestion, index) => (
        <InsightCard key={`restorer-${index}`} suggestion={suggestion} />
      ))}

      {/* Cognitive load card (if detected) */}
      {cognitiveLoadSuggestion && (
        <InsightCard suggestion={cognitiveLoadSuggestion} />
      )}

      {/* Empty state if no patterns detected */}
      {drainSuggestions.length === 0 &&
        restorerSuggestions.length === 0 &&
        !cognitiveLoadSuggestion && (
          <div className="text-center py-8 text-gray-500">
            <p>No significant patterns detected yet.</p>
            <p className="text-sm mt-1">
              Continue logging to see clearer patterns emerge.
            </p>
          </div>
        )}
    </div>
  );
}
