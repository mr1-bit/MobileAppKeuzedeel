import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppContext } from "../Appcontext.tsx";
import { Settings } from "lucide-react-native";
import { Calendar } from "lucide-react-native";
import { Clock } from "lucide-react-native";
import { Info } from "lucide-react-native";

const NAV_ITEMS = [
  {
    id: "overzicht",
    label: "Overzicht",
    icon: <Calendar />,
    screen: "Overzicht",
  },
  { id: "countdown", label: "Countdown", icon: <Clock />, screen: "Countdown" },
  {
    id: "instellingen",
    label: "Instellingen",
    icon: <Settings />,
    screen: "Instellingen",
  },
  { id: "about", label: "About", icon: <Info />, screen: "About" },
];

export default function BottomNavBar() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { darkMode } = useAppContext();
  const colors = darkMode ? darkColors : lightColors;

  return (
    <View
      style={[styles.navbar, {
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        paddingBottom: 40,
      }]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = route.name === item.screen;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => !isActive && navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text
              style={[styles.label, {
                color: isActive ? colors.primary : colors.muted,
              }]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const darkColors = {
  background: "#1c1c1e",
  primary: "#3D5AFE",
  muted: "#8e8e93",
  border: "#3a3a3c",
};
const lightColors = {
  background: "#EEF0FA",
  primary: "#3D5AFE",
  muted: "#888",
  border: "#D8DAEA",
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 0.5,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  navItem: { alignItems: "center", gap: 3 },
  icon: { fontSize: 22 },
  label: { fontSize: 10, fontWeight: "600" },
});
