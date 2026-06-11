import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { Regio, useAppContext } from "../Appcontext.tsx";
import BottomNavBar from "../components/BottomNavbar.tsx";
import { MapPin } from "lucide-react-native";

const PROVINCE_TO_REGION: Record<string, Regio> = {
  Groningen: "noord",
  Friesland: "noord",
  Drenthe: "noord",
  Overijssel: "noord",
  Flevoland: "noord",
  Gelderland: "noord",
  Utrecht: "midden",
  "Noord-Holland": "midden",
  "Zuid-Holland": "midden",
  Zeeland: "midden",
  "Noord-Brabant": "zuid",
  Limburg: "zuid",
};

async function detectSchoolRegion(): Promise<
  { region: Regio | null; error?: string }
> {
  if (Platform.OS === "android" && !Device.isDevice) {
    return { region: null, error: "GPS werkt niet in de Android emulator." };
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return { region: null, error: "Locatietoegang geweigerd." };
  }
  const loc = await Location.getCurrentPositionAsync({});
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&format=json`,
      { headers: { "User-Agent": "SchoolVakantiesApp/1.0" } },
    );
    const data = await res.json();
    const province: string = data.address?.state ?? "";
    return { region: PROVINCE_TO_REGION[province] ?? "midden" };
  } catch {
    return { region: "midden" };
  }
}

function buildSchoolYearOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const options: string[] = [];

  for (let y = year - 2; y <= year + 2; y++) {
    options.push(`${y}-${y + 1}`);
  }
  return options;
}

const SCHOOL_YEAR_OPTIONS = buildSchoolYearOptions();

const REGIO_OPTIONS: Regio[] = ["noord", "midden", "zuid"];
const REGIO_LABEL: Record<Regio, string> = {
  noord: "Noord",
  midden: "Midden",
  zuid: "Zuid",
};

const ChevronRight = () => <Text style={styles.chevron}>›</Text>;

export default function InstellingenScreen() {
  const navigation = useNavigation<any>();
  const { regio, setRegio, darkMode, setDarkMode, schoolYear, setSchoolYear } =
    useAppContext();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const colors = darkMode ? darkColors : lightColors;

  const handleGps = async () => {
    setGpsLoading(true);
    setGpsError(null);
    const { region, error } = await detectSchoolRegion();
    setGpsLoading(false);
    if (error) setGpsError(error);
    else if (region) await setRegio(region);
  };

  const currentIdx = SCHOOL_YEAR_OPTIONS.indexOf(schoolYear);
  const canGoPrev = currentIdx > 0;
  const canGoNext = currentIdx < SCHOOL_YEAR_OPTIONS.length - 1;

  const goPrev = () => {
    if (canGoPrev) setSchoolYear(SCHOOL_YEAR_OPTIONS[currentIdx - 1]);
  };
  const goNext = () => {
    if (canGoNext) setSchoolYear(SCHOOL_YEAR_OPTIONS[currentIdx + 1]);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
          REGIO
        </Text>

        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            Huidige regio
          </Text>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: colors.muted }]}>
              {REGIO_LABEL[regio]}
            </Text>
            <ChevronRight />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.gpsButton,
            { backgroundColor: colors.primary },
            gpsLoading && { opacity: 0.7 },
          ]}
          onPress={handleGps}
          activeOpacity={0.85}
          disabled={gpsLoading}
        >
          {gpsLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : (
              <Text style={styles.gpsIcon}>
                <MapPin color="#ff160c" />
              </Text>
            )}
          <Text style={styles.gpsLabel}>
            {gpsLoading ? "Locatie bepalen…" : "Gebruik GPS-locatie"}
          </Text>
        </TouchableOpacity>

        {gpsError && <Text style={styles.errorText}>{gpsError}</Text>}

        <View
          style={[styles.segmentWrapper, { backgroundColor: colors.card }]}
        >
          {REGIO_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.segmentButton,
                regio === r && { backgroundColor: colors.primary },
              ]}
              onPress={() => setRegio(r)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  { color: regio === r ? "#fff" : colors.text },
                ]}
              >
                {REGIO_LABEL[r]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
          SCHOOLJAAR
        </Text>

        <View
          style={[styles.yearPickerRow, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity
            style={[
              styles.yearArrowBtn,
              !canGoPrev && styles.yearArrowDisabled,
            ]}
            onPress={goPrev}
            disabled={!canGoPrev}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.yearArrow,
                { color: canGoPrev ? colors.primary : colors.muted },
              ]}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.yearLabelWrapper}>
            <Text style={[styles.yearLabel, { color: colors.text }]}>
              {schoolYear}
            </Text>
            {schoolYear === buildCurrentSchoolYear() && (
              <View
                style={[
                  styles.currentBadge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text
                  style={[styles.currentBadgeText, { color: colors.primary }]}
                >
                  huidig
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.yearArrowBtn,
              !canGoNext && styles.yearArrowDisabled,
            ]}
            onPress={goNext}
            disabled={!canGoNext}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.yearArrow,
                { color: canGoNext ? colors.primary : colors.muted },
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
          WEERGAVE
        </Text>
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            Donkere modus
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor="#fff"
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}

function buildCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 8) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

const darkColors = {
  background: "#1c1c1e",
  card: "#2c2c2e",
  primary: "#2e6fda",
  primaryLight: "rgba(46,111,218,0.18)",
  text: "#ffffff",
  muted: "#8e8e93",
  sectionLabel: "#8e8e93",
  border: "#3a3a3c",
};
const lightColors = {
  background: "#f2f2f7",
  card: "#ffffff",
  primary: "#2e6fda",
  primaryLight: "#ddeaff",
  text: "#000000",
  muted: "#6c6c70",
  sectionLabel: "#6c6c70",
  border: "#d1d1d6",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowLabel: { fontSize: 15 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 2 },
  rowValue: { fontSize: 15 },
  chevron: { fontSize: 20, color: "#8e8e93", marginLeft: 2, lineHeight: 22 },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 4,
    gap: 8,
  },
  gpsIcon: { fontSize: 15 },
  gpsLabel: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  errorText: {
    fontSize: 13,
    color: "#E63C3C",
    marginBottom: 6,
    marginLeft: 4,
  },
  segmentWrapper: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 2,
    marginTop: 4,
    padding: 3,
    gap: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentLabel: { fontSize: 14, fontWeight: "500" },

  // Year picker
  yearPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  yearArrowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  yearArrowDisabled: { opacity: 0.3 },
  yearArrow: { fontSize: 26, fontWeight: "400", lineHeight: 30 },
  yearLabelWrapper: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  yearLabel: { fontSize: 17, fontWeight: "700", letterSpacing: 0.2 },
  currentBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 11, fontWeight: "600" },
});
