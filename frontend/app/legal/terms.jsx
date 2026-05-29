import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function Terms() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms & Conditions</Text>

      <Text style={styles.text}>
        Welcome to MapMyCivic. By using this application, you agree to
        comply with and be bound by the following terms.
      </Text>

      <Text style={styles.subtitle}>1. Usage</Text>
      <Text style={styles.text}>
        Users can report civic issues responsibly. Misuse may result in
        account suspension.
      </Text>

      <Text style={styles.subtitle}>2. Data</Text>
      <Text style={styles.text}>
        We collect location and user data only to improve services.
      </Text>

      <Text style={styles.subtitle}>3. Responsibility</Text>
      <Text style={styles.text}>
        Users are responsible for the accuracy of reported information.
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