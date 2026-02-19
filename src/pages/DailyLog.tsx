import { useState, useCallback, useEffect } from 'react';
import { FocusBanner } from '@/components/FocusBanner';
import { DailyEntryForm } from '@/components/DailyEntryForm';
import { DailyEntryCard } from '@/components/DailyEntryCard';
import { CalendarPicker } from '@/components/CalendarPicker';
import { WeekStrip } from '@/components/WeekStrip';
import { useDailyEntry } from '@/hooks/useDailyEntry';
import { useAppContext } from '@/context/AppContext';
import {
  getTodayDate,
  formatDisplayDate,
  getPreviousDay,
  getNextDay,
  isDateToday,
  isDateFuture,
} from '@/utils/dateUtils';

interface DailyLogProps {
  onAnalyze?: () => void;
}

/**
 * Daily Log Page (Spec 1.4)
 *
 * Main dashboard layout:
 * - Focus banner placeholder (auto-height)
 * - Date display with navigation
 * - Battery component
 * - Time-blocked activity selection
 * - Dual save buttons
 * - Read-only vs edit mode switching
 */
export function DailyLog({ onAnalyze }: DailyLogProps) {
  const { state } = useAppContext();
  const [currentDate, setCurrentDate] = useState(getTodayDate());
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const {
    entry,
    hasExistingEntry,
    updateEntry,
    saveEntry,
    resetEntry,
    loadEntry,
  } = useDailyEntry(currentDate);

  // Load entry when date changes
  useEffect(() => {
    loadEntry(currentDate);
    // Auto-show edit mode for new entries, read-only for existing
    setIsEditMode(!hasExistingEntry);
  }, [currentDate, loadEntry, hasExistingEntry]);

  // Recalculate after loadEntry updates hasExistingEntry
  useEffect(() => {
    setIsEditMode(!hasExistingEntry);
  }, [hasExistingEntry]);

  const handlePreviousDay = useCallback(() => {
    setCurrentDate(getPreviousDay(currentDate));
  }, [currentDate]);

  const handleNextDay = useCallback(() => {
    const nextDay = getNextDay(currentDate);
    // Don't allow navigating to future dates
    if (!isDateFuture(nextDay)) {
      setCurrentDate(nextDay);
    }
  }, [currentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(getTodayDate());
  }, []);

  const handleSave = async () => {
    const result = await saveEntry();
    if (result.success) {
      // Switch to read-only mode after successful save
      setTimeout(() => setIsEditMode(false), 2000);
    }
    return result;
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    resetEntry();
    setIsEditMode(false);
  };

  const isTodaySelected = isDateToday(currentDate);
  const canGoNext = !isDateFuture(getNextDay(currentDate));

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Focus banner placeholder */}
        <FocusBanner />

        {/* Date header with navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {/* Previous day button */}
            <button
              type="button"
              onClick={handlePreviousDay}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg"
              aria-label="Previous day"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Current date - clickable to open calendar */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="text-lg font-semibold text-text-primary hover:text-accent flex items-center gap-1 mx-auto"
              >
                {formatDisplayDate(currentDate)}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {!isTodaySelected && (
                <button
                  type="button"
                  onClick={handleToday}
                  className="text-sm text-accent hover:text-text-primary underline"
                >
                  Go to today
                </button>
              )}
            </div>

            {/* Next day button */}
            <button
              type="button"
              onClick={handleNextDay}
              disabled={!canGoNext}
              className={`
                p-2 rounded-lg
                ${canGoNext
                  ? 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  : 'text-text-tertiary cursor-not-allowed'}
              `}
              aria-label="Next day"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Week strip with entry indicators */}
        <WeekStrip
          selectedDate={currentDate}
          onSelectDate={setCurrentDate}
          entries={state.entries}
        />

        {/* Main content - Edit mode or Read-only */}
        {isEditMode ? (
          <DailyEntryForm
            entry={entry}
            hasExistingEntry={hasExistingEntry}
            onEntryChange={updateEntry}
            onSave={handleSave}
            onCancel={hasExistingEntry ? handleCancel : undefined}
          />
        ) : (
          <DailyEntryCard entry={entry} onEdit={handleEdit} />
        )}

        {/* Analyze button */}
        <div className="mt-8 pt-6 border-t border-accent-light">
          <button
            type="button"
            className="w-full py-3 px-4 bg-accent-rich text-white rounded-lg hover:brightness-90"
            onClick={onAnalyze}
          >
            Analyze My Patterns
          </button>
        </div>
      </div>

      {/* Calendar Picker Modal */}
      {showCalendar && (
        <CalendarPicker
          selectedDate={currentDate}
          onDateSelect={setCurrentDate}
          onClose={() => setShowCalendar(false)}
          entries={state.entries}
        />
      )}
    </div>
  );
}
