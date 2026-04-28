import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "@calculator/history/v1";
const SETTINGS_KEY = "@calculator/settings/v1";

export type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
  createdAt: number;
};

export type Settings = {
  angleMode: "deg" | "rad";
  scientific: boolean;
};

const defaultSettings: Settings = {
  angleMode: "deg",
  scientific: false,
};

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveHistory(entries: HistoryEntry[]): Promise<void> {
  try {
    const trimmed = entries.slice(0, 100);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    /* noop */
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    /* noop */
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}
