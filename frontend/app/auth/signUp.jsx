import React, { useState } from "react";

import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { useRouter } from "expo-router";

import * as Location from "expo-location";

import API from "../../api/client";

import { Alert } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {

  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    emailOrPhone: "",
    city: "",
    area: "",
    pincode: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key, value) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  /* ================= LOCATION ================= */

  const getLocation = async () => {

    try {

      let { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        alert("Permission denied");

        return;
      }

      let location =
        await Location.getCurrentPositionAsync({});

      const {
        latitude,
        longitude,
      } = location.coords;

      let address =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (address.length > 0) {

        const place = address[0];

        setForm({
          ...form,

          city:
            place.city || "",

          area:
            place.subregion ||
            place.district ||
            "",

          pincode:
            place.postalCode || "",
        });

      }

    } catch (error) {

      console.log(error);

      alert("Error getting location");

    }

  };

  /* ================= SIGNUP ================= */

  const handleSignup = async () => {

    try {

      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.username.trim() ||
        !form.emailOrPhone.trim() ||
        !form.city.trim() ||
        !form.area.trim() ||
        !form.pincode.trim() ||
        !form.password.trim() ||
        !form.confirmPassword.trim()
      ) {

        Alert.alert(
          "Error",
          "All fields are required"
        );

        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {

        Alert.alert(
          "Error",
          "Passwords do not match"
        );

        return;
      }

      const response =
        // 1. Signup
await API.post("/auth/signup", {
  first_name: form.firstName.trim(),
  last_name: form.lastName.trim(),
  username: form.username.trim(),
  email_or_phone: form.emailOrPhone.trim(),
  city: form.city.trim(),
  area: form.area.trim(),
  pincode: form.pincode.trim(),
  password: form.password,
});

// 2. Login immediately
const loginRes = await API.post("/auth/login", {
  username: form.username.trim(),
  password: form.password,
});

// 3. Save token
await saveToken(loginRes.data.access_token);

// 4. Go to app
router.replace("/onboarding/civicLens");

    } catch (error) {

      console.log(
        "SIGNUP ERROR:",
        error.response?.data ||
          error.message
      );

      Alert.alert(
        "Signup Failed",
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Something went wrong"
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

          {/* GLOW */}
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
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join CivicLens today
            </Text>

            {/* FIRST NAME */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="person-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="First Name"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={form.firstName}
                onChangeText={(text) =>
                  handleChange(
                    "firstName",
                    text
                  )
                }
              />

            </View>

            {/* LAST NAME */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="person-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={form.lastName}
                onChangeText={(text) =>
                  handleChange(
                    "lastName",
                    text
                  )
                }
              />

            </View>

            {/* USERNAME */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="at-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Username"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={form.username}
                onChangeText={(text) =>
                  handleChange(
                    "username",
                    text
                  )
                }
              />

            </View>

            {/* EMAIL */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="mail-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Email or Phone"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={form.emailOrPhone}
                onChangeText={(text) =>
                  handleChange(
                    "emailOrPhone",
                    text
                  )
                }
              />

            </View>

            {/* CITY */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="business-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="City"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={form.city}
                onChangeText={(text) =>
                  handleChange(
                    "city",
                    text
                  )
                }
              />

            </View>

            {/* AREA */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="location-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Area / Locality"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={form.area}
                onChangeText={(text) =>
                  handleChange(
                    "area",
                    text
                  )
                }
              />

            </View>

            {/* PINCODE */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="pin-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Pincode"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                style={styles.input}
                value={form.pincode}
                onChangeText={(text) =>
                  handleChange(
                    "pincode",
                    text
                  )
                }
              />

            </View>

            {/* LOCATION BUTTON */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={getLocation}
            >

              <Ionicons
                name="navigate"
                size={18}
                color="#ffffff"
              />

              <Text style={styles.secondaryText}>
                Use Current Location
              </Text>

            </TouchableOpacity>

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
                value={form.password}
                onChangeText={(text) =>
                  handleChange(
                    "password",
                    text
                  )
                }
              />

            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputWrapper}>

              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#15803d"
              />

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(text) =>
                  handleChange(
                    "confirmPassword",
                    text
                  )
                }
              />

            </View>

            {/* TERMS */}
            <Text style={styles.termsText}>

              By continuing, you agree to our{" "}

              <Text
                style={styles.link}
                onPress={() =>
                  router.push(
                    "/legal/terms"
                  )
                }
              >
                Terms
              </Text>

              {" "}and{" "}

              <Text
                style={styles.link}
                onPress={() =>
                  router.push(
                    "/legal/privacy"
                  )
                }
              >
                Privacy Policy
              </Text>

            </Text>

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
            >

              <Text style={styles.buttonText}>
                Create Account
              </Text>

            </TouchableOpacity>

            {/* SIGNIN */}
            <View style={styles.signinRow}>

              <Text style={styles.normalText}>
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/auth/signIn"
                  )
                }
              >

                <Text style={styles.signinText}>
                  {" "}Sign in
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

  logoWrapper: {
    width: 110,
    height: 110,

    borderRadius: 60,

    backgroundColor: "#eefbf3",

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",

    marginBottom: 20,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  logo: {
    width: 82,
    height: 82,

    resizeMode: "contain",
  },

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

  inputWrapper: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#f6fffa",

    borderWidth: 1,
    borderColor: "#b7ebcf",

    borderRadius: 18,

    paddingHorizontal: 14,

    marginBottom: 14,
  },

  input: {
    flex: 1,

    paddingVertical: 15,

    paddingLeft: 10,

    color: "#14532d",

    fontSize: 15,
  },

  secondaryButton: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#10b981",

    paddingVertical: 14,

    borderRadius: 18,

    marginBottom: 16,
  },

  secondaryText: {
    color: "#ffffff",

    marginLeft: 8,

    fontWeight: "700",
  },

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

  signinRow: {
    flexDirection: "row",

    justifyContent: "center",

    marginTop: 22,
  },

  normalText: {
    color: "#4b5563",

    fontSize: 14,
  },

  signinText: {
    color: "#059669",

    fontWeight: "700",

    fontSize: 14,
  },

  link: {
    color: "#059669",

    fontWeight: "700",
  },

  termsText: {
    fontSize: 12,

    color: "#4b5563",

    textAlign: "center",

    marginVertical: 16,

    lineHeight: 20,
  },

});