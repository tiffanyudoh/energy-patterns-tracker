# Energy Patterns Tracker

I built this to figure out what actually drains my energy versus what restores it. Less about maintaining streaks, this tracker focuses on identifying patterns so you can make informed decisions about your time and boundaries.

Log your day in under 2 minutes. Get pattern analysis after a week. Try one experiment at a time.

## Live Demo

 **[Try it here](https://energy-patterns-tracker.vercel.app/)**

No login required. Data stays in your browser.

## What It Does

**Daily logging:**
- Rate your energy (1-10) with a battery slider
- Select drains and boosts across morning/afternoon/evening time blocks
- Add custom entries for anything not in the predefined lists

**Weekly analysis:**
- Surfaces top 2 drains and top 2 boosts based on frequency and consistency
- Detects cognitive load patterns (coordination tasks, invisible labor)
- Generates specific experiments based on your data

**Data management:**
- Export/import as JSON backup
- Calendar highlights which dates have entries
- Works offline, no account required

## Design Decisions

**Time-blocked structure:** Energy isn't uniform throughout the day. Morning email hits different than evening email.

**Pattern-based, not prescriptive:** Shows what's already happening in your data. Suggests experiments based on your patterns, not generic advice.

**Template-based experiments:** Smart template logic with frequency-aware strategies gets good results without API calls.

**Warm color palette:** Meant to feel like a journal. Color-coded ribbons (amber for drains, sage for boosts, burgundy for cognitive load) provide visual hierarchy.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (custom palette)
- localStorage (works offline, no backend)
- date-fns (timezone-safe date handling)
- Deployed on Vercel

## Running Locally
```bash
git clone https://github.com/tiffanyudoh/energy-patterns-tracker.git
cd energy-patterns-tracker
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

localStorage data is per-origin. Export before clearing browser data.

## Pattern Detection

**How it works:**
- Scans all time blocks plus custom fields for each day
- Groups identical activities, calculates frequency and average energy
- Assigns confidence levels based on frequency (≥5 = Strong, ≥3 = Emerging, ≥2 = Weak signal)
- Cognitive load triggers when ≥3 coordination-type tasks appear with average energy ≤5

**Experiment generation:**
- Frequency-aware strategies (high vs low frequency get different advice)
- Type-aware (coordination tasks get different suggestions than other drains)
- Includes specific timing and scheduling recommendations

## Development Notes

Built from comprehensive specs before coding. UX improvements came from actual usage: battery slider for faster mobile input, calendar highlighting to see logging patterns, timezone-safe date handling, "boosts" instead of "restorers" (less clunky).

## Known Limitations

### Backup Filenames
- **Chrome/Safari:** Backups download with date-stamped filenames (e.g., `energy-tracker-backup-2026-02-19.json`)
- **DuckDuckGo/Firefox:** May generate generic filenames due to browser privacy restrictions
- **Workaround:** File contents are correct - simply rename after download, or use Chrome for backups

Full cross-browser support for custom filenames planned for future release.

Pattern detection prioritizes accuracy. All custom fields get scanned. Confidence levels use consistent thresholds. No false precision.

## What's Next 

Next: expanded cognitive load detection (better keyword coverage), smarter frequency-aware experiment logic.

Coming Soon: focus selection system to track which experiment you're trying and compare results week-over-week.

## Future Enhancements

### v1.4 - Enhanced Mobile Support
- [ ] Web Share API for backup downloads (works across all mobile browsers)
- [ ] Progressive Web App offline support
- [ ] Better touch interactions for time blocks

### Browser Compatibility Goals:
- Chrome: ✅ Full support
- Safari (iOS): ✅ Full support  
- DuckDuckGo: 🟡 Works (generic filenames)
- Firefox Mobile: 🟡 Works (generic filenames)
- Samsung Internet: 🟡 Untested
- Edge Mobile: 🟡 Untested

Target: 100% feature parity across top 5 mobile browsers by v2.0

## Screenshots

[]
[]
[]

