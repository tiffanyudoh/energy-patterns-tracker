import { markBackupComplete } from './backupReminder';

export function exportData(): boolean {
  try {
    const allData: Record<string, unknown> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            allData[key] = JSON.parse(value);
          } catch {
            allData[key] = value;
          }
        }
      }
    }

    const backup = {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0-MVP',
      dataType: 'energy-patterns-tracker',
      data: allData,
      stats: {
        totalKeys: Object.keys(allData).length,
        exportedBy: 'Energy Patterns Tracker',
      },
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `energy-tracker-backup-${dateStr}.json`;

    // Android Chrome ignores the download attribute filename for blob URLs,
    // generating a UUID filename instead. Data URI approach preserves it.
    const isAndroid = /Android/i.test(navigator.userAgent);

    markBackupComplete();

    if (isAndroid) {
      const reader = new FileReader();
      reader.onload = function () {
        const link = document.createElement('a');
        link.href = reader.result as string;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }

    return true;
  } catch {
    return false;
  }
}

export function validateBackupFile(fileContent: string): boolean {
  try {
    const backup = JSON.parse(fileContent);

    if (!backup.dataType || backup.dataType !== 'energy-patterns-tracker') {
      return false;
    }

    if (!backup.data || typeof backup.data !== 'object') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function importDataReplace(fileContent: string): boolean {
  try {
    const backup = JSON.parse(fileContent);

    localStorage.clear();

    Object.keys(backup.data).forEach((key) => {
      const value = backup.data[key];
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    });

    return true;
  } catch {
    return false;
  }
}

export function importDataMerge(fileContent: string): boolean {
  try {
    const backup = JSON.parse(fileContent);

    Object.keys(backup.data).forEach((key) => {
      if (!localStorage.getItem(key)) {
        const value = backup.data[key];
        const stringValue =
          typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
      }
    });

    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch {
    return false;
  }
}
