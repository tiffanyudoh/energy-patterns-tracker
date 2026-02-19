import { useState } from 'react';
import { TimeBlock as TimeBlockType } from '@/types';
import { PREDEFINED_DRAINS, PREDEFINED_BOOSTS, TIME_BLOCK_LABELS, getDrainDisplayLabel } from '@/constants/activities';

interface TimeBlockProps {
  timeBlock: TimeBlockType;
  selectedDrains: string[];
  selectedBoosts: string[];
  customDrain: string;
  customBoost: string;
  onDrainsChange: (drains: string[]) => void;
  onBoostsChange: (boosts: string[]) => void;
  onCustomDrainChange: (value: string) => void;
  onCustomBoostChange: (value: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Collapsible Time Block Component (Spec 1.2)
 *
 * - Collapsible section for Morning/Afternoon/Evening
 * - Multi-select checkboxes for drains and boosts
 * - Custom text fields for time-specific custom entries
 */
export function TimeBlock({
  timeBlock,
  selectedDrains,
  selectedBoosts,
  customDrain,
  customBoost,
  onDrainsChange,
  onBoostsChange,
  onCustomDrainChange,
  onCustomBoostChange,
  defaultExpanded = false,
}: TimeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const label = TIME_BLOCK_LABELS[timeBlock];
  const totalSelected = selectedDrains.length + selectedBoosts.length;

  const toggleDrain = (drain: string) => {
    if (selectedDrains.includes(drain)) {
      onDrainsChange(selectedDrains.filter((d) => d !== drain));
    } else {
      onDrainsChange([...selectedDrains, drain]);
    }
  };

  const toggleBoost = (boost: string) => {
    if (selectedBoosts.includes(boost)) {
      onBoostsChange(selectedBoosts.filter((r) => r !== boost));
    } else {
      onBoostsChange([...selectedBoosts, boost]);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{label}</span>
        <div className="flex items-center gap-2">
          {totalSelected > 0 && (
            <span className="text-sm text-gray-500">
              {totalSelected} selected
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Drains section */}
          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              What drained your energy?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREDEFINED_DRAINS.map((drain) => (
                <label
                  key={drain}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDrains.includes(drain)}
                    onChange={() => toggleDrain(drain)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">{getDrainDisplayLabel(drain)}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other drains..."
              value={customDrain}
              onChange={(e) => onCustomDrainChange(e.target.value)}
              maxLength={200}
              className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          {/* Boosts section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              What boosted your energy?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREDEFINED_BOOSTS.map((boost) => (
                <label
                  key={boost}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedBoosts.includes(boost)}
                    onChange={() => toggleBoost(boost)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">{boost}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other boosts..."
              value={customBoost}
              onChange={(e) => onCustomBoostChange(e.target.value)}
              maxLength={200}
              className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
