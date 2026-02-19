const STORAGE_KEYS = {
  LAST_BACKUP: 'last_backup_date',
  DISMISSED_UNTIL: 'backup_reminder_dismissed_until',
  ENTRIES: 'energy_tracker_entries',
} as const;

export function shouldShowBackupReminder(): boolean {
  const dismissedUntil = localStorage.getItem(STORAGE_KEYS.DISMISSED_UNTIL);

  if (dismissedUntil) {
    if (new Date(dismissedUntil) > new Date()) {
      return false;
    }
  }

  const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);

  // Never backed up — only prompt once they have ≥7 days of data
  if (!lastBackup) {
    return getDaysLogged() >= 7;
  }

  // Last backup ≥7 days ago
  const daysSinceBackup = Math.floor(
    (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceBackup >= 7;
}

export function getDaysLogged(): number {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENTRIES) || '{}');
    return Object.keys(entries).length;
  } catch {
    return 0;
  }
}

export function markBackupComplete(): void {
  localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
}

export function dismissBackupReminder(): void {
  const dismissUntil = new Date();
  dismissUntil.setDate(dismissUntil.getDate() + 7);
  localStorage.setItem(STORAGE_KEYS.DISMISSED_UNTIL, dismissUntil.toISOString());
}
