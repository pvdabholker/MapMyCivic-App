import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { useRouter } from "expo-router";

import API from "../../api/client";

import { Alert } from "react-native";

import { saveToken } from "../../api/storage";

import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {

  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {

    try {

      const res = await API.post(
        "/auth/login",
        {
          username,
          password,
        }
      );

      const token =
        res.data.access_token;

      await saveToken(token);

      console.log("TOKEN SAVED");

      router.replace(
        "/onboarding/civicLens"
      );

    } catch (error) {

      console.log(
        error.response?.data ||
          error.message
      );

      Alert.alert(
        "Error",
        "Invalid username or password"
      );

    }

  };

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >

      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >

        <ScrollView
          contentContainerStyle={
            styles.container
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* GLOW EFFECTS */}
          <View style={styles.topGlow} />
          <View style={styles.bottomGlow} />

          {/* CARD */}
          <View style={styles.card}>

            {/* LOGO */}
            <View style={styles.logoWrapper}>

              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
              />

            </View>

            {/* TITLE */}
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue
            </Text>

            {/* USERNAME */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="person-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Username"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
              />

            </View>

            {/* PASSWORD */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />

            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
            >

              <Text style={styles.buttonText}>
                Login
              </Text>

            </TouchableOpacity>

            {/* SIGNUP */}
            <View style={styles.signupRow}>

              <Text style={styles.normalText}>
                Don’t have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/auth/signUp"
                  )
                }
              >

                <Text style={styles.signupText}>
                  {" "}Sign up
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </TouchableWithoutFeedback>

    </KeyboardAvoidingView>

  );

}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,

    backgroundColor: "#eefbf3",

    justifyContent: "center",
    alignItems: "center",

    padding: 24,

    overflow: "hidden",
  },

  /* GLOW EFFECTS */

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

  /* CARD */

  card: {
    width: "100%",

    backgroundColor: "#dff7ea",

    borderRadius: 34,

    padding: 26,

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
  },

  /* LOGO */

  logoWrapper: {

    width: 120,
    height: 120,

    borderRadius: 70,

    backgroundColor: "#eefbf3",

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",

    marginBottom: 20,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  logo: {
    width: 90,
    height: 90,

    resizeMode: "contain",
  },

  /* TEXT */

  title: {
    fontSize: 28,

    fontWeight: "800",

    color: "#14532d",

    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,

    fontSize: 14,

    color: "#15803d",

    textAlign: "center",

    marginBottom: 28,
  },

  /* INPUT */

  inputWrapper: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#f6fffa",

    borderWidth: 1,
    borderColor: "#b7ebcf",

    borderRadius: 18,

    paddingHorizontal: 14,

    marginBottom: 16,
  },

  input: {
    flex: 1,

    paddingVertical: 15,

    paddingLeft: 10,

    color: "#14532d",

    fontSize: 15,
  },

  /* BUTTON */

  button: {
    width: "100%",

    backgroundColor: "#10b981",

    paddingVertical: 16,

    borderRadius: 20,

    alignItems: "center",

    marginTop: 10,

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.14,
    shadowRadius: 8,

    elevation: 5,
  },

  buttonText: {
    color: "#ffffff",

    fontWeight: "700",

    fontSize: 16,
  },

  /* SIGNUP */

  signupRow: {
    flexDirection: "row",

    justifyContent: "center",

    marginTop: 22,
  },

  normalText: {
    color: "#4b5563",

    fontSize: 14,
  },

  signupText: {
    color: "#059669",

    fontWeight: "700",

    fontSize: 14,
  },

});