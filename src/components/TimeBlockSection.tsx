import { useState } from 'react';
import { DailyEntry, TimeBlock as TimeBlockType } from '@/types';
import { TimeBlock } from './TimeBlock';
import { getCurrentTimeBlock } from '@/utils/dateUtils';
import { useAppContext } from '@/context/AppContext';

interface TimeBlockSectionProps {
  entry: DailyEntry;
  onEntryChange: (updates: Partial<DailyEntry>) => void;
}

/**
 * Container for all three time blocks plus whole-day custom fields (Spec 1.2)
 *
 * - Morning, Afternoon, Evening collapsible blocks
 * - Auto-expands current time block based on system time
 * - Whole-day custom drain/boost fields below all blocks
 * - Total: 8 custom text fields (6 time-specific + 2 whole-day)
 */
export function TimeBlockSection({ entry, onEntryChange }: TimeBlockSectionProps) {
  const { customCategories, setCustomCategories } = useAppContext();
  const [wholeDrainSaved, setWholeDrainSaved] = useState(false);
  const [wholeBoostSaved, setWholeBoostSaved] = useState(false);
  const [wholeDrainError, setWholeDrainError] = useState('');
  const [wholeBoostError, setWholeBoostError] = useState('');
  const [pendingWholeDay, setPendingWholeDay] = useState<{
    text: string;
    type: 'drains' | 'boosts';
  } | null>(null);

  const timeBlocks: TimeBlockType[] = ['morning', 'afternoon', 'evening'];
  const currentTimeBlock = getCurrentTimeBlock();

  const getTimeBlockProps = (block: TimeBlockType) => {
    switch (block) {
      case 'morning':
        return {
          selectedDrains: entry.morning_drains,
          selectedBoosts: entry.morning_boosts,
          customDrain: entry.morning_custom_drain,
          customBoost: entry.morning_custom_boost,
          onDrainsChange: (drains: string[]) => onEntryChange({ morning_drains: drains }),
          onBoostsChange: (boosts: string[]) => onEntryChange({ morning_boosts: boosts }),
          onCustomDrainChange: (value: string) => onEntryChange({ morning_custom_drain: value }),
          onCustomBoostChange: (value: string) => onEntryChange({ morning_custom_boost: value }),
        };
      case 'afternoon':
        return {
          selectedDrains: entry.afternoon_drains,
          selectedBoosts: entry.afternoon_boosts,
          customDrain: entry.afternoon_custom_drain,
          customBoost: entry.afternoon_custom_boost,
          onDrainsChange: (drains: string[]) => onEntryChange({ afternoon_drains: drains }),
          onBoostsChange: (boosts: string[]) => onEntryChange({ afternoon_boosts: boosts }),
          onCustomDrainChange: (value: string) => onEntryChange({ afternoon_custom_drain: value }),
          onCustomBoostChange: (value: string) => onEntryChange({ afternoon_custom_boost: value }),
        };
      case 'evening':
        return {
          selectedDrains: entry.evening_drains,
          selectedBoosts: entry.evening_boosts,
          customDrain: entry.evening_custom_drain,
          customBoost: entry.evening_custom_boost,
          onDrainsChange: (drains: string[]) => onEntryChange({ evening_drains: drains }),
          onBoostsChange: (boosts: string[]) => onEntryChange({ evening_boosts: boosts }),
          onCustomDrainChange: (value: string) => onEntryChange({ evening_custom_drain: value }),
          onCustomBoostChange: (value: string) => onEntryChange({ evening_custom_boost: value }),
        };
    }
  };

  const initiateWholeDaySave = (
    value: string,
    type: 'drains' | 'boosts',
    setError: (v: string) => void,
  ) => {
    const text = value.trim();
    if (!text) return;
    if (text.length > 50) {
      setError('Too long (max 50 characters)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const key = type === 'drains' ? 'whole_day_drains' : 'whole_day_boosts';
    const existing = customCategories[key] || [];

    if (existing.some((cat) => cat.toLowerCase() === text.toLowerCase())) {
      setError('Already saved as a category');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setPendingWholeDay({ text, type });
  };

  const handleConfirmWholeDay = () => {
    if (!pendingWholeDay) return;
    const { text, type } = pendingWholeDay;

    // Save to custom categories
    const key = type === 'drains' ? 'whole_day_drains' : 'whole_day_boosts';
    const existing = customCategories[key] || [];
    setCustomCategories({
      ...customCategories,
      [key]: [...existing, text],
    });

    // Auto-check in all three time blocks
    if (type === 'drains') {
      onEntryChange({
        custom_drain: '',
        morning_drains: entry.morning_drains.includes(text) ? entry.morning_drains : [...entry.morning_drains, text],
        afternoon_drains: entry.afternoon_drains.includes(text) ? entry.afternoon_drains : [...entry.afternoon_drains, text],
        evening_drains: entry.evening_drains.includes(text) ? entry.evening_drains : [...entry.evening_drains, text],
      });
      setWholeDrainSaved(true);
      setTimeout(() => setWholeDrainSaved(false), 2000);
    } else {
      onEntryChange({
        custom_boost: '',
        morning_boosts: entry.morning_boosts.includes(text) ? entry.morning_boosts : [...entry.morning_boosts, text],
        afternoon_boosts: entry.afternoon_boosts.includes(text) ? entry.afternoon_boosts : [...entry.afternoon_boosts, text],
        evening_boosts: entry.evening_boosts.includes(text) ? entry.evening_boosts : [...entry.evening_boosts, text],
      });
      setWholeBoostSaved(true);
      setTimeout(() => setWholeBoostSaved(false), 2000);
    }

    setPendingWholeDay(null);
  };

  const handleCancelWholeDay = () => {
    setPendingWholeDay(null);
  };

  return (
    <div className="space-y-3">
      {/* Time block sections */}
      {timeBlocks.map((block) => (
        <TimeBlock
          key={block}
          timeBlock={block}
          defaultExpanded={block === currentTimeBlock}
          {...getTimeBlockProps(block)}
        />
      ))}

      {/* Whole-day custom fields */}
      <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">
          Other notes for the day
        </h4>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Other drains not listed above..."
                value={entry.custom_drain}
                onChange={(e) => { onEntryChange({ custom_drain: e.target.value }); setWholeDrainError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (entry.custom_drain.trim()) initiateWholeDaySave(entry.custom_drain, 'drains', setWholeDrainError);
                  }
                }}
                maxLength={200}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {entry.custom_drain.trim() && (
                <button
                  type="button"
                  disabled={wholeDrainSaved}
                  onClick={() => initiateWholeDaySave(entry.custom_drain, 'drains', setWholeDrainError)}
                  className="px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors text-white"
                  style={{ background: wholeDrainSaved ? 'var(--boost-accent)' : 'var(--accent)' }}
                  title="Save as permanent category"
                >
                  {wholeDrainSaved ? '\u2713 Saved' : 'Save'}
                </button>
              )}
            </div>
            {wholeDrainError && (
              <p className="mt-1 text-xs text-error">{wholeDrainError}</p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Other boosts not listed above..."
                value={entry.custom_boost}
                onChange={(e) => { onEntryChange({ custom_boost: e.target.value }); setWholeBoostError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (entry.custom_boost.trim()) initiateWholeDaySave(entry.custom_boost, 'boosts', setWholeBoostError);
                  }
                }}
                maxLength={200}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {entry.custom_boost.trim() && (
                <button
                  type="button"
                  disabled={wholeBoostSaved}
                  onClick={() => initiateWholeDaySave(entry.custom_boost, 'boosts', setWholeBoostError)}
                  className="px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors text-white"
                  style={{ background: wholeBoostSaved ? 'var(--boost-accent)' : 'var(--accent)' }}
                  title="Save as permanent category"
                >
                  {wholeBoostSaved ? '\u2713 Saved' : 'Save'}
                </button>
              )}
            </div>
            {wholeBoostError && (
              <p className="mt-1 text-xs text-error">{wholeBoostError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Whole-day confirmation modal */}
      {pendingWholeDay && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handleCancelWholeDay();
            }
          }}
        >
          <div className="rounded-lg p-6 max-w-md w-full bg-bg-primary">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">
              Apply to Whole Day?
            </h3>

            <p className="mb-4 text-text-secondary">
              &ldquo;{pendingWholeDay.text}&rdquo; will be saved and automatically checked
              in <strong>all time blocks</strong> (morning, afternoon, and evening).
            </p>

            <p className="text-sm mb-6 text-text-tertiary">
              You can uncheck it in specific time blocks if needed.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmWholeDay}
                autoFocus
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-accent-rich hover:brightness-90"
              >
                Apply to All
              </button>
              <button
                type="button"
                onClick={handleCancelWholeDay}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-bg-tertiary text-text-primary hover:brightness-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
