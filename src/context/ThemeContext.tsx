"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AccentColor = "blue" | "emerald" | "indigo" | "violet" | "rose" | "amber";

export interface ThemeSettings {
  lesName: string;
  lesTagline: string;
  accentColor: AccentColor;
  mode: "light" | "dark";
  lateToleranceMinutes: number;
}

export interface ThemeColors {
  name: string;
  bg: string;
  hover: string;
  text: string;
  textMuted: string;
  border: string;
  ring: string;
  shadow: string;
  gradient: string;
  logoGradient: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const colorThemes: Record<AccentColor, ThemeColors> = {
  blue: {
    name: "Royal Blue",
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
    text: "text-blue-600 dark:text-blue-400",
    textMuted: "text-blue-400",
    border: "border-blue-600",
    ring: "focus:ring-blue-500",
    shadow: "shadow-blue-500/20",
    gradient: "from-blue-600 via-indigo-600 to-blue-800",
    logoGradient: "from-blue-600 to-indigo-500",
    badgeBg: "bg-blue-500/20",
    badgeText: "text-blue-400",
    badgeBorder: "border-blue-500/30",
  },
  emerald: {
    name: "Emerald Green",
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-700",
    text: "text-emerald-600 dark:text-emerald-400",
    textMuted: "text-emerald-400",
    border: "border-emerald-600",
    ring: "focus:ring-emerald-500",
    shadow: "shadow-emerald-500/20",
    gradient: "from-emerald-600 via-teal-600 to-emerald-800",
    logoGradient: "from-emerald-600 to-teal-500",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
  },
  indigo: {
    name: "Indigo Purple",
    bg: "bg-indigo-600",
    hover: "hover:bg-indigo-700",
    text: "text-indigo-600 dark:text-indigo-400",
    textMuted: "text-indigo-400",
    border: "border-indigo-600",
    ring: "focus:ring-indigo-500",
    shadow: "shadow-indigo-500/20",
    gradient: "from-indigo-600 via-purple-600 to-indigo-800",
    logoGradient: "from-indigo-600 to-purple-500",
    badgeBg: "bg-indigo-500/20",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/30",
  },
  violet: {
    name: "Deep Violet",
    bg: "bg-violet-600",
    hover: "hover:bg-violet-700",
    text: "text-violet-600 dark:text-violet-400",
    textMuted: "text-violet-400",
    border: "border-violet-600",
    ring: "focus:ring-violet-500",
    shadow: "shadow-violet-500/20",
    gradient: "from-violet-600 via-fuchsia-600 to-violet-800",
    logoGradient: "from-violet-600 to-fuchsia-500",
    badgeBg: "bg-violet-500/20",
    badgeText: "text-violet-400",
    badgeBorder: "border-violet-500/30",
  },
  rose: {
    name: "Crimson Rose",
    bg: "bg-rose-600",
    hover: "hover:bg-rose-700",
    text: "text-rose-600 dark:text-rose-400",
    textMuted: "text-rose-400",
    border: "border-rose-600",
    ring: "focus:ring-rose-500",
    shadow: "shadow-rose-500/20",
    gradient: "from-rose-600 via-pink-600 to-rose-800",
    logoGradient: "from-rose-600 to-pink-500",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/30",
  },
  amber: {
    name: "Warm Amber",
    bg: "bg-amber-600",
    hover: "hover:bg-amber-700",
    text: "text-amber-600 dark:text-amber-400",
    textMuted: "text-amber-400",
    border: "border-amber-600",
    ring: "focus:ring-amber-500",
    shadow: "shadow-amber-500/20",
    gradient: "from-amber-600 via-orange-600 to-amber-800",
    logoGradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/30",
  },
};

interface ThemeContextType {
  settings: ThemeSettings;
  themeColors: ThemeColors;
  toggleMode: () => void;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ThemeSettings = {
  lesName: "Bimbel Bintang Prestasi",
  lesTagline: "Sistem Presensi & Manajemen Bimbel",
  accentColor: "blue",
  mode: "light",
  lateToleranceMinutes: 15,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply dark class helper
  const applyThemeMode = (mode: "light" | "dark") => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("epresensi_theme_cms");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...defaultSettings, ...parsed };
        setSettings(merged);
        applyThemeMode(merged.mode);
      } catch (e) {
        console.error("Failed to parse saved theme settings", e);
      }
    } else {
      applyThemeMode(defaultSettings.mode);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("epresensi_theme_cms", JSON.stringify(settings));
    applyThemeMode(settings.mode);
  }, [settings, isInitialized]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.mode) {
        applyThemeMode(newSettings.mode);
      }
      return updated;
    });
  };

  const toggleMode = () => {
    updateSettings({ mode: settings.mode === "dark" ? "light" : "dark" });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("epresensi_theme_cms");
    applyThemeMode(defaultSettings.mode);
  };

  const currentThemeColors = colorThemes[settings.accentColor] || colorThemes.blue;

  return (
    <ThemeContext.Provider
      value={{
        settings,
        themeColors: currentThemeColors,
        toggleMode,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeCMS() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeCMS must be used within a ThemeProvider");
  }
  return context;
}

