import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileHeader() {

  const router = useRouter();
  const [address, setAddress] = useState("Loading...");

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (user) {
        const parsedUser = JSON.parse(user);

        // ✅ assuming user has address field
        setAddress(parsedUser.address || "No address");
      } else {
        setAddress("No user");
      }

    } catch (err) {
      console.log(err);
      setAddress("Error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.location}>{address}</Text>

      <TouchableOpacity onPress={() => router.push("/profile")}>
        <Ionicons name="person-circle" size={35} color="#1e90ff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: 20,
    fontWeight: "bold",
  },
});