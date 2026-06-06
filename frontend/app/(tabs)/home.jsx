import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import ProfileHeader from "../components/profileHeader";
import API from "../../api/client";

import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const issueCategories = [
  "All",
  "Road Damage",
  "Waste Management",
  "Street Lighting",
  "Water Supply",
];

export default function HomeScreen() {

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef(null);

  /* ================= FETCH ================= */

  const fetchReports = async () => {

    try {

      const res = await API.get("/report/");

      setIssues(res.data);

      // FIT ALL ISSUE LOCATIONS
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

      }, 700);

    } catch (error) {

      console.log("Error fetching reports:", error);

    } finally {

      setLoading(false);

    }

  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
    }, [])
  );

  /* ================= FILTER ================= */

  const categoryMap = {
    "Road Damage": "pothole",
    "Waste Management": "garbage",
    "Street Lighting": "light",
    "Water Supply": "water",
  };

  const filteredIssues = issues.filter((item) => {

    const mappedCategory = categoryMap[activeCategory];

    const matchCategory =
      activeCategory === "All" ||
      (
        mappedCategory &&
        item.issue_type?.toLowerCase().includes(mappedCategory)
      );

    const matchSearch =
      item.description?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      item.address?.toLowerCase().includes(
        searchQuery.toLowerCase()
      );

    return matchCategory && matchSearch;

  });

  /* ================= STATS ================= */

  const stats = {
    total: issues.length,

    resolved: issues.filter(
      (i) => i.status === "resolved"
    ).length,

    inProgress: issues.filter(
      (i) => i.status === "in_progress"
    ).length,

    pending: issues.filter(
      (i) => i.status === "pending"
    ).length,
  };

  /* ================= STATUS COLOR ================= */

  const getStatusColor = (status) => {

    if (status === "pending") {
      return "#ef4444";
    }

    if (status === "in_progress") {
      return "#f59e0b";
    }

    if (status === "resolved") {
      return "#22c55e";
    }

    return "#64748b";

  };

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

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <View style={styles.loaderContainer}>

        <Text style={styles.loaderText}>
          Loading Dashboard...
        </Text>

      </View>

    );

  }

  return (

    <SafeAreaView style={{ flex: 1 }}>

      <ScrollView
  style={styles.container}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingBottom: 110,
  }}
>

        {/* HEADER */}
        <ProfileHeader />

        {/* HERO */}
        <View style={styles.hero}>

          <View style={styles.heroGlow1} />

          <View style={styles.heroGlow2} />

          <Text style={styles.heroTitle}>
            Civic Issues Dashboard
          </Text>

          <Text style={styles.heroSub}>
            Real-time monitoring of civic issues
          </Text>

        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>

          <StatsCard
            title="Total"
            value={stats.total}
          />

          <StatsCard
            title="Resolved"
            value={stats.resolved}
          />

          <StatsCard
            title="Progress"
            value={stats.inProgress}
          />

          <StatsCard
            title="Pending"
            value={stats.pending}
          />

        </View>

        {/* MAP */}
        <Text style={styles.sectionTitle}>
          Issue Locations
        </Text>

        <View style={styles.mapContainer}>

          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
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

        {/* SEARCH */}
        <Text style={styles.sectionTitle}>
          Recent Issues
        </Text>

        <View style={styles.searchContainer}>

          <Ionicons
            name="search"
            size={18}
            color="#94a3b8"
          />

          <TextInput
            placeholder="Search issues..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>

        {/* CATEGORY */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 14 }}
        >

          {issueCategories.map((cat) => (

            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.chip,

                activeCategory === cat &&
                  styles.activeChip,
              ]}
            >

              <Text
                style={[
                  styles.chipText,

                  activeCategory === cat &&
                    styles.activeChipText,
                ]}
              >
                {cat}
              </Text>

            </TouchableOpacity>

          ))}

        </ScrollView>

        {/* REPORTS */}
        {filteredIssues.length === 0 ? (

          <Text style={styles.emptyText}>
            No issues found
          </Text>

        ) : (

          filteredIssues.map((item) => (

            <View
              key={item.id}
              style={styles.reportCard}
            >

              {/* TOP TAGS */}
              <View style={styles.topRow}>

                <View style={styles.categoryTag}>

                  <Text style={styles.categoryText}>
                    {item.issue_type}
                  </Text>

                </View>

                <View
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor:
                        getStatusColor(item.status),
                    },
                  ]}
                >

                  <Text style={styles.statusText}>
                    {item.status}
                  </Text>

                </View>

              </View>

              {/* ROW */}
              <View style={styles.reportRow}>

                {/* IMAGE */}
                <View style={styles.imageContainer}>

                  {item.image_url?.match(
                    /\.(mp4|mov|avi)$/i
                  ) ? (

                    <View
                      style={[
                        styles.reportImage,
                        styles.videoPlaceholder,
                      ]}
                    >

                      <Ionicons
                        name="videocam"
                        size={24}
                        color="white"
                      />

                    </View>

                  ) : (

                    <Image
                      source={{
                        uri: item.image_url,
                      }}
                      style={styles.reportImage}
                    />

                  )}

                </View>

                {/* DETAILS */}
                <View style={styles.reportDetails}>

                  <Text style={styles.reportTitle}>
                    {item.issue_type}
                  </Text>

                  <Text
                    style={styles.reportDesc}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>

                  <Text style={styles.reportMeta}>
                    📍 {item.address}
                  </Text>

                  <Text style={styles.reportMeta}>
                    ⏱{" "}
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </Text>

                </View>

              </View>

              {/* AUTHORITY */}
              <Text style={styles.reportAuthority}>
                🏛 {item.department || "Unknown Authority"}
              </Text>

            </View>

          ))

        )}

      </ScrollView>

    </SafeAreaView>

  );
}

