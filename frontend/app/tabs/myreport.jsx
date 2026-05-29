import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import API from "../../api/client";

import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");


export default function ReportScreen() {

  const [loading, setLoading] = useState(false);

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [recording, setRecording] = useState(false);

  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState(null);
  const [damageLevel, setDamageLevel] = useState(null);

  const [reports, setReports] = useState([]);
const [selectedImage, setSelectedImage] = useState(null);



  /* ---------- DATA ---------- */
  const issueTypes = ["Pothole","Water Logging","Street Light","Drainage","Garbage", "Damaged sign Board"];
  const damageLevels = ["low","medium","critical"];



  const handleSelectType = (type) => {
    setIssueType(type);
  };

  /* ---------- LOCATION ---------- */
const getLocation = async () => {
  setLoadingLocation(true);

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLoadingLocation(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setCoords(loc.coords);

    try {
      const res = await Location.reverseGeocodeAsync(loc.coords);

      if (res.length > 0) {
        const place = res[0];
        setAddress(`${place.street || ""}, ${place.city || ""}`);
      }
    } catch (geoError) {
      console.log("Geocode failed:", geoError);
      setAddress("Location detected");
    }

  } catch (err) {
    console.log("Location error:", err);
  }

  setLoadingLocation(false);
};
  /* ---------- CAMERA ---------- */
  const openCamera = async (type) => {
    if (!permission?.granted) await requestPermission();
    setMode(type);
    setCameraOpen(true);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const data = await cameraRef.current.takePictureAsync();
    setPhoto(data.uri);
    setVideo(null);
    setCameraOpen(false);
    setMode(null);
    getLocation();
  };

  const fetchMyReports = async () => {
  try {

    const res = await API.get("/report/my");

setReports(
  res.data.map((item) => ({
    id: item.id,
    type: item.issue_type,
    level: item.severity,
    description: item.description,
    location: item.address,
    department: item.department || "Unknown Department",
    image: item.image_url,
    time: item.created_at,
    status:
  item.status === "pending" ? "Pending" :
  item.status === "in_progress" ? "In Progress" :
  item.status === "resolved" ? "Resolved" :
  item.status,

    // ✅ FIXES
    title: `${item.severity} ${item.issue_type}`,
    verificationStatus: "valid",
  }))
);

  } catch (err) {
    console.log(err);
  }
};

 const recordVideo = async () => {
  if (!cameraRef.current) return;

  const { status } = await Camera.requestMicrophonePermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Microphone permission required");
    return;
  }

  try {
    setRecording(true);

    // ✅ small delay to allow camera to initialize
    await new Promise(resolve => setTimeout(resolve, 1200));

    const data = await cameraRef.current.recordAsync({
      maxDuration: 10,
      mute: true,
    });

    if (data?.uri) {
      setVideo(data.uri);
      setPhoto(null);
      setCameraOpen(false);
      setMode(null);
      getLocation();
    }

  } catch (err) {
    console.log("Recording error:", err);
    Alert.alert("Recording failed");
  } finally {
    setRecording(false);
  }
};
const stopRecording = () => {
  if (!cameraRef.current || !recording) return;

// ❗ prevent stopping too early
setTimeout(() => {
  try {
    cameraRef.current.stopRecording();
  } catch (err) {
    console.log("Stop error:", err);
  }
}, 800);

  try {
    cameraRef.current.stopRecording();
  } catch (err) {
    console.log("Stop error:", err);
  }

  setRecording(false);
};


  /* ---------- GALLERY ---------- */
  const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (result.canceled) return;

  const asset = result.assets[0];

  console.log("📸 Selected:", asset);

  // ❗ STRICT RULE: must have assetId
  if (!asset.assetId) {
    Alert.alert(
      "Invalid Image ❌",
      "This image does not contain location data. Please select another image."
    );

    return; // 🚫 STOP HERE
  }

  // get full info
  const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);

  console.log("📍 FULL INFO:", info);

  // ❗ STRICT RULE: must have GPS
  if (!info.location) {
    Alert.alert(
      "No GPS Found ❌",
      "This image does not have location data. Please choose another image."
    );

    return; // 🚫 STOP HERE
  }

  // ✅ ONLY VALID CASE
  setPhoto(asset.uri);

  setCoords({
    latitude: info.location.latitude,
    longitude: info.location.longitude,
  });

  const res = await Location.reverseGeocodeAsync(info.location);

  if (res.length > 0) {
    const place = res[0];
    setAddress(`${place.street || ""}, ${place.city || ""}`);
  }
};
  /* ---------- SUBMIT ---------- */
