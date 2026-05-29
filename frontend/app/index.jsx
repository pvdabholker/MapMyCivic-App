import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
} from "react-native";

import { useRouter } from "expo-router";

export default function Index() {

  const router = useRouter();

  const [showText, setShowText] = useState(false);

  const textOpacity =
    useState(new Animated.Value(0))[0];

  useEffect(() => {

    // SHOW TEXT
    setTimeout(() => {

      setShowText(true);

      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

    }, 800);

    // FADE OUT
    setTimeout(() => {

      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();

    }, 2500);

    // NAVIGATE
    setTimeout(() => {

      router.replace("/auth/signIn");

    }, 3500);

  }, []);

  return (

    <View style={styles.container}>

      {/* SOFT BACKGROUND GLOW */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      {/* LOGO */}
      <View style={styles.logoWrapper}>

        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

      </View>

      {/* TEXT */}
      {showText && (

        <Animated.Text
          style={[
            styles.text,
            { opacity: textOpacity },
          ]}
        >

          Empowering Citizens.
          {"\n"}
          Improving Communities.

        </Animated.Text>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor: "#eefbf3",

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",
  },

  /* GLOW EFFECTS */

  topGlow: {
    position: "absolute",

    top: -120,
    left: -80,

    width: 260,
    height: 260,

    borderRadius: 140,

    backgroundColor: "rgba(16,185,129,0.10)",
  },

  bottomGlow: {
    position: "absolute",

    bottom: -140,
    right: -100,

    width: 300,
    height: 300,

    borderRadius: 160,

    backgroundColor: "rgba(52,211,153,0.12)",
  },

  /* LOGO */

  logoWrapper: {

    width: 210,
    height: 210,

    borderRadius: 120,

    backgroundColor: "#dff7ea",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.10,
    shadowRadius: 14,

    elevation: 8,
  },

  logo: {
    width: 150,
    height: 150,

    resizeMode: "contain",
  },

  /* TEXT */

  text: {
    marginTop: 34,

    fontSize: 18,

    textAlign: "center",

    color: "#166534",

    fontWeight: "600",

    lineHeight: 28,
  },

});