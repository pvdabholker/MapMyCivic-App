import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { issues } from "../../data/issues";

const { width } = Dimensions.get("window");

export default function IssueDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const issue = issues.find((i) => i.id === id);

  if (!issue) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.center}>
          <Text>Issue not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Tags */}
        <View style={styles.tagRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{issue.category}</Text>
          </View>

          <View style={styles.statusTag}>
            <Text style={styles.statusText}>{issue.status}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{issue.title}</Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#0F766E" />
            <Text style={styles.infoText}>{issue.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#0F766E" />
            <Text style={styles.infoText}>{issue.time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color="#0F766E" />
            <Text style={styles.infoText}>{issue.department}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="camera-outline" size={18} color="#0F766E" />
            <Text style={styles.infoText}>
              {issue.images} images captured
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.section}>Description</Text>
        <Text style={styles.description}>{issue.description}</Text>

        {/* CCTV Images */}
        <Text style={styles.section}>CCTV Captured Images</Text>

        <View style={styles.imageGrid}>
          {[...Array(issue.images)].map((_, index) => (
            <View key={index} style={styles.imageCard}>
              <Ionicons name="camera-outline" size={26} color="#6B7280" />
              <Text style={styles.imageText}>
                CCTV Frame {index + 1}
              </Text>
            </View>
          ))}
        </View>

        {/* Upload */}
        <Text style={styles.section}>Upload Your Own Images</Text>
        <Text style={styles.uploadSub}>
          Help us by uploading additional photos of this issue
        </Text>

        <View style={styles.uploadBox}>
          <Ionicons
            name="cloud-upload-outline"
            size={24}
            color="#6B7280"
          />
          <Text style={styles.uploadText}>
            Upload additional images
          </Text>
        </View>

        {/* Critical Warning */}
        {issue.status === "Critical" && (
          <View style={styles.warning}>
            <Ionicons
              name="warning-outline"
              size={20}
              color="#DC2626"
            />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.warningTitle}>
                Critical Issue
              </Text>
              <Text style={styles.warningText}>
                This issue has been flagged as critical and requires
                immediate attention from {issue.department}.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: "#fff",
  },

  back: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  backText: {
    marginLeft: 5,
    fontSize: 16,
  },

  tagRow: {
    flexDirection: "row",
    marginVertical: 8,
  },

  categoryTag: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
  },

  categoryText: {
    fontSize: 12,
  },

  statusTag: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusText: {
    color: "white",
    fontSize: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 8,
  },

  infoBox: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 14,
    marginVertical: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  infoText: {
    marginLeft: 6,
    fontSize: 14,
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    color: "#4B5563",
  },

  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  imageCard: {
    width: "48%",
    height: 120,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  imageText: {
    marginTop: 5,
    fontSize: 12,
  },

  uploadSub: {
    color: "#6B7280",
    marginBottom: 10,
  },

  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
  },

  uploadText: {
    marginTop: 6,
    color: "#6B7280",
  },

  warning: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },

  warningTitle: {
    fontWeight: "bold",
    color: "#DC2626",
  },

  warningText: {
    fontSize: 13,
    color: "#7F1D1D",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});