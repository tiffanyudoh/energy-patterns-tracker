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

// Create 30 days of entries with significant time-of-day energy differences
// for testing time correlation analysis
function createTimeCorrelationEntries(): Record<string, DailyEntry> {
  const entries: Record<string, DailyEntry> = {};
  const today = new Date();

  // --- Pattern 1: "Email catch-up" ---
  // Morning email → low energy (avg ~3), Afternoon email → moderate (avg ~6)
  // Expected: "Avoid Email catch-up during morning (3.0 avg). Better in afternoon (6.0 avg)."
  for (let i = 0; i < 4; i++) {
    const date = format(subDays(today, 28 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 3;
    e.morning_drains = ['Email catch-up'];
    entries[date] = e;
  }
  for (let i = 0; i < 4; i++) {
    const date = format(subDays(today, 24 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 6;
    e.afternoon_drains = ['Email catch-up'];
    entries[date] = e;
  }

  // --- Pattern 2: "Exercise" (boost) ---
  // Morning exercise → high energy (avg ~8), Evening exercise → moderate (avg ~5)
  // Expected: "Exercise works best in morning (8.0 avg) vs evening (5.0 avg)."
  for (let i = 0; i < 3; i++) {
    const date = format(subDays(today, 20 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 8;
    e.morning_boosts = ['Exercise'];
    entries[date] = e;
  }
  for (let i = 0; i < 3; i++) {
    const date = format(subDays(today, 17 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 5;
    e.evening_boosts = ['Exercise'];
    entries[date] = e;
  }

  // --- Pattern 3: "Context switching" (drain) across all 3 blocks ---
  // Morning → avg 2, Afternoon → avg 5, Evening → avg 7
  // Expected: worst=morning, best=evening, diff=5
  for (let i = 0; i < 2; i++) {
    const date = format(subDays(today, 14 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 2;
    e.morning_drains = ['Context switching'];
    entries[date] = e;
  }
  for (let i = 0; i < 2; i++) {
    const date = format(subDays(today, 12 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 5;
    e.afternoon_drains = ['Context switching'];
    entries[date] = e;
  }
  for (let i = 0; i < 2; i++) {
    const date = format(subDays(today, 10 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 7;
    e.evening_drains = ['Context switching'];
    entries[date] = e;
  }

  // --- Pattern 4: "Focused work block" (boost) ---
  // Morning → avg 9, Afternoon → avg 6
  // Expected: "Focused work block works best in morning (9.0 avg) vs afternoon (6.0 avg)."
  for (let i = 0; i < 3; i++) {
    const date = format(subDays(today, 8 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 9;
    e.morning_boosts = ['Focused work block'];
    entries[date] = e;
  }
  for (let i = 0; i < 3; i++) {
    const date = format(subDays(today, 5 - i), 'yyyy-MM-dd');
    const e = createEmptyEntry(date);
    e.energy_score = 6;
    e.afternoon_boosts = ['Focused work block'];
    entries[date] = e;
  }

  // --- Noise: activities that should NOT trigger correlations ---

  // "Meeting overload" only in afternoon (single block → excluded)
  for (let i = 0; i < 3; i++) {
    const date = format(subDays(today, 2 - i), 'yyyy-MM-dd');
    const e = entries[date] || createEmptyEntry(date);
    e.afternoon_drains = [...e.afternoon_drains, 'Meeting overload'];
    e.energy_score = e.energy_score || 4;
    entries[date] = e;
  }

  return entries;
}

// Output the data as JSON that can be pasted into browser console
const testEntries = createTestEntries();
const timeCorrelationEntries = createTimeCorrelationEntries();

// Merge: time correlation entries first, then weekly entries overwrite overlaps
const allEntries = { ...timeCorrelationEntries, ...testEntries };

console.log('='.repeat(70));
console.log('TEST DATA FOR LOCALSTORAGE');
console.log('='.repeat(70));
console.log('\nCopy and paste this into your browser console:\n');
console.log(`localStorage.setItem('energy_tracker_entries', '${JSON.stringify(allEntries)}');`);
console.log('\nThen refresh the page and click "Analyze My Patterns"\n');

console.log('='.repeat(70));
console.log('EXPECTED RESULTS — WEEKLY PATTERNS');
console.log('='.repeat(70));

console.log('\nWEEKLY SUMMARY:');
const recentDates = Object.keys(allEntries).sort().slice(-7);
const recentEntries = recentDates.map(d => allEntries[d]);
const energyScores = recentEntries.map(e => e.energy_score);
const avgEnergy = energyScores.reduce((a, b) => a + b, 0) / energyScores.length;
console.log(`  Days logged (last 7): ${recentDates.length}`);
console.log(`  Average energy: ${avgEnergy.toFixed(1)}/10`);

console.log('\nDRAIN PATTERNS:');
console.log('  1. Email catch-up - Strong pattern');
console.log('  2. Coordination tasks - Weak signal');

console.log('\nBOOST PATTERNS:');
console.log('  1. Morning coffee alone - Weak signal');
console.log('  2. Reading - Weak signal');

console.log('\nCOGNITIVE LOAD:');
console.log('  Detected: Yes (coordination, scheduling, planning, admin keywords)');

console.log('\n' + '='.repeat(70));
console.log('EXPECTED RESULTS — TIME-OF-DAY CORRELATIONS (last 30 days)');
console.log('='.repeat(70));

console.log('\n  Sorted by impact (highest first):');
console.log('');
console.log('  1. Context switching (drain)');
console.log('     Morning: avg 2.0 (2x) ⚠️  |  Afternoon: avg 5.0 (2x)  |  Evening: avg 7.0 (2x) ✓');
console.log('     Impact: 5.0 points');
console.log('     → "Avoid Context switching during morning (2.0 avg). Better in evening (7.0 avg)."');
console.log('');
console.log('  2. Email catch-up (drain)');
console.log('     Morning: avg 3.0 (4x) ⚠️  |  Afternoon: avg 6.0 (4x) ✓');
console.log('     Impact: 3.0 points');
console.log('     → "Avoid Email catch-up during morning (3.0 avg). Better in afternoon (6.0 avg)."');
console.log('');
console.log('  3. Exercise (boost)');
console.log('     Morning: avg 8.0 (3x) ✓  |  Evening: avg 5.0 (3x) ⚠️');
console.log('     Impact: 3.0 points');
console.log('     → "Exercise works best in morning (8.0 avg) vs evening (5.0 avg)."');
console.log('');
console.log('  4. Focused work block (boost)');
console.log('     Morning: avg 9.0 (3x) ✓  |  Afternoon: avg 6.0 (3x) ⚠️');
console.log('     Impact: 3.0 points');
console.log('     → "Focused work block works best in morning (9.0 avg) vs afternoon (6.0 avg)."');
console.log('');
console.log('  NOT shown (correctly filtered):');
console.log('  - Meeting overload: only in afternoon (single block)');

console.log('\n' + '='.repeat(70));

// Output all entries for reference
console.log(`\nTotal entries: ${Object.keys(allEntries).length}`);
console.log('\nAll test entries:');
Object.entries(allEntries)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([date, entry]) => {
    const drains = [
      ...entry.morning_drains.map(d => `M:${d}`),
      ...entry.afternoon_drains.map(d => `A:${d}`),
      ...entry.evening_drains.map(d => `E:${d}`),
      entry.morning_custom_drain ? `M:${entry.morning_custom_drain}` : '',
      entry.afternoon_custom_drain ? `A:${entry.afternoon_custom_drain}` : '',
      entry.custom_drain ? `D:${entry.custom_drain}` : '',
    ].filter(Boolean);
    const boosts = [
      ...entry.morning_boosts.map(b => `M:${b}`),
      ...entry.afternoon_boosts.map(b => `A:${b}`),
      ...entry.evening_boosts.map(b => `E:${b}`),
    ].filter(Boolean);
    console.log(`  ${date}: Energy ${entry.energy_score}, Drains: [${drains.join(', ')}], Boosts: [${boosts.join(', ')}]`);
  });
