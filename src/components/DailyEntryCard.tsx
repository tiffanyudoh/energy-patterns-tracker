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
      <h4 className="text-sm font-medium text-gray-900">{label}</h4>

      {/* Drains */}
      <div className="text-sm">
        <span className="text-gray-500">Drains: </span>
        {hasDrains ? (
          <span className="text-gray-700">
            {drains.join(', ')}
            {drains.length > 0 && customDrain.trim() && ', '}
            {customDrain.trim() && (
              <span className="italic">"{customDrain.trim()}"</span>
            )}
          </span>
        ) : (
          <span className="text-gray-400">(none)</span>
        )}
      </div>

      {/* Restorers */}
      <div className="text-sm">
        <span className="text-gray-500">Restorers: </span>
        {hasRestorers ? (
          <span className="text-gray-700">
            {restorers.join(', ')}
            {restorers.length > 0 && customRestorer.trim() && ', '}
            {customRestorer.trim() && (
              <span className="italic">"{customRestorer.trim()}"</span>
            )}
          </span>
        ) : (
          <span className="text-gray-400">(none)</span>
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
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Energy Level
        </h3>
        <Battery value={entry.energy_score} interactive={false} />
      </div>

      {/* Time blocks */}
      <div className="space-y-4 bg-white rounded-lg border border-gray-200 p-4">
        {/* Morning */}
        <TimeBlockDisplay
          label={TIME_BLOCK_LABELS.morning}
          drains={entry.morning_drains}
          restorers={entry.morning_restorers}
          customDrain={entry.morning_custom_drain}
          customRestorer={entry.morning_custom_restorer}
        />

        <hr className="border-gray-100" />

        {/* Afternoon */}
        <TimeBlockDisplay
          label={TIME_BLOCK_LABELS.afternoon}
          drains={entry.afternoon_drains}
          restorers={entry.afternoon_restorers}
          customDrain={entry.afternoon_custom_drain}
          customRestorer={entry.afternoon_custom_restorer}
        />

        <hr className="border-gray-100" />

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
            <hr className="border-gray-100" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Other Notes</h4>
              {entry.custom_drain.trim() && (
                <div className="text-sm">
                  <span className="text-gray-500">Drains: </span>
                  <span className="text-gray-700 italic">
                    "{entry.custom_drain.trim()}"
                  </span>
                </div>
              )}
              {entry.custom_restorer.trim() && (
                <div className="text-sm">
                  <span className="text-gray-500">Restorers: </span>
                  <span className="text-gray-700 italic">
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
        className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
