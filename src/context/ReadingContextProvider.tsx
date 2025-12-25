import {
  type ReactNode,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { ReadingContext } from "./ReadingContext";

const STORAGE_KEY = "showReading";
const DEFAULT_VALUE = false;

function getSnapshot(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch {
    // エラー時はデフォルト値
  }
  return DEFAULT_VALUE;
}

function getServerSnapshot(): boolean {
  return DEFAULT_VALUE;
}

function subscribe(callback: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function ReadingProvider({ children }: { children: ReactNode }) {
  const showReading = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // 更新用のキーでリレンダリングをトリガー
  const [, setUpdateKey] = useState(0);

  const setShowReading = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      // 自分のタブ内での変更を反映するためリレンダリング
      setUpdateKey((k) => k + 1);
    } catch {
      // エラー時は何もしない
    }
  }, []);

  return (
    <ReadingContext.Provider value={{ showReading, setShowReading }}>
      {children}
    </ReadingContext.Provider>
  );
}
