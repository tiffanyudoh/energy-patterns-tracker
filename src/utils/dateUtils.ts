import { format, parseISO, addDays, subDays, isToday } from 'date-fns';
import { TimeBlock } from '@/types';

/**
 * Date utilities for the Energy Patterns Tracker
 *
 * Storage format: YYYY-MM-DD (ISO)
 * Display format: "Monday, February 13" (readable)
 */

// Get current time block based on system time
// Morning: 12am - 11:59am (0-11)
// Afternoon: 12pm - 4:59pm (12-16)
// Evening: 5pm - 11:59pm (17-23)
export function getCurrentTimeBlock(): TimeBlock {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'morning';
  } else if (hour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

// Get today's date in storage format
export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Format date for display (spec: "Monday, February 13")
export function formatDisplayDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'EEEE, MMMM d');
}

// Format date for short display (e.g., "Feb 13")
export function formatShortDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d');
}

// Get previous day
export function getPreviousDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(subDays(date, 1), 'yyyy-MM-dd');
}

// Get next day
export function getNextDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(addDays(date, 1), 'yyyy-MM-dd');
}

// Check if date is today
export function isDateToday(dateString: string): boolean {
  const date = parseISO(dateString);
  return isToday(date);
}

// Check if date is in the future
export function isDateFuture(dateString: string): boolean {
  const date = parseISO(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

// Get dates for last N days (for weekly/monthly analysis)
export function getLastNDays(n: number, fromDate?: string): string[] {
  const startDate = fromDate ? parseISO(fromDate) : new Date();
  const dates: string[] = [];

  for (let i = 0; i < n; i++) {
    dates.push(format(subDays(startDate, i), 'yyyy-MM-dd'));
  }

  return dates;
}
