import { parseISO, format } from 'date-fns';
import { getLastNDays, isDateToday } from '@/utils/dateUtils';
import { DailyEntry } from '@/types';

interface WeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  entries: Record<string, DailyEntry>;
}

export function WeekStrip({ selectedDate, onSelectDate, entries }: WeekStripProps) {
  // Last 7 days, reversed so oldest is first (left-to-right chronological)
  const days = getLastNDays(7).reverse();

  return (
    <div className="flex justify-between gap-1 mb-6" role="navigation" aria-label="Week overview">
      {days.map((date) => {
        const parsed = parseISO(date);
        const dayAbbr = format(parsed, 'EEE');
        const dayNum = format(parsed, 'd');
        const isSelected = date === selectedDate;
        const isToday = isDateToday(date);
        const hasEntry = date in entries;

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDate(date)}
            className={`
              flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-colors relative
              ${isSelected
                ? 'bg-accent-rich text-white'
                : isToday
                  ? 'bg-bg-secondary ring-1 ring-accent'
                  : hasEntry
                    ? 'bg-bg-secondary text-text-primary'
                    : 'text-text-tertiary'
              }
              ${!isSelected ? 'hover:bg-bg-tertiary' : ''}
            `}
            aria-label={`${format(parsed, 'EEEE, MMMM d')}${hasEntry ? ', has entry' : ', no entry'}${isSelected ? ', selected' : ''}`}
            aria-current={isSelected ? 'date' : undefined}
          >
            <span className="text-xs">{dayAbbr}</span>
            <span className={`text-sm ${hasEntry && !isSelected ? 'font-semibold' : ''}`}>
              {dayNum}
            </span>
            {hasEntry && (
              <span
                className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-accent-rich'}`}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
