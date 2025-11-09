import { createContext, useState, useEffect, ReactNode } from 'react';

export interface BoxVisibilitySettings {
  chatBox: boolean;
  infoBox: boolean;
  weatherBox: boolean;
}

export interface BoxExpansionSettings {
  infoBoxExpanded: boolean;
  weatherBoxExpanded: boolean;
}

export type IntentCategory = 'activity' | 'planning' | 'discovery' | 'safety';

export interface Intent {
  text: string;
  category: IntentCategory;
  confidence: number; // 0-100
}

interface BoxVisibilityContextType {
  settings: BoxVisibilitySettings;
  updateSetting: (key: keyof BoxVisibilitySettings, value: boolean) => void;
  expansionSettings: BoxExpansionSettings;
  updateExpansion: (key: keyof BoxExpansionSettings, value: boolean) => void;
  check_visitor_capacity: () => void;
  hiking_route_linz: () => void;
  hikingWeatherSuccess: boolean;
  activeIntents: Intent[];
  showIntents: (intents: Intent[]) => void;
  addIntent: (intent: Intent) => void;
  clearIntents: () => void;
}

const STORAGE_KEY = 'box_visibility_settings';

const DEFAULT_SETTINGS: BoxVisibilitySettings = {
  chatBox: true,
  infoBox: true,
  weatherBox: true,
};

const DEFAULT_EXPANSION: BoxExpansionSettings = {
  infoBoxExpanded: false,
  weatherBoxExpanded: false,
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

  const [expansionSettings, setExpansionSettings] = useState<BoxExpansionSettings>(DEFAULT_EXPANSION);
  const [hikingWeatherSuccess, setHikingWeatherSuccess] = useState(false);
  const [activeIntents, setActiveIntents] = useState<Intent[]>([]);

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

  const updateExpansion = (key: keyof BoxExpansionSettings, value: boolean) => {
    setExpansionSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const check_visitor_capacity = () => {
    // Show InfoBox if not already visible
    setSettings((prev) => ({
      ...prev,
      infoBox: true,
    }));
    // Expand InfoBox
    setExpansionSettings((prev) => ({
      ...prev,
      infoBoxExpanded: true,
    }));
  };

  const hiking_route_linz = () => {
    // Show WeatherBox and expand it
    setSettings((prev) => ({
      ...prev,
      weatherBox: true,
      infoBox: false, // Hide InfoBox
    }));
    // Expand WeatherBox
    setExpansionSettings((prev) => ({
      ...prev,
      weatherBoxExpanded: true,
      infoBoxExpanded: false,
    }));
    // Show success state
    setHikingWeatherSuccess(true);
    // Auto-clear after 4 seconds
    setTimeout(() => {
      setHikingWeatherSuccess(false);
    }, 4000);
  };

  const showIntents = (intents: Intent[]) => {
    setActiveIntents(intents);
  };

  const addIntent = (intent: Intent) => {
    setActiveIntents((prev) => [...prev, intent]);
  };

  const clearIntents = () => {
    setActiveIntents([]);
  };

  return (
    <BoxVisibilityContext.Provider
      value={{
        settings,
        updateSetting,
        expansionSettings,
        updateExpansion,
        check_visitor_capacity,
        hiking_route_linz,
        hikingWeatherSuccess,
        activeIntents,
        showIntents,
        addIntent,
        clearIntents
      }}
    >
      {children}
    </BoxVisibilityContext.Provider>
  );
};
