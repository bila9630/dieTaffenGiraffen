import { createContext, useState, useEffect, ReactNode } from 'react';

export interface BoxVisibilitySettings {
  chatBox: boolean;
  infoBox: boolean;
  weatherBox: boolean;
}

interface BoxVisibilityContextType {
  settings: BoxVisibilitySettings;
  updateSetting: (key: keyof BoxVisibilitySettings, value: boolean) => void;
}

const STORAGE_KEY = 'box_visibility_settings';

const DEFAULT_SETTINGS: BoxVisibilitySettings = {
  chatBox: true,
  infoBox: true,
  weatherBox: true,
};

export const BoxVisibilityContext = createContext<BoxVisibilityContextType | undefined>(
  undefined
);

interface BoxVisibilityProviderProps {
  children: ReactNode;
}

export const BoxVisibilityProvider = ({ children }: BoxVisibilityProviderProps) => {
  const [settings, setSettings] = useState<BoxVisibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading box visibility settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving box visibility settings:', error);
    }
  }, [settings]);

  const updateSetting = (key: keyof BoxVisibilitySettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <BoxVisibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </BoxVisibilityContext.Provider>
  );
};
