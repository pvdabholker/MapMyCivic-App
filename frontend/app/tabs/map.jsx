import React, { useState, useRef } from "react";

import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import MapView, { Marker } from "react-native-maps";

import API from "../../api/client";

import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {

  const [issues, setIssues] = useState([]);

  const mapRef = useRef(null);

  /* ================= FETCH REPORTS ================= */

  const fetchReports = async () => {

    try {

      const res = await API.get("/report/");

      setIssues(res.data);

      // FIT MAP TO ALL MARKERS
      setTimeout(() => {

        if (mapRef.current && res.data.length > 0) {

          const coords = res.data
            .filter(i => i.latitude && i.longitude)
            .map(i => ({
              latitude: parseFloat(i.latitude),
              longitude: parseFloat(i.longitude),
            }));

          if (coords.length > 0) {

            mapRef.current.fitToCoordinates(coords, {
              edgePadding: {
                top: 60,
                right: 60,
                bottom: 60,
                left: 60,
              },
              animated: true,
            });

          }

        }

      }, 1000);

    } catch (error) {

      console.log("Error fetching reports:", error);

    }

  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
    }, [])
  );

  /* ================= MARKER COLOR ================= */

  const getMarkerColor = (severity) => {

    if (severity === "critical") {
      return "#dc2626";
    }

    if (severity === "medium") {
      return "#f59e0b";
    }

    if (severity === "low") {
      return "#22c55e";
    }

    return "#10b981";

  };

  return (

    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        {/* HERO */}
        <View style={styles.hero}>

          <View style={styles.heroGlow1} />

          <View style={styles.heroGlow2} />

          <Text style={styles.heroTitle}>
            Map View
          </Text>

          <Text style={styles.heroSub}>
            View all reported issues across the city
          </Text>

        </View>

        {/* MAP */}
        <View style={styles.mapWrapper}>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 15.4909,
              longitude: 73.8278,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
          >

            {issues.map((item) =>
              item.latitude && item.longitude ? (

                <Marker
                  key={item.id}
                  coordinate={{
                    latitude: parseFloat(item.latitude),
                    longitude: parseFloat(item.longitude),
                  }}

                  title={item.issue_type}
                  description={item.address}

                  pinColor={getMarkerColor(item.severity)}
                />

              ) : null
            )}

          </MapView>

        </View>

        {/* LEGEND */}
        <View style={styles.legendContainer}>

          <Legend
            color="#22c55e"
            label="Low"
          />

          <Legend
            color="#f59e0b"
            label="Medium"
          />

          <Legend
            color="#dc2626"
            label="Critical"
          />

        </View>

      </ScrollView>

    </SafeAreaView>

  );
}

/* ================= LEGEND ================= */

const Legend = ({ color, label }) => {

  return (

    <View style={styles.legendItem}>

      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
        ]}
      />

      <Text style={styles.legendText}>
        {label}
      </Text>

    </View>

  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#eefbf3",
    paddingHorizontal: width * 0.045,
    paddingTop: height * 0.025,
  },

  /* HERO */

  hero: {
    backgroundColor: "#10b981",

    padding: width * 0.06,

    borderRadius: 30,

    marginBottom: 18,

    overflow: "hidden",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.16,
    shadowRadius: 12,

    elevation: 8,
  },

  heroGlow1: {
    position: "absolute",

    top: -30,
    right: -30,

    width: 140,
    height: 140,

    backgroundColor: "rgba(255,255,255,0.14)",

    borderRadius: 100,
  },

  heroGlow2: {
    position: "absolute",

    bottom: -40,
    left: -20,

    width: 120,
    height: 120,

    backgroundColor: "rgba(255,255,255,0.08)",

    borderRadius: 100,
  },

  heroTitle: {
    color: "#ffffff",

    fontSize: width * 0.06,

    fontWeight: "800",
  },

  heroSub: {
    color: "#d1fae5",

    fontSize: width * 0.035,

    marginTop: 6,
  },

  /* MAP */

  mapWrapper: {
    height: height * 0.58,

    borderRadius: 30,

    overflow: "hidden",

    backgroundColor: "#dff7ea",

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 5,
  },

  map: {
    flex: 1,
  },

  /* LEGEND */

  legendContainer: {
    flexDirection: "row",

    justifyContent: "center",

    marginTop: 18,

    backgroundColor: "#dff7ea",

    paddingVertical: 14,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 14,
  },

  legendDot: {
    width: 13,
    height: 13,

    borderRadius: 20,

    marginRight: 8,
  },

  legendText: {
    fontSize: width * 0.035,

    color: "#166534",

    fontWeight: "600",
  },

});