import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {

  return (

    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#64748b",

        tabBarStyle: {
          position: "absolute",

          left: 14,
          right: 14,
          bottom: 14,

          height: 68,

          backgroundColor: "rgba(245,255,250,0.92)",

          borderRadius: 24,

          borderTopWidth: 0,

          paddingTop: 6,
          paddingBottom: 6,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: 3,
          },

          shadowOpacity: 0.08,
          shadowRadius: 8,

          elevation: 6,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* MAP */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "map"
                  : "map-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* REPORT */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="add"
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* REPORTS */}
      <Tabs.Screen
        name="myreport"
        options={{
          title: "Reports",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "document-text"
                  : "document-text-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* NOTICES */}
      <Tabs.Screen
        name="notices"
        options={{
          title: "Notices",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "notifications"
                  : "notifications-outline"
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

    </Tabs>

  );

}