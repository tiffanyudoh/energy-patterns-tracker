import { useState } from 'react';
import { TimeBlock as TimeBlockType, CustomCategories } from '@/types';
import { PREDEFINED_DRAINS, PREDEFINED_BOOSTS, TIME_BLOCK_LABELS, getDrainDisplayLabel } from '@/constants/activities';
import { useAppContext } from '@/context/AppContext';

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
 * - Multi-select checkboxes for drains and boosts (predefined + custom categories)
 * - Custom text fields with "Save as category" button
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
  const { customCategories, setCustomCategories } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [drainSaved, setDrainSaved] = useState(false);
  const [boostSaved, setBoostSaved] = useState(false);
  const [drainError, setDrainError] = useState('');
  const [boostError, setBoostError] = useState('');


  const label = TIME_BLOCK_LABELS[timeBlock];

  const drainsKey = `${timeBlock}_drains` as keyof CustomCategories;
  const boostsKey = `${timeBlock}_boosts` as keyof CustomCategories;
  const customDrainsList = customCategories[drainsKey] || [];
  const customBoostsList = customCategories[boostsKey] || [];

  // Merge time-block-specific + whole-day custom categories (deduplicated)
  const wholeDayDrains = (customCategories.whole_day_drains || []).filter(
    (d) => !customDrainsList.some((c) => c.toLowerCase() === d.toLowerCase()),
  );
  const wholeDayBoosts = (customCategories.whole_day_boosts || []).filter(
    (b) => !customBoostsList.some((c) => c.toLowerCase() === b.toLowerCase()),
  );
  const allCustomDrains = [...customDrainsList, ...wholeDayDrains];
  const allCustomBoosts = [...customBoostsList, ...wholeDayBoosts];

  const allDrains: string[] = [...PREDEFINED_DRAINS, ...allCustomDrains];
  const allBoosts: string[] = [...PREDEFINED_BOOSTS, ...allCustomBoosts];
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

  const handleSaveCategory = (
    value: string,
    key: keyof CustomCategories,
    existingList: string[],
    setSaved: (v: boolean) => void,
    clearField: () => void,
    setError: (v: string) => void,
  ) => {
    const text = value.trim();
    if (!text) return;
    if (text.length > 50) {
      setError('Too long (max 50 characters)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check duplicates across predefined + custom (case-insensitive)
    const allExisting = [...PREDEFINED_DRAINS, ...PREDEFINED_BOOSTS, ...existingList];
    if (allExisting.some((cat) => cat.toLowerCase() === text.toLowerCase())) {
      setError('Already saved as a category');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCustomCategories({
      ...customCategories,
      [key]: [...customCategories[key], text],
    });

    setError('');
    clearField();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              {allDrains.map((drain) => {
                const isCustom = allCustomDrains.includes(drain);
                return (
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
                    <span className={`text-sm text-gray-700 ${isCustom ? 'italic' : ''}`}>
                      {isCustom ? drain : getDrainDisplayLabel(drain)}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Other drains..."
                value={customDrain}
                onChange={(e) => { onCustomDrainChange(e.target.value); setDrainError(''); }}
                maxLength={200}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {customDrain.trim() && (
                <button
                  type="button"
                  disabled={drainSaved}
                  onClick={() => handleSaveCategory(customDrain, drainsKey, customDrainsList, setDrainSaved, () => onCustomDrainChange(''), setDrainError)}
                  className="px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors text-white"
                  style={{ background: drainSaved ? 'var(--boost-accent)' : 'var(--accent)' }}
                  title="Save as permanent category"
                >
                  {drainSaved ? '\u2713 Saved' : 'Save'}
                </button>
              )}
            </div>
            {drainError && (
              <p className="mt-1 text-xs text-error">{drainError}</p>
            )}
          </div>

          {/* Boosts section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              What boosted your energy?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allBoosts.map((boost) => {
                const isCustom = allCustomBoosts.includes(boost);
                return (
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
                    <span className={`text-sm text-gray-700 ${isCustom ? 'italic' : ''}`}>
                      {boost}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Other boosts..."
                value={customBoost}
                onChange={(e) => { onCustomBoostChange(e.target.value); setBoostError(''); }}
                maxLength={200}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {customBoost.trim() && (
                <button
                  type="button"
                  disabled={boostSaved}
                  onClick={() => handleSaveCategory(customBoost, boostsKey, customBoostsList, setBoostSaved, () => onCustomBoostChange(''), setBoostError)}
                  className="px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors text-white"
                  style={{ background: boostSaved ? 'var(--boost-accent)' : 'var(--accent)' }}
                  title="Save as permanent category"
                >
                  {boostSaved ? '\u2713 Saved' : 'Save'}
                </button>
              )}
            </div>
            {boostError && (
              <p className="mt-1 text-xs text-error">{boostError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
