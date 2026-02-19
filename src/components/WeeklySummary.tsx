import { Battery } from './Battery';

interface WeeklySummaryProps {
  avgEnergy: number;
  previousWeekAvg: number | null;
  daysLogged: number;
}

/**
 * Weekly Summary Component (Spec 2.6)
 *
 * Displays:
 * - Heading: "Your Week in Energy"
 * - Battery visualization (display only)
 * - Average energy for the week
 * - Trend vs previous week (if available)
 */
export function WeeklySummary({
  avgEnergy,
  previousWeekAvg,
  daysLogged,
}: WeeklySummaryProps) {
  // Calculate trend
  const getTrend = (): { symbol: string; text: string } | null => {
    if (previousWeekAvg === null) {
      return null; // First week, no comparison
    }

    const diff = avgEnergy - previousWeekAvg;

    if (diff >= 1.0) {
      return { symbol: '↑', text: `up from ${previousWeekAvg}` };
    } else if (diff <= -1.0) {
      return { symbol: '↓', text: `down from ${previousWeekAvg}` };
    } else {
      return { symbol: '→', text: 'stable' };
    }
  };

  const trend = getTrend();

  // Round avgEnergy to nearest integer for battery display
  const batteryValue = Math.round(avgEnergy);

  return (
    <div className="bg-bg-secondary border border-accent-light/50 rounded-lg p-6 shadow-[0_1px_3px_rgba(107,68,68,0.08)]">
      {/* Heading */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Your Week in Energy
      </h2>

      {/* Battery + Average */}
      <div className="flex flex-col items-center gap-3">
        <Battery value={batteryValue} interactive={false} />

        <div className="text-center">
          <span className="text-xl font-medium text-text-primary">
            Average: {avgEnergy}/10
          </span>
          <span className="text-sm text-text-secondary ml-2">
            ({daysLogged} days logged)
          </span>
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Trend vs last week:</span>
            <span
              className={`font-medium ${
                trend.symbol === '↑'
                  ? 'text-boost-accent'
                  : trend.symbol === '↓'
                  ? 'text-drain-accent'
                  : 'text-accent'
              }`}
            >
              {trend.symbol} ({trend.text})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
