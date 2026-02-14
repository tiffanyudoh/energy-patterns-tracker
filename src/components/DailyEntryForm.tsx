import { useState } from 'react';
import { DailyEntry } from '@/types';
import { Battery } from './Battery';
import { TimeBlockSection } from './TimeBlockSection';
import { formatDisplayDate } from '@/utils/dateUtils';

interface DailyEntryFormProps {
  entry: DailyEntry;
  hasExistingEntry: boolean;
  onEntryChange: (updates: Partial<DailyEntry>) => void;
  onSave: () => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
}

/**
 * Daily Entry Form Component (Spec 1.3)
 *
 * Edit mode form with:
 * - Battery component (interactive)
 * - Time block sections with checkboxes
 * - Dual save buttons (top and bottom)
 * - Save confirmation feedback
 */
export function DailyEntryForm({
  entry,
  hasExistingEntry,
  onEntryChange,
  onSave,
  onCancel,
}: DailyEntryFormProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMessage('');

    const result = await onSave();

    if (result.success) {
      setSaveStatus('saved');
      // Reset to idle after brief confirmation
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Unable to save entry. Please try again.');
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Entry saved ✓';
      case 'error':
        return 'Try Again';
      default:
        return hasExistingEntry ? 'Update Entry' : 'Save Entry';
    }
  };

  const SaveButton = () => (
    <button
      type="button"
      onClick={handleSave}
      disabled={saveStatus === 'saving'}
      className={`
        w-full py-3 px-4 rounded-lg font-medium transition-colors
        ${saveStatus === 'saved'
          ? 'bg-green-100 text-green-800 cursor-default'
          : saveStatus === 'error'
          ? 'bg-red-100 text-red-800 hover:bg-red-200'
          : 'bg-gray-800 text-white hover:bg-gray-700'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {getSaveButtonText()}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Save confirmation message */}
      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-800">
          Entry saved for {formatDisplayDate(entry.date)}
        </div>
      )}

      {/* Error message */}
      {saveStatus === 'error' && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Battery component */}
      <div className="flex flex-col items-center py-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          How's your energy today?
        </h3>
        <Battery
          value={entry.energy_score}
          onChange={(score) => onEntryChange({ energy_score: score })}
          interactive={true}
        />
      </div>

      {/* Top save button */}
      <SaveButton />

      {/* Time block sections */}
      <TimeBlockSection entry={entry} onEntryChange={onEntryChange} />

      {/* Bottom save button */}
      <div className="space-y-3">
        <SaveButton />

        {/* Cancel button (only when editing existing entry) */}
        {hasExistingEntry && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
