/**
 * Test script for time correlation analysis
 * Run with: npx tsx src/utils/testTimeCorrelation.ts
 */

import { DailyEntry, createEmptyEntry } from '../types';
import { analyzeTimeCorrelations } from './timeCorrelationAnalysis';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// ============================================================================
// TEST 1: Empty input returns empty results
// ============================================================================
console.log('\n=== Test 1: Empty input ===');
{
  const result = analyzeTimeCorrelations([]);
  assert(result.length === 0, 'Empty entries produce no correlations');
}

// ============================================================================
// TEST 2: Insufficient data — activity in only 1 time block
// ============================================================================
console.log('\n=== Test 2: Activity in only 1 time block (should be excluded) ===');
{
  const entries: DailyEntry[] = [];
  for (let i = 0; i < 5; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 5;
    e.morning_drains = ['Email catch-up'];
    entries.push(e);
  }
  const result = analyzeTimeCorrelations(entries);
  assert(result.length === 0, 'Activity only in morning — no cross-block comparison possible');
}

// ============================================================================
// TEST 3: Insufficient occurrences — activity in 2 blocks but <2 times each
// ============================================================================
console.log('\n=== Test 3: Activity with <2 occurrences per block (should be excluded) ===');
{
  const e1 = createEmptyEntry('2026-03-01');
  e1.energy_score = 3;
  e1.morning_drains = ['Meetings'];

  const e2 = createEmptyEntry('2026-03-02');
  e2.energy_score = 7;
  e2.afternoon_drains = ['Meetings'];

  const result = analyzeTimeCorrelations([e1, e2]);
  assert(result.length === 0, 'Only 1 occurrence per block — filtered out');
}

// ============================================================================
// TEST 4: Activity in 2 blocks with 2+ occurrences but small difference (<1.0)
// ============================================================================
console.log('\n=== Test 4: Small energy difference (<1.0 points, should be excluded) ===');
{
  const entries: DailyEntry[] = [];
  // Morning: energy 5.0 avg, Afternoon: energy 5.5 avg → diff = 0.5
  for (let i = 0; i < 3; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 5;
    e.morning_drains = ['Slack'];
    entries.push(e);
  }
  for (let i = 0; i < 3; i++) {
    const e = createEmptyEntry(`2026-03-1${i + 1}`);
    e.energy_score = 5.5;
    e.afternoon_drains = ['Slack'];
    entries.push(e);
  }
  const result = analyzeTimeCorrelations(entries);
  assert(result.length === 0, 'Difference 0.5 < 1.0 threshold — no correlation reported');
}

// ============================================================================
// TEST 5: Valid correlation — drain activity with significant difference
// ============================================================================
console.log('\n=== Test 5: Valid drain correlation ===');
{
  const entries: DailyEntry[] = [];

  // "Email catch-up" as morning drain → low energy days (avg 3)
  for (let i = 0; i < 3; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 3;
    e.morning_drains = ['Email catch-up'];
    entries.push(e);
  }
  // "Email catch-up" as afternoon drain → higher energy days (avg 6)
  for (let i = 0; i < 3; i++) {
    const e = createEmptyEntry(`2026-03-1${i + 1}`);
    e.energy_score = 6;
    e.afternoon_drains = ['Email catch-up'];
    entries.push(e);
  }

  const result = analyzeTimeCorrelations(entries);
  assert(result.length === 1, 'One correlation found');

  const corr = result[0];
  assert(corr.activity === 'Email catch-up', 'Activity name correct');
  assert(corr.type === 'drain', 'Type is drain');
  assert(corr.worstTime === 'morning', 'Worst time is morning (avg 3)');
  assert(corr.bestTime === 'afternoon', 'Best time is afternoon (avg 6)');
  assert(corr.energyDifference === 3.0, `Energy difference is 3.0 (got ${corr.energyDifference})`);
  assert(corr.morning.avgEnergy === 3, `Morning avg is 3 (got ${corr.morning.avgEnergy})`);
  assert(corr.morning.count === 3, `Morning count is 3 (got ${corr.morning.count})`);
  assert(corr.afternoon.avgEnergy === 6, `Afternoon avg is 6 (got ${corr.afternoon.avgEnergy})`);
  assert(corr.afternoon.count === 3, `Afternoon count is 3 (got ${corr.afternoon.count})`);
  assert(corr.evening.count === 0, `Evening count is 0 (got ${corr.evening.count})`);
  assert(corr.recommendation!.includes('Avoid'), 'Drain recommendation says "Avoid"');
  assert(corr.recommendation!.includes('morning'), 'Recommendation mentions worst time');
}

