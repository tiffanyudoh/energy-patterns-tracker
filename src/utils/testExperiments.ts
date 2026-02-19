/**
 * Focused test for experiment generation with specific patterns
 * Run with: npx tsx src/utils/testExperiments.ts
 */

import { DailyEntry, createEmptyEntry } from '../types';
import { PatternInfo, CognitiveLoadResult } from './patternDetection';
import {
  generateDrainExperimentSuggestion,
  generateBoostExperimentSuggestion,
  generateCognitiveLoadExperimentSuggestion,
  analyzeTimeBlocks,
} from './experimentGeneration';

// Create test entries that match the specified patterns
function createTestEntries(): DailyEntry[] {
  const entries: DailyEntry[] = [];

  // Days 1-6: Email catch-up mostly in morning (8 total occurrences)
  // Energy scores averaging ~3.6
  for (let i = 1; i <= 6; i++) {
    const entry = createEmptyEntry(`2026-02-0${i + 7}`);
    entry.energy_score = i % 2 === 0 ? 3 : 4; // alternating 3 and 4
    entry.morning_drains = ['Email catch-up'];
    if (i === 3 || i === 5) {
      entry.afternoon_drains = ['Email catch-up']; // 2 extra in afternoon
    }
    entries.push(entry);
  }

  // Day 7: Morning coffee with high energy
  const day7 = createEmptyEntry('2026-02-14');
  day7.energy_score = 7;
  day7.morning_boosts = ['Morning coffee alone'];
  entries.push(day7);

  // Day 6 also had coffee (sporadic pattern)
  entries[5].evening_boosts = ['Morning coffee alone'];
  entries[5].energy_score = 7;

  // Add cognitive load activities across multiple days
  entries[0].morning_drains.push('Coordination tasks');
  entries[1].afternoon_custom_drain = 'School scheduling';
  entries[2].morning_custom_drain = 'Sister appointment booking';
  entries[4].afternoon_drains = ['Coordination tasks'];

  return entries;
}

// Test patterns matching the requirements
const drainPattern: PatternInfo = {
  activity: 'Email catch-up',
  frequency: 8,
  avg_energy: 3.6,
  energy_range: { min: 3, max: 4 },
  confidence: 'Strong pattern',
};

const boostPattern: PatternInfo = {
  activity: 'Morning coffee alone',
  frequency: 2,
  avg_energy: 7.0,
  energy_range: { min: 7, max: 7 },
  confidence: 'Weak signal',
};

const cognitiveLoadPattern: CognitiveLoadResult = {
  detected: true,
  category: 'Coordination & planning tasks',
  frequency: 4,
  avg_energy: 4.2,
  confidence: 'Emerging pattern',
  specific_activities: ['Coordination tasks', 'School scheduling', 'Sister appointment booking'],
};

// Run tests
console.log('='.repeat(70));
console.log('EXPERIMENT GENERATION TEST - Specific Patterns');
console.log('='.repeat(70));

const testEntries = createTestEntries();

// Test 1: Drain Pattern
console.log('\n' + '-'.repeat(70));
console.log('TEST 1: DRAIN PATTERN');
console.log('-'.repeat(70));
console.log('\nInput Pattern:');
console.log(`  Activity: ${drainPattern.activity}`);
console.log(`  Frequency: ${drainPattern.frequency}`);
console.log(`  Avg Energy: ${drainPattern.avg_energy}`);
console.log(`  Confidence: ${drainPattern.confidence}`);

const timeAnalysis = analyzeTimeBlocks(drainPattern.activity, testEntries);
console.log('\nTime Block Analysis:');
console.log(`  Morning: ${timeAnalysis.morning}`);
console.log(`  Afternoon: ${timeAnalysis.afternoon}`);
console.log(`  Evening: ${timeAnalysis.evening}`);
console.log(`  Most Common: ${timeAnalysis.mostCommon}`);
console.log(`  Scattered: ${timeAnalysis.isScattered}`);

const drainExperiment = generateDrainExperimentSuggestion(drainPattern, testEntries);
console.log('\nGenerated Experiment:');
console.log(`  Strategy: ${drainExperiment.strategy}`);
console.log(`  \n  "${drainExperiment.experiment}"`);

// Test 2: Boost Pattern
console.log('\n' + '-'.repeat(70));
console.log('TEST 2: BOOST PATTERN');
console.log('-'.repeat(70));
console.log('\nInput Pattern:');
console.log(`  Activity: ${boostPattern.activity}`);
console.log(`  Frequency: ${boostPattern.frequency}`);
console.log(`  Avg Energy: ${boostPattern.avg_energy}`);
console.log(`  Confidence: ${boostPattern.confidence}`);

const boostTimeAnalysis = analyzeTimeBlocks(boostPattern.activity, testEntries);
console.log('\nTime Block Analysis:');
console.log(`  Morning: ${boostTimeAnalysis.morning}`);
console.log(`  Afternoon: ${boostTimeAnalysis.afternoon}`);
console.log(`  Evening: ${boostTimeAnalysis.evening}`);
console.log(`  Sporadic: ${boostTimeAnalysis.isScattered ? 'Yes' : 'No'}`);

const boostExperiment = generateBoostExperimentSuggestion(
  boostPattern,
  testEntries,
  drainPattern // Pass top drain for potential pairing
);
console.log('\nGenerated Experiment:');
console.log(`  Strategy: ${boostExperiment.strategy}`);
console.log(`  \n  "${boostExperiment.experiment}"`);

// Test 3: Cognitive Load Pattern
console.log('\n' + '-'.repeat(70));
console.log('TEST 3: COGNITIVE LOAD PATTERN');
console.log('-'.repeat(70));
console.log('\nInput Pattern:');
console.log(`  Category: ${cognitiveLoadPattern.category}`);
console.log(`  Frequency: ${cognitiveLoadPattern.frequency}`);
console.log(`  Avg Energy: ${cognitiveLoadPattern.avg_energy}`);
console.log(`  Confidence: ${cognitiveLoadPattern.confidence}`);
console.log(`  Activities: ${cognitiveLoadPattern.specific_activities.join(', ')}`);

const cognitiveExperiment = generateCognitiveLoadExperimentSuggestion(cognitiveLoadPattern);
console.log('\nGenerated Experiment:');
console.log(`  Strategy: ${cognitiveExperiment.strategy}`);
console.log(`  \n  "${cognitiveExperiment.experiment}"`);

console.log('\n' + '='.repeat(70));
console.log('TEST COMPLETE');
console.log('='.repeat(70));
