import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../Appcontext.tsx";

type RegionEntry = {
  region: string;
  startdate: string;
  enddate: string;
  days: number;
};

type Vacation = {
  type: string;
  compulsorydates: string;
  regions: RegionEntry[];
};

type VacationByRegion = {
  type: string;
  region: string;
  startdate: string;
  enddate: string;
};

type Props = {
  region?: string;

  schoolYear?: string;
};

function defaultSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 8) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

function parseLocalDate(dateStr: string): Date {
  const datePart = dateStr.slice(0, 10);
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

async function getVacationsByRegion(
  regions: string[],
  schoolYear: string,
): Promise<VacationByRegion[]> {
  const url =
    `https://opendata.rijksoverheid.nl/v1/infotypes/schoolholidays/schoolyear/${schoolYear}?output=json`;
  const response = await fetch(url);
  const data = await response.json();
  const vacations: Vacation[] = data.content[0].vacations;

  return vacations.flatMap((vacation) =>
    vacation.regions
      .filter((r) =>
        regions.includes(r.region) || r.region === "heel Nederland"
      )
      .map((r) => ({
        type: vacation.type.trim(),
        region: r.region,
        startdate: r.startdate,
        enddate: r.enddate,
      }))
  );
}

const darkColors = {
  card: "#2c2c2e",
  cardBorder: "#3a3a3c",
  naam: "#ffffff",
  datums: "#8e8e93",
  sectionLabel: "#636366",
  badgePastBg: "#3a3a3c",
  badgePastText: "#636366",
  stipPast: "#555558",
  emptyText: "#636366",
};
const lightColors = {
  card: "#FFFFFF",
  cardBorder: "#E2E5F0",
  naam: "#1A1A2E",
  datums: "#999",
  sectionLabel: "#AAA",
  badgePastBg: "#E5E7EB",
  badgePastText: "#9CA3AF",
  stipPast: "#BBB",
  emptyText: "#AAA",
};

export default function VacationList({
  region = "noord",
  schoolYear,
}: Props) {
  const [vacations, setVacations] = useState<VacationByRegion[]>([]);
  const resolvedYear = schoolYear ?? defaultSchoolYear();
  const { darkMode } = useAppContext();
  const c = darkMode ? darkColors : lightColors;

  useEffect(() => {
    setVacations([]);
    getVacationsByRegion([region, "heel Nederland"], resolvedYear).then(
      setVacations,
    );
  }, [region, resolvedYear]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPast = (enddate: string) => parseLocalDate(enddate) < today;

  const getDaysUntil = (target: Date) =>
    Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getDaysAgo = (enddate: string) =>
    Math.ceil(
      (today.getTime() - parseLocalDate(enddate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

  const sorted = [...vacations].sort((a, b) => {
    const aPast = isPast(a.enddate);
    const bPast = isPast(b.enddate);
    if (aPast !== bPast) return aPast ? 1 : -1;
    return (
      parseLocalDate(a.startdate).getTime() -
      parseLocalDate(b.startdate).getTime()
    );
  });

  const upcoming = sorted.filter((v) => !isPast(v.enddate));
  const past = sorted.filter((v) => isPast(v.enddate));

  const renderCard = (item: VacationByRegion, i: number) => {
    const isItemPast = isPast(item.enddate);
    const startLocal = parseLocalDate(item.startdate);
    const endLocal = parseLocalDate(item.enddate);
    return (
      <View
        key={i}
        style={[
          styles.kaart,
          { backgroundColor: c.card, borderColor: c.cardBorder },
          isItemPast && styles.kaartVoorbij,
        ]}
      >
        <View
          style={[styles.stip, {
            backgroundColor: isItemPast ? c.stipPast : "#F59E0B",
          }]}
        />
        <View style={styles.kaartInfo}>
          <Text style={[styles.kaartNaam, { color: c.naam }]}>
            {item.type}
          </Text>
          <Text style={[styles.kaartDatums, { color: c.datums }]}>
            {startLocal.toLocaleDateString("nl-NL")} –{" "}
            {endLocal.toLocaleDateString("nl-NL")}
          </Text>
          <View
            style={[
              styles.dagenBadge,
              { backgroundColor: isItemPast ? c.badgePastBg : "#F59E0B" },
            ]}
          >
            <Text
              style={[styles.dagenTekst, {
                color: isItemPast ? c.badgePastText : "#DCFCE7",
              }]}
            >
              {isItemPast
                ? `${getDaysAgo(item.enddate)} dagen geleden`
                : `${getDaysUntil(startLocal)} dagen`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {upcoming.length === 0 && past.length === 0 && (
        <Text style={[styles.emptyText, { color: c.emptyText }]}>
          Geen vakanties gevonden.
        </Text>
      )}
      {upcoming.map((item, i) => renderCard(item, i))}
      {past.length > 0 && (
        <>
          <Text style={[styles.sectieLabel, { color: c.sectionLabel }]}>
            VOORBIJ
          </Text>
          {past.map((item, i) => renderCard(item, i + upcoming.length))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
  },
  sectieLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 10,
  },
  kaart: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    gap: 12,
    marginBottom: 8,
  },
  kaartVoorbij: { opacity: 0.45 },
  stip: { width: 11, height: 11, borderRadius: 6, flexShrink: 0 },
  kaartInfo: { flex: 1 },
  kaartNaam: { fontSize: 15, fontWeight: "600" },
  kaartDatums: { fontSize: 12, marginTop: 2 },
  dagenBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  dagenTekst: { fontSize: 12, fontWeight: "700" },
});
