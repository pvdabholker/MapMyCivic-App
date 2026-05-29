import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import API from "../../api/client";

import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function NoticesScreen() {

  const [notices, setNotices] = React.useState([]);

  /* ================= FETCH ================= */

  useFocusEffect(
    React.useCallback(() => {
      fetchNotices();
    }, [])
  );

  const fetchNotices = async () => {

    try {

      const response =
        await API.get("/notices");

      const formattedData =
        response.data.map((item) => ({

          id: item.id,

          title: item.title,

          department: item.department,

          description: item.description,

          date: new Date(
            item.created_at
          ).toDateString(),

          priority: item.priority,

          borderColor:
            item.priority === "critical"
              ? "#ef4444"
              : item.priority === "important"
              ? "#f59e0b"
              : "#10b981",

          bgColor:
            item.priority === "critical"
              ? "#fee2e2"
              : item.priority === "important"
              ? "#fef3c7"
              : "#dff7ea",

        }));

      setNotices(formattedData);

    } catch (error) {

      console.log(
        "Error fetching notices:",
        error
      );

    }

  };

  return (

    <SafeAreaView
      style={{ flex: 1 }}
      edges={["top"]}
    >

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >

        {/* HERO */}
        <View style={styles.hero}>

          <View style={styles.heroGlow1} />

          <View style={styles.heroGlow2} />

          <Text style={styles.heroTitle}>
            Public Notices
          </Text>

          <Text style={styles.heroSub}>
            Government announcements and public notifications
          </Text>

        </View>

        {/* EMPTY */}
        {notices.length === 0 ? (

          <View style={styles.emptyContainer}>

            <View style={styles.emptyIconBox}>

              <Ionicons
                name="notifications-off-outline"
                size={44}
                color="#10b981"
              />

            </View>

            <Text style={styles.emptyTitle}>
              No Notices Yet
            </Text>

            <Text style={styles.emptyText}>
              Government announcements will appear here
            </Text>

          </View>

        ) : (

          notices.map((notice) => (

            <View
              key={notice.id}
              style={[
                styles.noticeCard,
                {
                  borderColor:
                    notice.borderColor,

                  backgroundColor:
                    notice.bgColor,
                },
              ]}
            >

              <View style={styles.rowTop}>

                {/* ICON */}
                <View style={styles.iconBox}>

                  <Ionicons
                    name="megaphone-outline"
                    size={22}
                    color="#047857"
                  />

                </View>

                {/* CONTENT */}
                <View style={styles.content}>

                  {/* TITLE */}
                  <Text style={styles.noticeTitle}>
                    {notice.title}
                  </Text>

                  {/* META */}
                  <View style={styles.metaRow}>

                    <View style={styles.metaItem}>

                      <Ionicons
                        name="business-outline"
                        size={14}
                        color="#15803d"
                      />

                      <Text style={styles.metaText}>
                        {notice.department}
                      </Text>

                    </View>

                    <View style={styles.metaItem}>

                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#15803d"
                      />

                      <Text style={styles.metaText}>
                        {notice.date}
                      </Text>

                    </View>

                  </View>

                  {/* DESCRIPTION */}
                  <Text style={styles.description}>
                    {notice.description}
                  </Text>

                </View>

              </View>

            </View>

          ))

        )}

      </ScrollView>

    </SafeAreaView>

  );

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,

    paddingHorizontal: width * 0.05,

    paddingTop: width * 0.04,

    backgroundColor: "#eefbf3",
  },

  /* HERO */

  hero: {
    backgroundColor: "#10b981",

    padding: width * 0.06,

    borderRadius: 30,

    marginVertical: 15,

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

    backgroundColor:
      "rgba(255,255,255,0.14)",

    borderRadius: 100,
  },

  heroGlow2: {
    position: "absolute",

    bottom: -40,
    left: -20,

    width: 120,
    height: 120,

    backgroundColor:
      "rgba(255,255,255,0.08)",

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

    marginTop: 5,
  },

  /* NOTICE CARD */

  noticeCard: {
    borderWidth: 1.4,

    borderRadius: 28,

    padding: 18,

    marginBottom: 18,

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,

    shadowRadius: 8,

    elevation: 3,
  },

  rowTop: {
    flexDirection: "row",
  },

  iconBox: {
    width: 48,
    height: 48,

    borderRadius: 16,

    backgroundColor: "#bbf7d0",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,
  },

  content: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: width * 0.046,

    fontWeight: "800",

    color: "#14532d",

    marginBottom: 8,
  },

  metaRow: {
    flexDirection: "row",

    flexWrap: "wrap",

    marginBottom: 10,
  },

  metaItem: {
    flexDirection: "row",

    alignItems: "center",

    marginRight: 14,
  },

  metaText: {
    marginLeft: 5,

    fontSize: width * 0.033,

    color: "#15803d",

    fontWeight: "500",
  },

  description: {
    fontSize: width * 0.037,

    color: "#166534",

    lineHeight: 22,
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",

    marginTop: 90,
  },

  emptyIconBox: {
    width: 90,
    height: 90,

    borderRadius: 30,

    backgroundColor: "#dff7ea",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: width * 0.05,

    fontWeight: "700",

    color: "#14532d",
  },

  emptyText: {
    marginTop: 8,

    fontSize: width * 0.036,

    color: "#15803d",
  },

});