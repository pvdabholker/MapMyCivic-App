import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function Privacy() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.text}>
        Your privacy is important to us. This policy explains how we
        handle your data.
      </Text>

      <Text style={styles.subtitle}>1. Data Collection</Text>
      <Text style={styles.text}>
        We collect basic user info and location for civic reporting.
      </Text>

      <Text style={styles.subtitle}>2. Security</Text>
      <Text style={styles.text}>
        Your data is stored securely and not shared without consent.
      </Text>

      <Text style={styles.subtitle}>3. Usage</Text>
      <Text style={styles.text}>
        Data is used only to improve civic services.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  text: { fontSize: 14, color: "#555", marginTop: 5 },
});