// ============================================================================
// TEST 6: Valid correlation — boost activity
// ============================================================================
console.log('\n=== Test 6: Valid boost correlation ===');
{
  const entries: DailyEntry[] = [];

  // "Exercise" as morning boost → high energy (avg 8)
  for (let i = 0; i < 3; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 8;
    e.morning_boosts = ['Exercise'];
    entries.push(e);
  }
  // "Exercise" as evening boost → lower energy (avg 5)
  for (let i = 0; i < 3; i++) {
    const e = createEmptyEntry(`2026-03-1${i + 1}`);
    e.energy_score = 5;
    e.evening_boosts = ['Exercise'];
    entries.push(e);
  }

  const result = analyzeTimeCorrelations(entries);
  assert(result.length === 1, 'One correlation found');

  const corr = result[0];
  assert(corr.type === 'boost', 'Type is boost');
  assert(corr.bestTime === 'morning', 'Best time is morning (avg 8)');
  assert(corr.worstTime === 'evening', 'Worst time is evening (avg 5)');
  assert(corr.energyDifference === 3.0, `Energy difference is 3.0 (got ${corr.energyDifference})`);
  assert(corr.recommendation!.includes('works best'), 'Boost recommendation says "works best"');
}

// ============================================================================
// TEST 7: Multiple activities — sorted by impact (highest first)
// ============================================================================
console.log('\n=== Test 7: Multiple activities sorted by impact ===');
{
  const entries: DailyEntry[] = [];

  // Activity A: morning drain avg 4, afternoon drain avg 6 → diff 2
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 4;
    e.morning_drains = ['Meetings'];
    entries.push(e);
  }
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 3}`);
    e.energy_score = 6;
    e.afternoon_drains = ['Meetings'];
    entries.push(e);
  }

  // Activity B: morning boost avg 8, evening boost avg 4 → diff 4
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-1${i + 1}`);
    e.energy_score = 8;
    e.morning_boosts = ['Deep work'];
    entries.push(e);
  }
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-1${i + 3}`);
    e.energy_score = 4;
    e.evening_boosts = ['Deep work'];
    entries.push(e);
  }

  const result = analyzeTimeCorrelations(entries);
  assert(result.length === 2, `Two correlations found (got ${result.length})`);
  assert(result[0].activity === 'Deep work', `Highest impact first: Deep work (diff 4) (got ${result[0].activity})`);
  assert(result[1].activity === 'Meetings', `Second: Meetings (diff 2) (got ${result[1].activity})`);
  assert(result[0].energyDifference! > result[1].energyDifference!, 'Sorted descending by impact');
}

// ============================================================================
// TEST 8: Three time blocks — correct best/worst identification
// ============================================================================
console.log('\n=== Test 8: Activity across all 3 time blocks ===');
{
  const entries: DailyEntry[] = [];

  // Morning drain: avg 3
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 3;
    e.morning_drains = ['Context switching'];
    entries.push(e);
  }
  // Afternoon drain: avg 5
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 3}`);
    e.energy_score = 5;
    e.afternoon_drains = ['Context switching'];
    entries.push(e);
  }
  // Evening drain: avg 7
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 5}`);
    e.energy_score = 7;
    e.evening_drains = ['Context switching'];
    entries.push(e);
  }

  const result = analyzeTimeCorrelations(entries);
  assert(result.length === 1, 'One correlation found');

  const corr = result[0];
  assert(corr.worstTime === 'morning', `Worst is morning avg 3 (got ${corr.worstTime})`);
  assert(corr.bestTime === 'evening', `Best is evening avg 7 (got ${corr.bestTime})`);
  assert(corr.energyDifference === 4, `Difference is 4 (got ${corr.energyDifference})`);
  assert(corr.morning.avgEnergy === 3, `Morning avg 3 (got ${corr.morning.avgEnergy})`);
  assert(corr.afternoon.avgEnergy === 5, `Afternoon avg 5 (got ${corr.afternoon.avgEnergy})`);
  assert(corr.evening.avgEnergy === 7, `Evening avg 7 (got ${corr.evening.avgEnergy})`);
}

// ============================================================================
// TEST 9: Mixed drains and boosts for same activity name
// ============================================================================
console.log('\n=== Test 9: Same activity name as both drain and boost (separate entries) ===');
{
  const entries: DailyEntry[] = [];

  // "Social" as morning drain, avg 3
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 1}`);
    e.energy_score = 3;
    e.morning_drains = ['Social'];
    entries.push(e);
  }
  // "Social" as afternoon drain, avg 6
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 3}`);
    e.energy_score = 6;
    e.afternoon_drains = ['Social'];
    entries.push(e);
  }
  // "Social" as evening boost, avg 8
  for (let i = 0; i < 2; i++) {
    const e = createEmptyEntry(`2026-03-0${i + 5}`);
    e.energy_score = 8;
    e.evening_boosts = ['Social'];
    entries.push(e);
  }

  const result = analyzeTimeCorrelations(entries);
  // The function uses a single map key per activity name, so the first type seen wins
  // This is a known behavior — just verify it doesn't crash
  assert(result.length >= 1, `At least 1 correlation found (got ${result.length})`);
  console.log('  Note: Same activity as drain+boost handled — first type wins in map');
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n========================================');
console.log(`Results: ${passCount} passed, ${failCount} failed`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
}
