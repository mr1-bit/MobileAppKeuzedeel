import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../Appcontext.tsx";
import VacationList from "../components/GetVacations.tsx";
import BottomNavBar from "../components/BottomNavbar.tsx";
import SideNavBar from "../components/SideNavbar.tsx";
import { useOrientation } from "../orientation.ts";

const REGIO_LABEL: Record<string, string> = {
  noord: "Noord",
  midden: "Midden",
  zuid: "Zuid",
};

export default function OverzichtScreen() {
  const navigation = useNavigation<any>();
  const { regio, darkMode, loading, schoolYear } = useAppContext();
  const colors = darkMode ? darkColors : lightColors;
  const orientation = useOrientation();
  const isLandscape = orientation === "landscape";

  const header = (
    <View style={[styles.header, isLandscape && styles.headerLandscape]}>
      <View style={styles.headerTekstBlok}>
        <Text style={[styles.titel, { color: colors.text }]}>
          Schoolvakanties
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Instellingen")}
          activeOpacity={0.7}
        >
          <Text style={[styles.schooljaar, { color: colors.muted }]}>
            {schoolYear.replace("-", " – ")}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.regioBadge, {
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}
        onPress={() => navigation.navigate("Instellingen")}
        activeOpacity={0.75}
      >
        <View style={styles.regioStip} />
        <Text style={styles.regioTekst}>{REGIO_LABEL[regio] ?? "Noord"}</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLandscape) {
    return (
      <SafeAreaView
        style={[styles.container, styles.containerLandscape, {
          backgroundColor: colors.background,
        }]}
      >
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <SideNavBar />
        <View style={styles.landscapeContent}>
          {header}
          <Text style={[styles.sectieLabel, { color: colors.sectionLabel }]}>
            AANKOMENDE VAKANTIES
          </Text>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {loading
              ? (
                <ActivityIndicator
                  style={{ marginTop: 40 }}
                  color={colors.primary}
                />
              )
              : <VacationList region={regio} schoolYear={schoolYear} />}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {header}

      <Text style={[styles.sectieLabel, { color: colors.sectionLabel }]}>
        AANKOMENDE VAKANTIES
      </Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        {loading
          ? (
            <ActivityIndicator
              style={{ marginTop: 40 }}
              color={colors.primary}
            />
          )
          : <VacationList region={regio} schoolYear={schoolYear} />}
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const darkColors = {
  background: "#1c1c1e",
  card: "#2c2c2e",
  primary: "#3D5AFE",
  text: "#ffffff",
  muted: "#8e8e93",
  sectionLabel: "#8e8e93",
  border: "#3a3a3c",
};

const lightColors = {
  background: "#EEF0FA",
  card: "#FFFFFF",
  primary: "#3D5AFE",
  text: "#1A1A2E",
  muted: "#888",
  sectionLabel: "#AAA",
  border: "#D8DAEA",
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLandscape: { flexDirection: "row" },
  landscapeContent: { flex: 1, flexDirection: "column" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLandscape: {
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTekstBlok: { flex: 1 },
  titel: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5 },
  schooljaar: { fontSize: 14, marginTop: 2 },
  regioBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    gap: 6,
  },
  regioStip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E63C3C",
  },
  regioTekst: { fontSize: 13, fontWeight: "600", color: "#E63C3C" },
  sectieLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
});
