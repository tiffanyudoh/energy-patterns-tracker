/**
 * Test script for pattern detection functions
 * Run with: npx tsx src/utils/testPatternDetection.ts
 */

import { DailyEntry, createEmptyEntry } from '../types';
import {
  detectDrainPatterns,
  detectBoostPatterns,
  detectCognitiveLoad,
} from './patternDetection';
import {
  generateAllExperiments,
  analyzeTimeBlocks,
} from './experimentGeneration';

// Create test data (7 days)
function createTestData(): DailyEntry[] {
  const entries: DailyEntry[] = [];

  // Day 1: Email catch-up (morning), energy 4
  const day1 = createEmptyEntry('2026-02-08');
  day1.energy_score = 4;
  day1.morning_drains = ['Email catch-up'];
  entries.push(day1);

  // Day 2: Email catch-up (morning, afternoon), energy 3
  const day2 = createEmptyEntry('2026-02-09');
  day2.energy_score = 3;
  day2.morning_drains = ['Email catch-up'];
  day2.afternoon_drains = ['Email catch-up'];
  entries.push(day2);

  // Day 3: Email catch-up (morning), Coordination tasks (afternoon), energy 4
  const day3 = createEmptyEntry('2026-02-10');
  day3.energy_score = 4;
  day3.morning_drains = ['Email catch-up'];
  day3.afternoon_drains = ['Coordination tasks'];
  entries.push(day3);

  // Day 4: Email catch-up (morning), scheduling call (custom - cognitive load), energy 3
  const day4 = createEmptyEntry('2026-02-11');
  day4.energy_score = 3;
  day4.morning_drains = ['Email catch-up'];
  day4.morning_custom_drain = 'scheduling doctor appointments';
  entries.push(day4);

  // Day 5: Email catch-up (morning, afternoon), Coordination tasks (morning), planning tasks (custom), energy 4
  const day5 = createEmptyEntry('2026-02-12');
  day5.energy_score = 4;
  day5.morning_drains = ['Email catch-up', 'Coordination tasks'];
  day5.afternoon_drains = ['Email catch-up'];
  day5.afternoon_custom_drain = 'planning weekly meals';
  entries.push(day5);

  // Day 6: Morning coffee alone (morning), Reading (evening), energy 7
  const day6 = createEmptyEntry('2026-02-13');
  day6.energy_score = 7;
  day6.morning_boosts = ['Morning coffee alone'];
  day6.evening_boosts = ['Reading'];
  entries.push(day6);

  // Day 7: Email catch-up (morning), Morning coffee alone (morning), admin tasks, energy 5
  const day7 = createEmptyEntry('2026-02-14');
  day7.energy_score = 5;
  day7.morning_drains = ['Email catch-up', 'Administrative tasks'];
  day7.morning_boosts = ['Morning coffee alone'];
  entries.push(day7);

  return entries;
}

// Run tests
console.log('='.repeat(60));
console.log('PATTERN DETECTION TEST');
console.log('='.repeat(60));

const testEntries = createTestData();

console.log('\nTEST DATA SUMMARY:');
console.log(`Total entries: ${testEntries.length} days`);
testEntries.forEach((entry) => {
  const allDrains = [
    ...entry.morning_drains,
    ...entry.afternoon_drains,
    ...entry.evening_drains,
    entry.morning_custom_drain,
    entry.afternoon_custom_drain,
    entry.evening_custom_drain,
    entry.custom_drain,
  ].filter(Boolean);
  const allBoosts = [
    ...entry.morning_boosts,
    ...entry.afternoon_boosts,
    ...entry.evening_boosts,
  ].filter(Boolean);
  console.log(`  ${entry.date}: Energy ${entry.energy_score}, Drains: [${allDrains.join(', ')}], Boosts: [${allBoosts.join(', ')}]`);
});

// Test drain detection
console.log('\n' + '='.repeat(60));
console.log('DRAIN PATTERNS (Top 2)');
console.log('='.repeat(60));

