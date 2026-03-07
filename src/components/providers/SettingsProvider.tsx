'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const applyTheme = useSettingsStore((state) => state.applyTheme);
  const hydrated = useSettingsStore((state) => state.hydrated);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchSettings();
    }
  }, [fetchSettings]);

  useEffect(() => {
    if (hydrated) {
      applyTheme();
    }
  }, [hydrated, applyTheme]);

  return <>{children}</>;
}
