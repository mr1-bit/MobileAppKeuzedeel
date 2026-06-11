import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppContext } from "../Appcontext.tsx";
import BottomNavBar from "../components/BottomNavbar.tsx";

interface Holiday {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  region: string;
  emoji: string;
}

const VACATION_EMOJI: Record<string, string> = {
  herfstvakantie: "🍂",
  kerstvakantie: "🎄",
  voorjaarsvakantie: "🌸",
  meivakantie: "🌷",
  zomervakantie: "☀️",
};

const VACATION_IMAGES: Record<string, any> = {
  herfstvakantie: require("../assets/images/herfst.jpg"),
  kerstvakantie: require("../assets/images/winter.jpg"),
  voorjaarsvakantie: require("../assets/images/voorjaar.jpg"),
  meivakantie: require("../assets/images/mei.jpg"),
  zomervakantie: require("../assets/images/zomer.jpg"),
};

function emojiForType(type: string): string {
  const key = type.toLowerCase().trim();
  for (const [k, v] of Object.entries(VACATION_EMOJI)) {
    if (key.includes(k)) return v;
  }
  return "📅";
}

function imageForType(type: string): any | null {
  const key = type.toLowerCase().trim();
  for (const [k, v] of Object.entries(VACATION_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return null;
}

function parseLocalDate(dateStr: string): Date {
  // The API sometimes returns "YYYY-MM-DDT00:00:00" — take only the date part.
  const datePart = dateStr.slice(0, 10); // "YYYY-MM-DD"
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

async function fetchHolidays(
  region: string,
  schoolYear: string,
): Promise<Holiday[]> {
  const allVacations: Holiday[] = [];
  try {
    const url =
      `https://opendata.rijksoverheid.nl/v1/infotypes/schoolholidays/schoolyear/${schoolYear}?output=json`;
    const res = await fetch(url);
    const data = await res.json();
    const vacations = data?.content?.[0]?.vacations ?? [];

    vacations.forEach((v: any, idx: number) => {
      v.regions
        .filter(
          (r: any) => r.region === region || r.region === "heel Nederland",
        )
        .forEach((r: any) => {
          allVacations.push({
            id: `${schoolYear}-${idx}-${r.region}`,
            name: v.type.trim(),
            startDate: parseLocalDate(r.startdate),
            endDate: parseLocalDate(r.enddate),
            region: r.region,
            emoji: emojiForType(v.type),
          });
        });
    });
  } catch {
    console.error("Failed to fetch holidays:");
  }
  const seen = new Set<string>();
  return allVacations
    .filter((h) => {
      const key = `${h.name}-${h.startDate.toISOString()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

function formatDate(date: Date): string {
  const monthNames = [
    "jan",
    "feb",
    "mrt",
    "apr",
    "mei",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "dec",
  ];
  return `${date.getDate()} ${
    monthNames[date.getMonth()]
  } ${date.getFullYear()}`;
}

/** ms remaining until the start of `target` (clamped to 0) */
function msUntil(target: Date): number {
  return Math.max(0, target.getTime() - Date.now());
}

function breakdownMs(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isUpcoming(h: Holiday): boolean {
  return h.endDate.getTime() > Date.now();
}

interface SwapModalProps {
  visible: boolean;
  holidays: Holiday[];
  current: Holiday;
  onSelect: (h: Holiday) => void;
  onClose: () => void;
  colors: ReturnType<typeof getColors>;
}

function SwapModal({
  visible,
  holidays,
  current,
  onSelect,
  onClose,
  colors,
}: SwapModalProps) {
  const upcoming = holidays.filter(isUpcoming);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          <View
            style={[styles.modalHandle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Kies een vakantie
          </Text>
          <FlatList
            data={upcoming}
            keyExtractor={(h) => h.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const { days } = breakdownMs(msUntil(item.startDate));
              const isSelected = item.id === current.id;
              const isOngoing = item.startDate.getTime() <= Date.now() &&
                item.endDate.getTime() > Date.now();

              return (
                <TouchableOpacity
                  style={[
                    styles.modalRow,
                    { backgroundColor: colors.background },
                    isSelected && {
                      backgroundColor: colors.primaryLight,
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalEmoji}>{item.emoji}</Text>
                  <View style={styles.modalRowInfo}>
                    <Text
                      style={[
                        styles.modalRowName,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.modalRowDate, { color: colors.muted }]}
                    >
                      {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.modalRowDays,
                      { color: isSelected ? colors.primary : colors.muted },
                    ]}
                  >
                    {isOngoing ? "Nu!" : `${days}d`}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.modalCancel, { backgroundColor: colors.background }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.modalCancelText, { color: colors.muted }]}>
              Annuleren
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function getColors(darkMode: boolean) {
  return darkMode
    ? {
      background: "#1c1c1e",
      card: "#2c2c2e",
      primary: "#3D5AFE",
      primaryLight: "rgba(61,90,254,0.18)",
      text: "#ffffff",
      muted: "#8e8e93",
      border: "#3a3a3c",
      countdownNum: "#ffffff",
      accent: "#3D5AFE",
      timerBg: "#2c2c2e",
      timerText: "#ffffff",
      sectionLabel: "#8e8e93",
    }
    : {
      background: "#E8EEF7",
      card: "#FFFFFF",
      primary: "#2A6DD9",
      primaryLight: "#D6E4FF",
      text: "#1A1F36",
      muted: "#7A8099",
      border: "#D0D7E8",
      countdownNum: "#1A1F36",
      accent: "#2A6DD9",
      timerBg: "#FFFFFF",
      timerText: "#1A1F36",
      sectionLabel: "#7A8099",
    };
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CountdownScreen() {
  const { regio, darkMode, schoolYear } = useAppContext();
  const colors = getColors(darkMode);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [selected, setSelected] = useState<Holiday | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Live ms remaining, updated every second
  const [msLeft, setMsLeft] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLoadingHolidays(true);
    fetchHolidays(regio, schoolYear)
      .then((data) => {
        setHolidays(data);
        const next = data.find(isUpcoming) ??
          (data.length > 0 ? data[0] : null);
        setSelected(next);
        setMsLeft(next ? msUntil(next.startDate) : 0);
      })
      .finally(() => setLoadingHolidays(false));
  }, [regio, schoolYear]);

  useEffect(() => {
    if (!selected) return;
    const tick = () => setMsLeft(msUntil(selected.startDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selected]);

  function handleSelect(holiday: Holiday) {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelected(holiday);
      setMsLeft(msUntil(holiday.startDate));
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    });
  }

  const { days, hours, minutes, seconds } = breakdownMs(msLeft);
  const isOngoing = selected != null &&
    selected.startDate.getTime() <= Date.now() &&
    selected.endDate.getTime() > Date.now();

  const REGIO_LABEL: Record<string, string> = {
    noord: "Noord",
    midden: "Midden",
    zuid: "Zuid",
  };

  if (loadingHolidays) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Vakanties laden…
          </Text>
        </View>
        <BottomNavBar />
      </SafeAreaView>
    );
  }

  if (!selected) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 40 }}>🎉</Text>
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Geen aankomende vakanties gevonden.
          </Text>
        </View>
        <BottomNavBar />
      </SafeAreaView>
    );
  }

  const vacationImage = imageForType(selected.name);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Countdown
          </Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {isOngoing
              ? "Je bent op vakantie! 🎉"
              : `Schooljaar ${schoolYear.replace("-", "–")}`}
          </Text>
        </View>
        <View style={[styles.regionBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.regionBadgeText}>
            {REGIO_LABEL[regio] ?? regio}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.nameCard,
            {
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.nameCardInner}
            onPress={() =>
              setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.nameCardEmoji}>{selected.emoji}</Text>
            <View style={styles.nameCardText}>
              <Text style={[styles.holidayName, { color: colors.text }]}>
                {selected.name}
              </Text>
              <Text style={[styles.holidayDates, { color: colors.muted }]}>
                {formatDate(selected.startDate)} –{" "}
                {formatDate(selected.endDate)}
              </Text>
            </View>
            <View
              style={[styles.swapBadge, {
                backgroundColor: colors.primaryLight,
              }]}
            >
              <Text style={[styles.swapBadgeText, { color: colors.primary }]}>
                wissel
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {vacationImage && (
          <Animated.View
            style={[
              styles.imageCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={vacationImage}
              style={styles.vacationImage}
              resizeMode="cover"
            />
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.countdownCard,
            { backgroundColor: colors.card, opacity: fadeAnim },
          ]}
        >
          {isOngoing
            ? (
              <View style={styles.ongoingContainer}>
                <Text style={styles.ongoingEmoji}>🎉</Text>
                <Text style={[styles.ongoingTitle, { color: colors.primary }]}>
                  Je bent op vakantie!
                </Text>
                <Text style={[styles.ongoingDates, { color: colors.muted }]}>
                  t/m {formatDate(selected.endDate)}
                </Text>
              </View>
            )
            : (
              <>
                <Text style={[styles.countdownLabel, { color: colors.muted }]}>
                  nog
                </Text>

                <Text
                  style={[styles.countdownNumber, {
                    color: colors.countdownNum,
                  }]}
                >
                  {days}
                </Text>
                <Text style={[styles.countdownDagen, { color: colors.muted }]}>
                  {days === 1 ? "dag" : "dagen"}
                </Text>

                <View
                  style={[styles.timerRow, { backgroundColor: colors.timerBg }]}
                >
                  <View style={styles.timerUnit}>
                    <Text
                      style={[styles.timerNum, { color: colors.timerText }]}
                    >
                      {pad2(hours)}
                    </Text>
                    <Text style={[styles.timerLabel, { color: colors.muted }]}>
                      uur
                    </Text>
                  </View>
                  <Text style={[styles.timerColon, { color: colors.muted }]}>
                    :
                  </Text>
                  <View style={styles.timerUnit}>
                    <Text
                      style={[styles.timerNum, { color: colors.timerText }]}
                    >
                      {pad2(minutes)}
                    </Text>
                    <Text style={[styles.timerLabel, { color: colors.muted }]}>
                      min
                    </Text>
                  </View>
                  <Text style={[styles.timerColon, { color: colors.muted }]}>
                    :
                  </Text>
                  <View style={styles.timerUnit}>
                    <Text
                      style={[styles.timerNum, { color: colors.timerText }]}
                    >
                      {pad2(seconds)}
                    </Text>
                    <Text style={[styles.timerLabel, { color: colors.muted }]}>
                      sec
                    </Text>
                  </View>
                </View>
              </>
            )}
        </Animated.View>

        {!isOngoing && (
          <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {Math.floor(days / 7)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                weken
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {days % 7}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                rest dagen
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {Math.round(
                  (selected.endDate.getTime() - selected.startDate.getTime()) /
                    86400000,
                )}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                vakantiedagen
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <SwapModal
        visible={modalVisible}
        holidays={holidays}
        current={selected}
        onSelect={handleSelect}
        onClose={() => setModalVisible(false)}
        colors={colors}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  regionBadge: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  regionBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  scrollView: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
    alignItems: "center",
    gap: 12,
  },

  nameCard: {
    width: "100%",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nameCardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  nameCardEmoji: { fontSize: 32 },
  nameCardText: { flex: 1 },
  holidayName: { fontSize: 17, fontWeight: "700" },
  holidayDates: { fontSize: 12, marginTop: 2 },
  swapBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  swapBadgeText: { fontSize: 12, fontWeight: "600" },

  imageCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  vacationImage: {
    width: "100%",
    height: 160,
  },

  countdownCard: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 2,
  },
  countdownLabel: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: "800",
    lineHeight: 80,
    letterSpacing: -3,
  },
  countdownDagen: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  // hh:mm:ss timer
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
    marginTop: 4,
  },
  timerUnit: { alignItems: "center", minWidth: 44 },
  timerNum: {
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.5,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 1,
  },
  timerColon: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
  },

  ongoingContainer: { alignItems: "center", gap: 6, paddingVertical: 8 },
  ongoingEmoji: { fontSize: 48 },
  ongoingTitle: { fontSize: 22, fontWeight: "700" },
  ongoingDates: { fontSize: 14 },

  statsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: "700" },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    maxHeight: "75%",
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  modalList: { paddingHorizontal: 16 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  modalEmoji: { fontSize: 28 },
  modalRowInfo: { flex: 1 },
  modalRowName: { fontSize: 15, fontWeight: "600" },
  modalRowDate: { fontSize: 12, marginTop: 2 },
  modalRowDays: { fontSize: 15, fontWeight: "700" },
  modalCancel: {
    marginTop: 6,
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600" },
});