const drainPatterns = detectDrainPatterns(testEntries);
if (drainPatterns.length === 0) {
  console.log('No drain patterns detected (need frequency >= 2)');
} else {
  drainPatterns.forEach((pattern, i) => {
    console.log(`\n${i + 1}. ${pattern.activity}`);
    console.log(`   Frequency: ${pattern.frequency}`);
    console.log(`   Avg Energy: ${pattern.avg_energy}`);
    console.log(`   Energy Range: ${pattern.energy_range.min} - ${pattern.energy_range.max}`);
    console.log(`   Confidence: ${pattern.confidence}`);
  });
}

// Test boost detection
console.log('\n' + '='.repeat(60));
console.log('BOOST PATTERNS (Top 2)');
console.log('='.repeat(60));

const boostPatterns = detectBoostPatterns(testEntries);
if (boostPatterns.length === 0) {
  console.log('No boost patterns detected (need frequency >= 2)');
} else {
  boostPatterns.forEach((pattern, i) => {
    console.log(`\n${i + 1}. ${pattern.activity}`);
    console.log(`   Frequency: ${pattern.frequency}`);
    console.log(`   Avg Energy: ${pattern.avg_energy}`);
    console.log(`   Energy Range: ${pattern.energy_range.min} - ${pattern.energy_range.max}`);
    console.log(`   Confidence: ${pattern.confidence}`);
  });
}

// Test cognitive load detection
console.log('\n' + '='.repeat(60));
console.log('COGNITIVE LOAD DETECTION');
console.log('='.repeat(60));

const cognitiveLoad = detectCognitiveLoad(testEntries);
if (!cognitiveLoad) {
  console.log('\nNo cognitive load pattern detected');
  console.log('(Requires >= 3 keyword matches AND avg energy <= 5)');
} else {
  console.log(`\nDetected: ${cognitiveLoad.detected}`);
  console.log(`Category: ${cognitiveLoad.category}`);
  console.log(`Frequency: ${cognitiveLoad.frequency}`);
  console.log(`Avg Energy: ${cognitiveLoad.avg_energy}`);
  console.log(`Confidence: ${cognitiveLoad.confidence}`);
  console.log(`Specific Activities: ${cognitiveLoad.specific_activities.join(', ')}`);
}

// ============================================================================
// Test Experiment Generation (Task 2.5)
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('EXPERIMENT GENERATION');
console.log('='.repeat(60));

// Analyze time blocks for top drain
if (drainPatterns.length > 0) {
  console.log('\nTime Block Analysis for "' + drainPatterns[0].activity + '":');
  const timeAnalysis = analyzeTimeBlocks(drainPatterns[0].activity, testEntries);
  console.log(`   Morning: ${timeAnalysis.morning}`);
  console.log(`   Afternoon: ${timeAnalysis.afternoon}`);
  console.log(`   Evening: ${timeAnalysis.evening}`);
  console.log(`   Most common: ${timeAnalysis.mostCommon}`);
  console.log(`   Scattered: ${timeAnalysis.isScattered}`);
}

// Generate all experiments
const experiments = generateAllExperiments(
  drainPatterns,
  boostPatterns,
  cognitiveLoad,
  testEntries
);

console.log('\nDRAIN EXPERIMENTS:');
if (experiments.drains.length === 0) {
  console.log('   No drain experiments generated');
} else {
  experiments.drains.forEach((exp, i) => {
    console.log(`\n${i + 1}. ${exp.activity} — ${exp.confidence}`);
    console.log(`   Strategy: ${exp.strategy}`);
    console.log(`   Experiment: "${exp.experiment}"`);
  });
}

console.log('\nBOOST EXPERIMENTS:');
if (experiments.boosts.length === 0) {
  console.log('   No boost experiments generated');
} else {
  experiments.boosts.forEach((exp, i) => {
    console.log(`\n${i + 1}. ${exp.activity} — ${exp.confidence}`);
    console.log(`   Strategy: ${exp.strategy}`);
    console.log(`   Experiment: "${exp.experiment}"`);
  });
}

console.log('\nCOGNITIVE LOAD EXPERIMENT:');
if (!experiments.cognitiveLoad) {
  console.log('   No cognitive load experiment generated');
} else {
  const exp = experiments.cognitiveLoad;
  console.log(`\n${exp.activity} — ${exp.confidence}`);
  console.log(`   Strategy: ${exp.strategy}`);
  console.log(`   Experiment: "${exp.experiment}"`);
}

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
