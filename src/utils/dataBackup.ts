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
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `energy-tracker-backup-${dateStr}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

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
