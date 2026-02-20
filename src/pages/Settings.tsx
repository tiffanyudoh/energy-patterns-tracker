import { useState } from 'react';
import {
  exportData,
  validateBackupFile,
  importDataReplace,
  importDataMerge,
  clearAllData,
} from '@/utils/dataBackup';
import { useAppContext } from '@/context/AppContext';
import { CustomCategories } from '@/types';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { showWeekStrip, setShowWeekStrip, customCategories, setCustomCategories } = useAppContext();
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<{
    key: keyof CustomCategories;
    value: string;
  } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleExport = () => {
    try {
      exportData();
      setMessage({ type: 'success', text: 'Backup saved! Keep this file safe.' });
    } catch {
      setMessage({ type: 'error', text: 'Export failed. Please try again.' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setMessage({ type: 'error', text: 'Please select a .json file' });
        return;
      }
      setImportFile(file);
      setShowImportModal(true);
    }
  };

  const handleImport = async (strategy: 'merge' | 'replace') => {
    if (!importFile) return;

    try {
      const fileContent = await importFile.text();

      if (!validateBackupFile(fileContent)) {
        setMessage({
          type: 'error',
          text: 'Invalid backup file. Please select a valid energy tracker backup.',
        });
        setShowImportModal(false);
        return;
      }

      const success =
        strategy === 'merge'
          ? importDataMerge(fileContent)
          : importDataReplace(fileContent);

      if (success) {
        setMessage({ type: 'success', text: 'Data restored successfully!' });
        setShowImportModal(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: 'Import failed. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Import failed. Please try again.' });
    }
  };

  const handleRemoveCategory = () => {
    if (!pendingRemoval) return;
    const { key, value } = pendingRemoval;
    const updated = (customCategories[key] || []).filter((c) => c !== value);
    setCustomCategories({ ...customCategories, [key]: updated });
    setPendingRemoval(null);
    setMessage({ type: 'success', text: `Removed "${value}"` });
  };

  const CATEGORY_LABELS: Record<keyof CustomCategories, string> = {
    morning_drains: 'Morning Drains',
    morning_boosts: 'Morning Boosts',
    afternoon_drains: 'Afternoon Drains',
    afternoon_boosts: 'Afternoon Boosts',
    evening_drains: 'Evening Drains',
    evening_boosts: 'Evening Boosts',
    whole_day_drains: 'Whole Day Drains',
    whole_day_boosts: 'Whole Day Boosts',
  };

  const categoryKeys = Object.keys(CATEGORY_LABELS) as (keyof CustomCategories)[];

  const handleClearData = () => {
    try {
      clearAllData();
      setMessage({ type: 'success', text: 'All data cleared.' });
      setShowClearConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to clear data.' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary mb-6"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <h1 className="text-2xl font-semibold mb-6 text-text-primary">
          Settings
        </h1>

        {/* Success/Error Messages */}
        {message && (
          <div
            className="mb-6 p-4 rounded-lg text-white font-medium"
            style={{
              background:
                message.type === 'success'
                  ? 'var(--success)'
                  : 'var(--error)',
            }}
          >
            {message.text}
          </div>
        )}

        {/* Display Preferences */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Display Preferences
          </h2>

          <div
            className="p-6 rounded-lg bg-bg-secondary"
            style={{ borderLeft: '2px solid var(--accent)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1 text-text-primary">
                  Show Week Strip
                </h3>
                <p className="text-sm text-text-secondary">
                  Display 7-day strip at top of daily log. When hidden, use arrows and calendar to navigate.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={showWeekStrip}
                onClick={() => setShowWeekStrip(!showWeekStrip)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
                style={{ background: showWeekStrip ? 'var(--accent-rich)' : 'var(--bg-tertiary)' }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200"
                  style={{
                    transform: showWeekStrip ? 'translate(22px, 2px)' : 'translate(2px, 2px)',
                  }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Data Management
          </h2>

          {/* Export */}
          <div
            className="p-6 rounded-lg mb-4 bg-bg-secondary"
            style={{ borderLeft: '2px solid var(--accent)' }}
          >
            <h3 className="font-semibold mb-2 text-text-primary">
              Backup Your Data
            </h3>
            <p className="text-sm mb-4 text-text-secondary">
              Export all your energy tracking data as a JSON file. Keep this file
              safe!
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-medium text-white bg-accent-rich hover:brightness-90"
            >
              Backup My Data
            </button>
          </div>

          {/* Import */}
          <div
            className="p-6 rounded-lg mb-4 bg-bg-secondary"
            style={{ borderLeft: '2px solid var(--accent)' }}
          >
            <h3 className="font-semibold mb-2 text-text-primary">
              Restore from Backup
            </h3>
            <p className="text-sm mb-4 text-text-secondary">
              Import previously exported data.
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="inline-block px-4 py-2 rounded-lg font-medium text-white bg-accent hover:brightness-90">
                Restore from Backup
              </span>
            </label>
          </div>
        </section>

        {/* Custom Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Custom Categories
          </h2>

          <div
            className="p-6 rounded-lg bg-bg-secondary space-y-4"
            style={{ borderLeft: '2px solid var(--accent)' }}
          >
            {categoryKeys.map((key) => {
              const items = customCategories[key] || [];
              return (
                <div key={key}>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">
                    {CATEGORY_LABELS[key]} ({items.length})
                  </h4>
                  {items.length === 0 ? (
                    <p className="text-sm italic text-text-tertiary">
                      No custom categories yet. Add them while logging.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-bg-tertiary text-text-primary"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => setPendingRemoval({ key, value: item })}
                            className="ml-1 text-text-tertiary hover:text-error transition-colors"
                            title={`Remove "${item}"`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Danger Zone
          </h2>
          <div
            className="p-6 rounded-lg bg-bg-secondary"
            style={{ borderLeft: '2px solid var(--error)' }}
          >
            <h3 className="font-semibold mb-2 text-error">Clear All Data</h3>
            <p className="text-sm mb-4 text-text-secondary">
              Permanently delete all your energy tracking data. This cannot be
              undone.
            </p>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 rounded-lg font-medium text-white bg-error hover:brightness-90"
            >
              Clear All Data
            </button>
          </div>
        </section>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-lg p-6 max-w-md w-full bg-bg-primary">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">
                How to Import?
              </h3>

              <button
                type="button"
                onClick={() => handleImport('merge')}
                className="w-full p-4 rounded-lg mb-3 text-left bg-bg-secondary border border-accent hover:brightness-95"
              >
                <div className="font-semibold mb-1 text-accent-rich">
                  Merge Data (Recommended)
                </div>
                <div className="text-sm text-text-secondary">
                  Combine backup with current data. Keeps your current entries if
                  dates conflict.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleImport('replace')}
                className="w-full p-4 rounded-lg mb-3 text-left bg-bg-secondary border border-error hover:brightness-95"
              >
                <div className="font-semibold mb-1 text-error">
                  Replace All Data
                </div>
                <div className="text-sm text-text-secondary">
                  Delete current data and replace with backup. Cannot be undone.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="w-full p-2 rounded-lg bg-bg-tertiary text-text-primary hover:brightness-95"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-lg p-6 max-w-md w-full bg-bg-primary">
              <h3 className="text-lg font-semibold mb-4 text-error">
                Clear All Data?
              </h3>
              <p className="mb-6 text-text-secondary">
                This will permanently delete all your energy tracking data. This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClearData}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-error hover:brightness-90"
                >
                  Yes, Clear All Data
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-bg-tertiary text-text-primary hover:brightness-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Remove Category Confirmation Modal */}
        {pendingRemoval && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-lg p-6 max-w-md w-full bg-bg-primary">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">
                Remove Category?
              </h3>
              <p className="mb-6 text-text-secondary">
                Remove &ldquo;{pendingRemoval.value}&rdquo; from {CATEGORY_LABELS[pendingRemoval.key].toLowerCase()}? It will no longer appear as a checkbox option.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRemoveCategory}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-error hover:brightness-90"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRemoval(null)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-bg-tertiary text-text-primary hover:brightness-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