/* ================= STATS CARD ================= */

const StatsCard = ({ title, value }) => (

  <View style={styles.statCard}>

    <Text style={styles.statValue}>
      {value}
    </Text>

    <Text style={styles.statTitle}>
      {title}
    </Text>

  </View>

);

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#eefbf3",
    paddingHorizontal: width * 0.04,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eefbf3",
  },

  loaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },

  /* HERO */

  hero: {
    backgroundColor: "#10b981",
    padding: width * 0.06,
    borderRadius: 30,
    marginVertical: 14,
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

  /* STATS */

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",

    backgroundColor: "#dff7ea",

    borderRadius: 24,

    paddingVertical: 18,
    paddingHorizontal: 18,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 3,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#047857",
  },

  statTitle: {
    marginTop: 4,
    color: "#166534",
    fontSize: 13,
    fontWeight: "500",
  },

  /* SECTION */

  sectionTitle: {
    fontSize: width * 0.048,
    fontWeight: "700",
    color: "#14532d",
    marginTop: 8,
    marginBottom: 10,
  },

  /* MAP */

  mapContainer: {
    height: width * 0.6,

    borderRadius: 30,

    overflow: "hidden",

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 4,
  },

  /* SEARCH */

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#dff7ea",

    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 20,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#14532d",
  },

  /* CHIP */

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,

    borderRadius: 20,

    backgroundColor: "#dff7ea",

    marginRight: 10,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  activeChip: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },

  chipText: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 13,
  },

  activeChipText: {
    color: "#ffffff",
  },

  /* REPORT CARD */

  reportCard: {
    backgroundColor: "#dff7ea",

    borderRadius: 30,

    padding: 14,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryTag: {
    backgroundColor: "#10b981",

    paddingHorizontal: 12,
    paddingVertical: 5,

    borderRadius: 14,

    marginRight: 8,
  },

  categoryText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,

    borderRadius: 14,
  },

  statusText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  reportRow: {
    flexDirection: "row",
  },

  imageContainer: {
    width: "28%",
    marginRight: 12,
  },

  reportImage: {
    width: "100%",
    height: 92,

    borderRadius: 18,

    backgroundColor: "#b7ebcf",
  },

  videoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
  },

  reportDetails: {
    flex: 1,
    justifyContent: "center",
  },

  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14532d",
    marginBottom: 4,
  },

  reportDesc: {
    fontSize: 12,
    color: "#166534",
    marginBottom: 6,
    lineHeight: 18,
  },

  reportMeta: {
    fontSize: 11,
    color: "#15803d",
    marginBottom: 2,
  },

  reportAuthority: {
    marginTop: 10,
    color: "#047857",
    fontWeight: "700",
    fontSize: 12,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#166534",
    fontSize: 14,
  },

});