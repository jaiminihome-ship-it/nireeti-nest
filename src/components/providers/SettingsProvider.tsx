'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const applyTheme = useSettingsStore((state) => state.applyTheme);

  useEffect(() => {
    // Fetch settings on mount
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // Apply theme when settings change
    applyTheme();
  }, [applyTheme]);

  return <>{children}</>;
}
