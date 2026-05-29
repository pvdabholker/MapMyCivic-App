import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

export default function CivicAlerts() {

  const router = useRouter();

  return (

    <SafeAreaView style={styles.container}>

      {/* GLOW EFFECTS */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <View style={styles.content}>

        {/* IMAGE */}
        <View style={styles.imageWrapper}>

          <Image
            source={require("../../assets/images/civicAlerts.png")}
            style={styles.image}
          />

        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          Stay informed with civic notices
        </Text>

        {/* DESCRIPTION */}
        <Text style={styles.desc}>
          Stay informed with important civic notices and government announcements.
        </Text>

        {/* DOTS */}
        <View style={styles.dotsContainer}>

          <View style={styles.dot} />

          <View style={styles.dot} />

          <View
            style={[
              styles.dot,
              styles.activeDot,
            ]}
          />

        </View>

      </View>

      {/* BUTTON */}
      <View style={styles.bottomRow}>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={() =>
            router.replace("/(tabs)/home")
          }
        >

          <Text style={styles.finishText}>
            Finish
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor: "#eefbf3",

    paddingHorizontal: 24,
    paddingVertical: 40,

    justifyContent: "space-between",

    overflow: "hidden",
  },

  /* GLOW */

  topGlow: {
    position: "absolute",

    top: -120,
    left: -80,

    width: 240,
    height: 240,

    borderRadius: 140,

    backgroundColor:
      "rgba(16,185,129,0.10)",
  },

  bottomGlow: {
    position: "absolute",

    bottom: -120,
    right: -80,

    width: 260,
    height: 260,

    borderRadius: 160,

    backgroundColor:
      "rgba(52,211,153,0.10)",
  },

  /* CONTENT */

  content: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  /* IMAGE */

  imageWrapper: {

    width: "100%",

    height: 300,

    backgroundColor: "#dff7ea",

    borderRadius: 34,

    justifyContent: "center",
    alignItems: "center",

    padding: 20,

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 6,

    marginBottom: 34,
  },

  image: {
    width: "100%",
    height: "100%",

    resizeMode: "contain",
  },

  /* TEXT */

  title: {
    fontSize: 30,

    fontWeight: "800",

    textAlign: "center",

    color: "#14532d",

    lineHeight: 40,

    marginBottom: 16,
  },

  desc: {
    fontSize: 16,

    textAlign: "center",

    color: "#15803d",

    lineHeight: 26,

    paddingHorizontal: 10,
  },

  /* DOTS */

  dotsContainer: {
    flexDirection: "row",

    marginTop: 34,
  },

  dot: {
    width: 9,
    height: 9,

    borderRadius: 10,

    backgroundColor: "#b7ebcf",

    marginHorizontal: 5,
  },

  activeDot: {
    width: 24,

    backgroundColor: "#10b981",
  },

  /* BUTTON */

  bottomRow: {
    alignItems: "center",

    marginTop: 20,
  },

  finishButton: {

    width: "100%",

    backgroundColor: "#10b981",

    paddingVertical: 17,

    borderRadius: 22,

    alignItems: "center",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.14,
    shadowRadius: 8,

    elevation: 5,
  },

  finishText: {
    fontSize: 16,

    color: "#ffffff",

    fontWeight: "700",
  },

});