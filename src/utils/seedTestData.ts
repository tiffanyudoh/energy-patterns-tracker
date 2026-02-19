/**
 * Seed test data into localStorage for testing the complete flow
 * Run with: npx tsx src/utils/seedTestData.ts
 *
 * This creates 7 days of test entries that will trigger:
 * - Top drain: Email catch-up (Strong pattern)
 * - 2nd drain: Coordination tasks (Weak signal)
 * - Top boost: Morning coffee alone (Weak signal)
 * - Cognitive load: Detected (coordination keywords)
 */

import { DailyEntry, createEmptyEntry } from '../types';
import { format, subDays } from 'date-fns';

// Create test entries for the last 7 days
function createTestEntries(): Record<string, DailyEntry> {
  const entries: Record<string, DailyEntry> = {};
  const today = new Date();

  // Day 1 (6 days ago): Email catch-up morning, energy 4
  const day1Date = format(subDays(today, 6), 'yyyy-MM-dd');
  const day1 = createEmptyEntry(day1Date);
  day1.energy_score = 4;
  day1.morning_drains = ['Email catch-up', 'Coordination tasks'];
  entries[day1Date] = day1;

  // Day 2 (5 days ago): Email catch-up morning + afternoon, energy 3
  const day2Date = format(subDays(today, 5), 'yyyy-MM-dd');
  const day2 = createEmptyEntry(day2Date);
  day2.energy_score = 3;
  day2.morning_drains = ['Email catch-up'];
  day2.afternoon_drains = ['Email catch-up'];
  day2.afternoon_custom_drain = 'scheduling doctor appointments';
  entries[day2Date] = day2;

  // Day 3 (4 days ago): Email, Coordination, energy 4
  const day3Date = format(subDays(today, 4), 'yyyy-MM-dd');
  const day3 = createEmptyEntry(day3Date);
  day3.energy_score = 4;
  day3.morning_drains = ['Email catch-up'];
  day3.afternoon_drains = ['Coordination tasks'];
  day3.morning_custom_drain = 'planning weekly meals';
  entries[day3Date] = day3;

  // Day 4 (3 days ago): Email, admin tasks, energy 3
  const day4Date = format(subDays(today, 3), 'yyyy-MM-dd');
  const day4 = createEmptyEntry(day4Date);
  day4.energy_score = 3;
  day4.morning_drains = ['Email catch-up', 'Administrative tasks'];
  entries[day4Date] = day4;

  // Day 5 (2 days ago): Email morning + afternoon, energy 4
  const day5Date = format(subDays(today, 2), 'yyyy-MM-dd');
  const day5 = createEmptyEntry(day5Date);
  day5.energy_score = 4;
  day5.morning_drains = ['Email catch-up'];
  day5.afternoon_drains = ['Email catch-up'];
  day5.evening_boosts = ['Reading'];
  entries[day5Date] = day5;

  // Day 6 (1 day ago): Morning coffee, Reading, energy 7
  const day6Date = format(subDays(today, 1), 'yyyy-MM-dd');
  const day6 = createEmptyEntry(day6Date);
  day6.energy_score = 7;
  day6.morning_boosts = ['Morning coffee alone'];
  day6.evening_boosts = ['Reading'];
  entries[day6Date] = day6;

  // Day 7 (today): Email, Morning coffee, energy 5
  const day7Date = format(today, 'yyyy-MM-dd');
  const day7 = createEmptyEntry(day7Date);
  day7.energy_score = 5;
  day7.morning_drains = ['Email catch-up'];
  day7.morning_boosts = ['Morning coffee alone'];
  entries[day7Date] = day7;

  return entries;
}

// Output the data as JSON that can be pasted into browser console
const testEntries = createTestEntries();

console.log('='.repeat(70));
console.log('TEST DATA FOR LOCALSTORAGE');
console.log('='.repeat(70));
console.log('\nCopy and paste this into your browser console:\n');
console.log(`localStorage.setItem('energy_tracker_entries', '${JSON.stringify(testEntries)}');`);
console.log('\nThen refresh the page and click "Analyze My Patterns"\n');

console.log('='.repeat(70));
console.log('EXPECTED RESULTS');
console.log('='.repeat(70));

console.log('\nWEEKLY SUMMARY:');
const energyScores = Object.values(testEntries).map(e => e.energy_score);
const avgEnergy = energyScores.reduce((a, b) => a + b, 0) / energyScores.length;
console.log(`  Days logged: ${Object.keys(testEntries).length}`);
console.log(`  Average energy: ${avgEnergy.toFixed(1)}/10`);
console.log(`  Trend: (no previous week data)`);

console.log('\nDRAIN PATTERNS:');
console.log('  1. Email catch-up - frequency: 8, Strong pattern');
console.log('  2. Coordination tasks - frequency: 2, Weak signal');

console.log('\nBOOST PATTERNS:');
console.log('  1. Morning coffee alone - frequency: 2, Weak signal');
console.log('  2. Reading - frequency: 2, Weak signal');

console.log('\nCOGNITIVE LOAD:');
console.log('  Detected: Yes (coordination, scheduling, planning, admin keywords)');

console.log('\n' + '='.repeat(70));

// Also output the entries for reference
console.log('\nTest entries created:');
Object.entries(testEntries).forEach(([date, entry]) => {
  const drains = [
    ...entry.morning_drains,
    ...entry.afternoon_drains,
    ...entry.evening_drains,
    entry.morning_custom_drain,
    entry.afternoon_custom_drain,
    entry.custom_drain,
  ].filter(Boolean);
  const boosts = [
    ...entry.morning_boosts,
    ...entry.afternoon_boosts,
    ...entry.evening_boosts,
  ].filter(Boolean);
  console.log(`  ${date}: Energy ${entry.energy_score}, Drains: [${drains.join(', ')}], Boosts: [${boosts.join(', ')}]`);
});
