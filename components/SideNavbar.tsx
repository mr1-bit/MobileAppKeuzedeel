import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    icon: (color: string) => <Calendar color={color} size={22} />,
    screen: "Overzicht",
  },
  {
    id: "countdown",
    label: "Countdown",
    icon: (color: string) => <Clock color={color} size={22} />,
    screen: "Countdown",
  },
  {
    id: "instellingen",
    label: "Instellingen",
    icon: (color: string) => <Settings color={color} size={22} />,
    screen: "Instellingen",
  },
  {
    id: "about",
    label: "About",
    icon: (color: string) => <Info color={color} size={22} />,
    screen: "About",
  },
];

export default function SideNavBar() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { darkMode } = useAppContext();
  const colors = darkMode ? darkColors : lightColors;

  return (
    <View
      style={[styles.navbar, {
        backgroundColor: colors.background,
        borderRightColor: colors.border,
      }]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = route.name === item.screen;
        const iconColor = isActive ? colors.primary : colors.muted;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              isActive && { backgroundColor: colors.activeBackground },
            ]}
            onPress={() => !isActive && navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            {item.icon(iconColor)}
            <Text style={[styles.label, { color: iconColor }]}>
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
  primary: "#FFFFFF",
  muted: "#8e8e93",
  border: "#3a3a3c",
  activeBackground: "rgba(61,90,254,0.12)",
};
const lightColors = {
  background: "#EEF0FA",
  primary: "#3D5AFE",
  muted: "#888",
  border: "#D8DAEA",
  activeBackground: "rgba(61,90,254,0.10)",
};

const styles = StyleSheet.create({
  navbar: {
    width: 88,
    borderRightWidth: 0.5,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 4,
  },
  navItem: {
    alignItems: "center",
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  label: { fontSize: 10, fontWeight: "600", textAlign: "center" },
});
