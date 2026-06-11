import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Regio = "noord" | "midden" | "zuid";

export type SchoolYear = string;

function defaultSchoolYear(): SchoolYear {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  if (month >= 8) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

type AppContextValue = {
  regio: Regio;
  setRegio: (r: Regio) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (v: boolean) => Promise<void>;
  schoolYear: SchoolYear;
  setSchoolYear: (y: SchoolYear) => Promise<void>;
  loading: boolean;
};

const KEYS = {
  regio: "selectedRegio",
  darkMode: "darkMode",
  schoolYear: "schoolYear",
} as const;

const AppContext = createContext<AppContextValue>({
  regio: "noord",
  setRegio: async () => {},
  darkMode: false,
  setDarkMode: async () => {},
  schoolYear: defaultSchoolYear(),
  setSchoolYear: async () => {},
  loading: true,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [regio, _setRegio] = useState<Regio>("noord");
  const [darkMode, _setDarkMode] = useState(false);
  const [schoolYear, _setSchoolYear] = useState<SchoolYear>(
    defaultSchoolYear(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [[, savedRegio], [, savedDark], [, savedYear]] =
          await AsyncStorage.multiGet([
            KEYS.regio,
            KEYS.darkMode,
            KEYS.schoolYear,
          ]);
        if (savedRegio) _setRegio(savedRegio.toLowerCase() as Regio);
        if (savedDark !== null) _setDarkMode(savedDark === "true");
        if (savedYear) _setSchoolYear(savedYear);
      } catch (e) {
        console.warn("AppContext: failed to load settings", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setRegio = useCallback(async (r: Regio) => {
    _setRegio(r);
    await AsyncStorage.setItem(KEYS.regio, r).catch(console.warn);
  }, []);

  const setDarkMode = useCallback(async (v: boolean) => {
    _setDarkMode(v);
    await AsyncStorage.setItem(KEYS.darkMode, String(v)).catch(console.warn);
  }, []);

  const setSchoolYear = useCallback(async (y: SchoolYear) => {
    _setSchoolYear(y);
    await AsyncStorage.setItem(KEYS.schoolYear, y).catch(console.warn);
  }, []);

  return (
    <AppContext.Provider
      value={{
        regio,
        setRegio,
        darkMode,
        setDarkMode,
        schoolYear,
        setSchoolYear,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
