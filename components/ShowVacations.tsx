import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import * as Device from "expo-device";
import * as Location from "expo-location";
// import MapView, { Marker, Region } from "react-native-maps";
import Vacation from "./GetVacations.tsx";

const PROVINCE_TO_REGION: Record<string, string> = {
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

async function getSchoolRegion(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { "User-Agent": "VacationApp/1.0" } },
    );
    const data = await response.json();
    const province = data.address?.state;
    return PROVINCE_TO_REGION[province] ?? null;
  } catch {
    return null;
  }
}
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function ShowVacation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [schoolRegion, setSchoolRegion] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg(
          "Oops, this will not work on Snack in an Android Emulator. Try it on your device!",
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const detected = await getSchoolRegion(
        location.coords.latitude,
        location.coords.longitude,
      );
      if (detected) {
        setSchoolRegion(detected);
      } else {
        setSchoolRegion("midden");
      }
    }
    getCurrentLocation();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `${location.coords}`;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.text}>Regio {schoolRegion}</Text>
        {schoolRegion
          ? <Vacation region={schoolRegion} />
          : <Text>Locatie bepalen...</Text>}
      </View>
      <View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paragraph: { fontSize: 18, textAlign: "center" },
  map: { width: "80%", height: "50%" },
  text: {
    alignItems: "center",
    alignSelf: "center",
    paddingTop: 30,
    fontSize: 20,
    fontWeight: "bold",
  },
});
