import { DailyEntry } from '../types';

interface TimeBlockStats {
  count: number;
  totalEnergy: number;
  avgEnergy: number;
}

export interface ActivityTimeCorrelation {
  activity: string;
  type: 'drain' | 'boost';
  morning: TimeBlockStats;
  afternoon: TimeBlockStats;
  evening: TimeBlockStats;
  worstTime?: 'morning' | 'afternoon' | 'evening';
  bestTime?: 'morning' | 'afternoon' | 'evening';
  energyDifference?: number;
  recommendation?: string;
}

export function analyzeTimeCorrelations(entries: DailyEntry[]): ActivityTimeCorrelation[] {
  const activityMap = new Map<string, {
    activity: string;
    type: 'drain' | 'boost';
    morning: { count: number; totalEnergy: number };
    afternoon: { count: number; totalEnergy: number };
    evening: { count: number; totalEnergy: number };
  }>();

  // Process each entry
  entries.forEach(entry => {
    const energyScore = entry.energy_score;

    // Process morning drains
    entry.morning_drains?.forEach(drain => {
      initOrUpdate(activityMap, drain, 'drain', 'morning', energyScore);
    });

    // Process morning boosts
    entry.morning_boosts?.forEach(boost => {
      initOrUpdate(activityMap, boost, 'boost', 'morning', energyScore);
    });

    // Process afternoon drains
    entry.afternoon_drains?.forEach(drain => {
      initOrUpdate(activityMap, drain, 'drain', 'afternoon', energyScore);
    });

    // Process afternoon boosts
    entry.afternoon_boosts?.forEach(boost => {
      initOrUpdate(activityMap, boost, 'boost', 'afternoon', energyScore);
    });

    // Process evening drains
    entry.evening_drains?.forEach(drain => {
      initOrUpdate(activityMap, drain, 'drain', 'evening', energyScore);
    });

    // Process evening boosts
    entry.evening_boosts?.forEach(boost => {
      initOrUpdate(activityMap, boost, 'boost', 'evening', energyScore);
    });
  });

  // Calculate correlations
  const results: ActivityTimeCorrelation[] = [];

  activityMap.forEach((stats, activity) => {
    // Calculate averages
    const morningAvg = stats.morning.count > 0
      ? stats.morning.totalEnergy / stats.morning.count
      : 0;
    const afternoonAvg = stats.afternoon.count > 0
      ? stats.afternoon.totalEnergy / stats.afternoon.count
      : 0;
    const eveningAvg = stats.evening.count > 0
      ? stats.evening.totalEnergy / stats.evening.count
      : 0;

    // Find times with sufficient data (2+ occurrences)
    const validTimes = [
      { time: 'morning' as const, avg: morningAvg, count: stats.morning.count },
      { time: 'afternoon' as const, avg: afternoonAvg, count: stats.afternoon.count },
      { time: 'evening' as const, avg: eveningAvg, count: stats.evening.count }
    ].filter(t => t.count >= 2);

    // Need at least 2 time blocks with data to make comparison
    if (validTimes.length >= 2) {
      validTimes.sort((a, b) => a.avg - b.avg);
      const worstTime = validTimes[0];
      const bestTime = validTimes[validTimes.length - 1];
      const difference = bestTime.avg - worstTime.avg;

      // Only generate recommendation if difference is significant (1.0+ points)
      if (difference >= 1.0) {
        const recommendation = stats.type === 'drain'
          ? `Avoid ${activity} during ${worstTime.time} (${worstTime.avg.toFixed(1)} avg energy). Better in ${bestTime.time} (${bestTime.avg.toFixed(1)} avg).`
          : `${activity} works best in ${bestTime.time} (${bestTime.avg.toFixed(1)} avg energy) vs ${worstTime.time} (${worstTime.avg.toFixed(1)} avg).`;

        results.push({
          activity,
          type: stats.type,
          morning: {
            count: stats.morning.count,
            totalEnergy: stats.morning.totalEnergy,
            avgEnergy: morningAvg
          },
          afternoon: {
            count: stats.afternoon.count,
            totalEnergy: stats.afternoon.totalEnergy,
            avgEnergy: afternoonAvg
          },
          evening: {
            count: stats.evening.count,
            totalEnergy: stats.evening.totalEnergy,
            avgEnergy: eveningAvg
          },
          worstTime: worstTime.time,
          bestTime: bestTime.time,
          energyDifference: difference,
          recommendation
        });
      }
    }
  });

  // Sort by energy difference (most significant first)
  return results.sort((a, b) => (b.energyDifference || 0) - (a.energyDifference || 0));
}

function initOrUpdate(
  map: Map<string, any>,
  activity: string,
  type: 'drain' | 'boost',
  timeBlock: 'morning' | 'afternoon' | 'evening',
  energyScore: number
) {
  if (!map.has(activity)) {
    map.set(activity, {
      activity,
      type,
      morning: { count: 0, totalEnergy: 0 },
      afternoon: { count: 0, totalEnergy: 0 },
      evening: { count: 0, totalEnergy: 0 }
    });
  }

  const stats = map.get(activity);
  stats[timeBlock].count++;
  stats[timeBlock].totalEnergy += energyScore;
}
