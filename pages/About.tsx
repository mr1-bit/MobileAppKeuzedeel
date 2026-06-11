import React from "react";
import {
  Image,
  Linking,
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

const APP_VERSION = "1.0.0";
const SCHOOL_NAME = "Deltion College";
const STUDENT_NAME = "Björn Bakker";
const STUDENT_ROLE = `Student · ${SCHOOL_NAME}`;
const AVATAR_IMAGE = require("../assets/images/avatar.jpg");
const APP_DESCRIPTION =
  "Deltion Holiday App toont Nederlandse schoolvakanties op basis van jouw regio. We maken gebruik van data van Rijksoverheid.";

export default function AboutScreen() {
  const { darkMode, schoolYear: contextSchoolYear } = useAppContext();
  const schoolYear = contextSchoolYear;
  const colors = darkMode ? darkColors : lightColors;
  const SOURCE_URL =
    `https://www.rijksoverheid.nl/themas/onderwijs/schoolvakanties/overzicht-schoolvakanties-per-schooljaar/overzicht-schoolvakanties-${schoolYear}`;

  const displayYear = schoolYear ? schoolYear.replace("-", "–") : "2025–2026";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>
              About
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.muted }]}>
              Over de app &amp; ontwikkelaar
            </Text>
          </View>
          <View
            style={[styles.regionBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.regionBadgeText}>📍 Noord</Text>
          </View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          {/* Avatar */}
          <View
            style={[styles.avatarRing, { borderColor: colors.primary + "40" }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.avatarBg }]}>
              <Image
                source={AVATAR_IMAGE}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>
            {STUDENT_NAME}
          </Text>
          <Text style={[styles.profileRole, { color: colors.muted }]}>
            {STUDENT_ROLE}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Over de app
          </Text>
          <Text style={[styles.sectionBody, { color: colors.muted }]}>
            {APP_DESCRIPTION}
          </Text>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCell,
                styles.statCellLeft,
                { borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Versie
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {APP_VERSION}
              </Text>
            </View>
            <View style={styles.statCell}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Schooljaar
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {displayYear}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Databron
          </Text>
          <TouchableOpacity
            style={styles.linkRow}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`${SOURCE_URL}`)}
          >
            <Text style={styles.linkIcon}>🏛️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.linkLabel, { color: colors.text }]}>
                Rijksoverheid data bron
              </Text>
              <Text style={[styles.linkSub, { color: colors.muted }]}>
                https://www.rijksoverheid.nl/themas/onderwijs/schoolvakanties/~
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            School
          </Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkIcon}>🏫</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.linkLabel, { color: colors.text }]}>
                {SCHOOL_NAME}
              </Text>
              <Text style={[styles.linkSub, { color: colors.muted }]}>
                Zwolle
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.faint }]}>
          Deltion vakantie app · v{APP_VERSION}
        </Text>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const lightColors = {
  background: "#EEF0FA",
  card: "#FFFFFF",
  primary: "#3D5AFE",
  text: "#1A1A2E",
  muted: "#7A8099",
  border: "#E8EBF5",
  avatarBg: "#E8EEFF",
  faint: "#B0B5CC",
};

const darkColors = {
  background: "#1c1c1e",
  card: "#2c2c2e",
  primary: "#3D5AFE",
  text: "#ffffff",
  muted: "#8e8e93",
  border: "#3a3a3c",
  avatarBg: "#1e2a50",
  faint: "#48484a",
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  regionBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  regionBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  profileCard: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  // Ring sits outside — just the border, no overflow hidden needed
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  // Avatar is the colored circle behind the image
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarIcon: { fontSize: 48 },

  // Image is explicitly sized smaller than the avatar container
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  profileRole: {
    fontSize: 13,
    marginTop: 1,
  },

  section: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "transparent",
    gap: 3,
  },
  statCellLeft: {
    borderRightWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 2,
  },
  linkIcon: { fontSize: 22 },
  linkLabel: { fontSize: 14, fontWeight: "600" },
  linkSub: { fontSize: 12, marginTop: 1 },
  chevron: { fontSize: 22, fontWeight: "400" },

  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
