import { DailyEntry } from '@/types';
import { Battery } from './Battery';
import { TIME_BLOCK_LABELS } from '@/constants/activities';

interface DailyEntryCardProps {
  entry: DailyEntry;
  onEdit: () => void;
}

interface TimeBlockDisplayProps {
  label: string;
  drains: string[];
  restorers: string[];
  customDrain: string;
  customRestorer: string;
}

/**
 * Read-only display for a time block
 */
function TimeBlockDisplay({
  label,
  drains,
  restorers,
  customDrain,
  customRestorer,
}: TimeBlockDisplayProps) {
  const hasDrains = drains.length > 0 || customDrain.trim();
  const hasRestorers = restorers.length > 0 || customRestorer.trim();

  return (
    <div className="space-y-2">
      <h4 className="text-[0.9375rem] font-semibold text-accent">{label}</h4>

      {/* Drains */}
      <div className="text-sm">
        <span className="text-text-secondary">Drains: </span>
        {hasDrains ? (
          <span className="text-text-primary">
            {drains.join(', ')}
            {drains.length > 0 && customDrain.trim() && ', '}
            {customDrain.trim() && (
              <span className="italic text-text-secondary">"{customDrain.trim()}"</span>
            )}
          </span>
        ) : (
          <span className="text-text-tertiary">(none)</span>
        )}
      </div>

      {/* Restorers */}
      <div className="text-sm">
        <span className="text-text-secondary">Restorers: </span>
        {hasRestorers ? (
          <span className="text-text-primary">
            {restorers.join(', ')}
            {restorers.length > 0 && customRestorer.trim() && ', '}
            {customRestorer.trim() && (
              <span className="italic text-text-secondary">"{customRestorer.trim()}"</span>
            )}
          </span>
        ) : (
          <span className="text-text-tertiary">(none)</span>
        )}
      </div>
    </div>
  );
}

/**
 * Daily Entry Card Component (Spec 1.5)
 *
 * Read-only display of saved entry:
 * - Battery (display only, not interactive)
 * - Time blocks shown as organized lists
 * - Custom items in quotation marks/italic
 * - Edit button to switch to form mode
 */
export function DailyEntryCard({ entry, onEdit }: DailyEntryCardProps) {
  const hasWholeDayNotes = entry.custom_drain.trim() || entry.custom_restorer.trim();

  return (
    <div className="space-y-6">
      {/* Battery display */}
      <div className="flex flex-col items-center py-4">
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Energy Level
        </h3>
        <Battery value={entry.energy_score} interactive={false} />
      </div>

      {/* Time blocks */}
      <div className="space-y-4 bg-bg-secondary rounded-lg border-l-2 border-l-accent border border-accent-light/50 p-4 shadow-[0_1px_2px_rgba(156,139,122,0.06)]">
        {/* Morning */}
        <TimeBlockDisplay
          label={TIME_BLOCK_LABELS.morning}
          drains={entry.morning_drains}
          restorers={entry.morning_restorers}
          customDrain={entry.morning_custom_drain}
          customRestorer={entry.morning_custom_restorer}
        />

        <hr className="border-accent-light/50" />

        {/* Afternoon */}
        <TimeBlockDisplay
          label={TIME_BLOCK_LABELS.afternoon}
          drains={entry.afternoon_drains}
          restorers={entry.afternoon_restorers}
          customDrain={entry.afternoon_custom_drain}
          customRestorer={entry.afternoon_custom_restorer}
        />

        <hr className="border-accent-light/50" />

        {/* Evening */}
        <TimeBlockDisplay
          label={TIME_BLOCK_LABELS.evening}
          drains={entry.evening_drains}
          restorers={entry.evening_restorers}
          customDrain={entry.evening_custom_drain}
          customRestorer={entry.evening_custom_restorer}
        />

        {/* Whole-day notes (if any) */}
        {hasWholeDayNotes && (
          <>
            <hr className="border-accent-light/50" />
            <div className="space-y-2">
              <h4 className="text-[0.9375rem] font-semibold text-accent">Other Notes</h4>
              {entry.custom_drain.trim() && (
                <div className="text-sm">
                  <span className="text-text-secondary">Drains: </span>
                  <span className="text-text-secondary italic">
                    "{entry.custom_drain.trim()}"
                  </span>
                </div>
              )}
              {entry.custom_restorer.trim() && (
                <div className="text-sm">
                  <span className="text-text-secondary">Restorers: </span>
                  <span className="text-text-secondary italic">
                    "{entry.custom_restorer.trim()}"
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        className="w-full py-3 px-4 border border-accent rounded-lg text-accent font-medium hover:border-accent-rich hover:text-accent-rich bg-transparent"
      >
        Edit
      </button>
    </div>
  );
}
