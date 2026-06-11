import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppProvider, useAppContext } from "./Appcontext.tsx";
import Overzicht from "./pages/Overzicht.tsx";
import Settings from "./pages/Settings.tsx";
import CountdownScreen from "./pages/Countdown.tsx";
import AboutScreen from "./pages/About.tsx";

const Stack = createStackNavigator();

function AppNavigator() {
  const { darkMode } = useAppContext();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: darkMode ? "#1c1c1e" : "#EEF0FA",
        },
        headerTintColor: darkMode ? "#ffffff" : "#1A1A2E",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
        },
      }}
    >
      <Stack.Screen name="Overzicht" component={Overzicht} />
      <Stack.Screen name="Instellingen" component={Settings} />
      <Stack.Screen name="Countdown" component={CountdownScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
