import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppProvider } from "./Appcontext.tsx";
import Overzicht from "./pages/Overzicht.tsx";
import Settings from "./pages/Settings.tsx";
import CountdownScreen from "./pages/Countdown.tsx";
import AboutScreen from "./pages/About.tsx";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{}}>
          <Stack.Screen name="Overzicht" component={Overzicht} />
          <Stack.Screen name="Instellingen" component={Settings} />
          <Stack.Screen name="Countdown" component={CountdownScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
