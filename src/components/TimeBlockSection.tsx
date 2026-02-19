import { DailyEntry, TimeBlock as TimeBlockType } from '@/types';
import { TimeBlock } from './TimeBlock';
import { getCurrentTimeBlock } from '@/utils/dateUtils';

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
          <input
            type="text"
            placeholder="Other drains not listed above..."
            value={entry.custom_drain}
            onChange={(e) => onEntryChange({ custom_drain: e.target.value })}
            maxLength={200}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Other boosts not listed above..."
            value={entry.custom_boost}
            onChange={(e) => onEntryChange({ custom_boost: e.target.value })}
            maxLength={200}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