const submitReport = async () => {

  if (!issueType || !damageLevel || !description || (!photo && !video)) {
    Alert.alert("Fill all fields");
    return;
  }

  if (!coords || !coords.latitude || !coords.longitude) {
  Alert.alert("Error ❌", "No location available. Cannot submit report.");
  return;
}

  setLoading(true);

  try {
    const formData = new FormData();

    const fileUri = photo || video;
    const isVideo = !!video;

    console.log("==== DEBUG START ====");
console.log("PHOTO:", photo);
console.log("VIDEO:", video);
console.log("FILE URI:", fileUri);
console.log("IS VIDEO:", isVideo);
console.log("COORDS:", coords);
console.log("ISSUE TYPE:", issueType);
console.log("SEVERITY:", damageLevel);

    const cleanUri =
  Platform.OS === "android"
    ? fileUri
    : fileUri.replace("file://", "");
    console.log("CLEAN URI:", cleanUri);

    // ✅ FILE FIRST
    formData.append("file", {
  uri: cleanUri,
  name: isVideo ? `upload.mp4` : `upload.jpg`,
  type: isVideo ? "video/mp4" : "image/jpeg",

});
console.log("FORMDATA FILE ADDED");

    // ✅ THEN ALL FIELDS
    formData.append("issue_type", issueType.toLowerCase());
    formData.append("severity", damageLevel.toLowerCase());
    formData.append("description", description);
    formData.append("latitude", String(coords.latitude));
    formData.append("longitude", String(coords.longitude));
    formData.append("address", address);

    // ✅ ONLY ONE API CALL
    console.log("🚀 SENDING REQUEST...");
    const response = await API.post("/report/create", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

    console.log("UPLOAD SUCCESS:", response.data);

    Alert.alert("Report Submitted Successfully ✅");

    await fetchMyReports();

    setPhoto(null);
    setVideo(null);
    setDescription("");
    setIssueType(null);
    setDamageLevel(null);

  } catch (err) {
    console.log("FULL ERROR:", err);
    console.log("BACKEND ERROR:", err?.response?.data);

    const message =
      err?.response?.data?.detail ||
      err?.message ||
      "Something went wrong";

    Alert.alert("Error ❌", message);
  }

  setLoading(false);
};

const getTimeAgo = (timestamp) => {
  const now = new Date();
 const diff = Math.floor((now - new Date(timestamp || Date.now())) / 1000);;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};

const handleDelete = async (id) => {
  try {
    await API.delete(`/report/${id}`);
    fetchMyReports();
  } catch (err) {
    console.log(err);
    Alert.alert("Delete failed");
  }
};
const formatDate = (dateString) => {
  if (!dateString) return "No Date";

  try {
    // ✅ convert DB format → ISO format
    const fixed = dateString.replace(" ", "T");

    const date = new Date(fixed);

    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  } catch {
    return "Invalid Date";
  }
};

useFocusEffect(
  React.useCallback(() => {
    fetchMyReports();
  }, [])
);
  /* ---------- UI ---------- */
  return (
    
    <SafeAreaView style={{ flex: 1 }}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >

          {/* HERO */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>My Reports</Text>
            <Text style={styles.heroSub}>View your submitted reports</Text>
          </View>

          {/* ================= MY REPORTS ================= */}

<Text style={[styles.sectionTitle, { marginTop: 30 }]}>
  My Reports
</Text>

{reports.length === 0 ? (
  <Text style={{ color: "#6B7280", marginBottom: 20 }}>
    No reports yet
  </Text>
) : (
  reports.map((item) => (
    <View key={item.id} style={styles.reportCard}>

      {/* TOP TAGS */}
      <View style={{ 
        flexDirection: "row", 
        marginBottom: 6, 
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>

        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>

          <View style={styles.tagGrey}>
            <Text>{item.type}</Text>
          </View>

          <View style={styles.tagRed}>
            <Text style={{ color: "white" }}>{item.level}</Text>
          </View>

          <View style={[
            styles.statusTag,
            item.status === "Pending" && styles.statusPending,
            item.status === "In Progress" && styles.statusProgress,
            item.status === "Resolved" && styles.statusResolved,
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>

        </View>

        {/* DELETE */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            Alert.alert(
              "Delete Report",
              "Are you sure?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", style: "destructive", onPress: () => handleDelete(item.id) },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>

      </View>

      {/* CONTENT */}
      <View style={styles.reportRow}>

      {item.image && (
  <TouchableOpacity
    style={styles.imageContainer}
    onPress={() => setSelectedImage(item.image)}
  >
    {item.image.match(/\.(mp4|mov|avi)$/i) ? (
      <View style={[styles.reportImage, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="videocam" size={24} color="white" />
      </View>
    ) : (
      <Image source={{ uri: item.image }} style={styles.reportImage} />
    )}
  </TouchableOpacity>
)}

        <View style={styles.reportDetails}>

          <Text style={styles.reportTitle}>{item.title}</Text>

          {/* VERIFICATION */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            {item.verificationStatus === "checking" && (
              <>
                <ActivityIndicator size="small" color="#6B7280" />
                <Text style={{ marginLeft: 6, color: "#6B7280", fontSize: 12 }}>
                  Verifying...
                </Text>
              </>
            )}

            {item.verificationStatus === "valid" && (
              <>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={{ marginLeft: 6, color: "#16A34A", fontSize: 12 }}>
                  Valid Issue
                </Text>
              </>
            )}

            {item.verificationStatus === "invalid" && (
              <>
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <Text style={{ marginLeft: 6, color: "#EF4444", fontSize: 12 }}>
                  Invalid
                </Text>
              </>
            )}
          </View>

          <Text style={styles.reportDesc} numberOfLines={3}>
            {item.description}
          </Text>

          <Text style={styles.reportMeta}>📍 {item.location}</Text>
          <Text style={styles.reportMeta}>
  ⏱ {formatDate(item.time)}
</Text>
        </View>
      </View>

      {/* AUTHORITY */}
      <Text style={styles.reportAuthority}>
        {item.department || "Unknown Authority"}
      </Text>

    </View>
  ))
)}

{/* FULLSCREEN IMAGE */}
{selectedImage && (
  <View style={styles.fullscreenImageContainer}>
    <TouchableOpacity
      style={styles.closeBtn}
      onPress={() => setSelectedImage(null)}
    >
      <Ionicons name="close" size={28} color="white" />
    </TouchableOpacity>

    <Image
      source={{ uri: selectedImage }}
      style={styles.fullscreenImage}
    />
  </View>
)}

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


/* ---------- STYLES ---------- */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    backgroundColor: "#eefbf3",
  },

  /* HERO */

  hero: {
    backgroundColor: "#10b981",

    padding: width * 0.06,

    borderRadius: 30,

    marginVertical: 15,

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.14,
    shadowRadius: 12,

    elevation: 6,
  },

  heroTitle: {
    color: "#ffffff",

    fontSize: width * 0.058,

    fontWeight: "800",
  },

  heroSub: {
    color: "#d1fae5",

    fontSize: width * 0.035,

    marginTop: 5,
  },

  /* TITLES */

  title: {
    fontSize: width * 0.07,

    fontWeight: "800",

    marginBottom: 6,

    color: "#14532d",
  },

  subtitle: {
    fontSize: width * 0.036,

    color: "#15803d",

    marginBottom: 20,
  },

  /* EMPTY */

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 40,

    backgroundColor: "#dff7ea",

    borderRadius: 28,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  logoText: {
    marginTop: 12,

    fontSize: width * 0.04,

    color: "#166534",

    marginBottom: 20,

    fontWeight: "600",
  },

  /* BUTTONS */

  cameraButton: {
    flexDirection: "row",

    backgroundColor: "#10b981",

    paddingVertical: 13,
    paddingHorizontal: 20,

    borderRadius: 18,

    alignItems: "center",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 4,
  },

  cameraButtonText: {
    color: "#ffffff",

    marginLeft: 8,

    fontWeight: "700",
  },

  galleryButton: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 12,

    backgroundColor: "#dff7ea",

    paddingVertical: 12,
    paddingHorizontal: 16,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  galleryText: {
    marginLeft: 6,

    color: "#047857",

    fontWeight: "700",
  },

  /* CAMERA */

  cameraWrapper: {
    height: height * 0.35,

    borderRadius: 28,

    overflow: "hidden",

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  camera: {
    flex: 1,
  },

  captureBtn: {
    position: "absolute",

    bottom: 18,

    alignSelf: "center",

    backgroundColor: "#10b981",

    padding: 18,

    borderRadius: 50,

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.14,
    shadowRadius: 8,

    elevation: 5,
  },

  /* PREVIEW */

  previewWrapper: {
    marginBottom: 18,
  },

  previewImage: {
    width: "100%",
    height: height * 0.35,

    borderRadius: 28,
  },

  retakeBtn: {
    position: "absolute",

    top: 12,
    right: 12,

    flexDirection: "row",

    backgroundColor: "rgba(16,185,129,0.95)",

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 18,

    alignItems: "center",
  },

  retakeText: {
    color: "#ffffff",

    marginLeft: 5,

    fontWeight: "600",
  },

  /* LOCATION */

  locationBox: {
    flexDirection: "row",

    backgroundColor: "#dff7ea",

    padding: 14,

    borderRadius: 22,

    marginBottom: 18,

    alignItems: "center",

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  locationAddress: {
    fontSize: width * 0.035,

    color: "#14532d",

    fontWeight: "600",
  },

  locationCoords: {
    fontSize: width * 0.03,

    color: "#15803d",
  },

  /* SECTION */

  sectionTitle: {
    fontSize: width * 0.05,

    fontWeight: "800",

    marginBottom: 12,

    color: "#14532d",
  },

  /* INPUT */

  descriptionInput: {
    minHeight: 100,

    borderWidth: 1,
    borderColor: "#b7ebcf",

    borderRadius: 22,

    padding: 14,

    textAlignVertical: "top",

    marginBottom: 20,

    backgroundColor: "#dff7ea",

    color: "#14532d",
  },

  /* SUBMIT */

  submitBtn: {
    backgroundColor: "#10b981",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    padding: 16,

    borderRadius: 22,

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.14,
    shadowRadius: 8,

    elevation: 5,
  },

  submitText: {
    color: "#ffffff",

    fontWeight: "700",

    marginLeft: 8,
  },

  /* REPORT CARD */

  reportCard: {
    backgroundColor: "#dff7ea",

    padding: 16,

    borderRadius: 24,

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#b7ebcf",

    shadowColor: "#10b981",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 3,
  },

  tagGrey: {
    backgroundColor: "#ecfdf5",

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 12,

    marginRight: 6,
  },

  tagRed: {
    backgroundColor: "#ef4444",

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 12,
  },

  reportRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    marginTop: 8,
  },

  imageContainer: {
    width: "26%",

    marginRight: 12,
  },

  reportImage: {
    width: "100%",
    height: 90,

    borderRadius: 16,

    backgroundColor: "#bbf7d0",
  },

  reportDetails: {
    width: "72%",
  },

  reportTitle: {
    fontWeight: "800",

    fontSize: 15,

    marginBottom: 6,

    color: "#14532d",
  },

  reportDesc: {
    color: "#166534",

    fontSize: 13,

    marginBottom: 6,

    lineHeight: 20,
  },

  reportMeta: {
    fontSize: 12,

    color: "#15803d",

    marginBottom: 2,
  },

  reportAuthority: {
    marginTop: 12,

    color: "#047857",

    fontWeight: "700",
  },

  /* FULLSCREEN */

  fullscreenImageContainer: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(0,0,0,0.92)",

    justifyContent: "center",
    alignItems: "center",
  },

  fullscreenImage: {
    width: "92%",
    height: "72%",

    resizeMode: "contain",
  },

  closeBtn: {
    position: "absolute",

    top: 40,
    right: 20,

    zIndex: 999,
  },

  /* STATUS */

  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 12,

    marginLeft: 6,
  },

  statusText: {
    fontSize: 12,

    fontWeight: "700",
  },

  statusPending: {
    backgroundColor: "#e5e7eb",
  },

  statusProgress: {
    backgroundColor: "#fde68a",
  },

  statusResolved: {
    backgroundColor: "#bbf7d0",
  },

  /* DELETE */

  deleteBtn: {
    backgroundColor: "#fee2e2",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
  },

});