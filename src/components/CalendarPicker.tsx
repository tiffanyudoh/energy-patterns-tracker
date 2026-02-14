import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  isAfter,
  subDays,
} from 'date-fns';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

/**
 * Calendar Picker Component
 *
 * Allows selection of dates up to 30 days in the past.
 * Cannot select future dates.
 */
export function CalendarPicker({
  selectedDate,
  onDateSelect,
  onClose,
}: CalendarPickerProps) {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const selected = new Date(selectedDate);

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selected));

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    // Don't go back more than 30 days from today
    if (endOfMonth(prevMonth) >= thirtyDaysAgo) {
      setCurrentMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    // Don't go past current month
    if (startOfMonth(nextMonth) <= today) {
      setCurrentMonth(nextMonth);
    }
  };

  const handleDateClick = (date: Date) => {
    // Check if date is within valid range
    if (isAfter(date, today)) return; // No future dates
    if (date < thirtyDaysAgo) return; // No more than 30 days back

    onDateSelect(format(date, 'yyyy-MM-dd'));
    onClose();
  };

  const isDateDisabled = (date: Date): boolean => {
    return isAfter(date, today) || date < thirtyDaysAgo;
  };

  const canGoPrev = endOfMonth(subMonths(currentMonth, 1)) >= thirtyDaysAgo;
  const canGoNext = startOfMonth(addMonths(currentMonth, 1)) <= today;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className={`p-2 rounded-lg ${
              canGoPrev
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className={`p-2 rounded-lg ${
              canGoNext
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isSelected = isSameDay(date, selected);
            const isToday = isSameDay(date, today);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const disabled = isDateDisabled(date);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-gray-800 text-white hover:bg-gray-700' : ''}
                  ${isToday && !isSelected ? 'border border-gray-400' : ''}
                `}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onDateSelect(format(today, 'yyyy-MM-dd'));
              onClose();
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Go to Today
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
