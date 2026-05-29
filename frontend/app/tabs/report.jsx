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
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);


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

  setPhoto(null);
  setVideo(null);

  setMode(type);
  setCameraOpen(true);
};

  const takePhoto = async () => {

  if (!cameraRef.current) return;

  try {

    // TAKE PHOTO
    const data =
      await cameraRef.current.takePictureAsync();

    // SAVE PHOTO
    setPhoto(data.uri);

    setVideo(null);

    // SAVE TO GALLERY
    try {

      await MediaLibrary.saveToLibraryAsync(
        data.uri
      );

      console.log("Photo saved to gallery");

    } catch (saveErr) {

      console.log(
        "Gallery save failed:",
        saveErr
      );

    }

    // CLOSE CAMERA
    setCameraOpen(false);

    setMode(null);

    // GET LOCATION
    getLocation();

  } catch (err) {

    console.log("Photo error:", err);

    Alert.alert(
      "Photo Failed ❌",
      "Could not capture image"
    );

  }

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

  if (!cameraRef.current || recording) return;

  try {

    const { status } =
      await Camera.requestMicrophonePermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Microphone permission required");
      return;
    }
    setRecording(true);
    setRecordTime(0);

    // ✅ TIMER START
    timerRef.current = setInterval(() => {
      setRecordTime((prev) => {

        // auto stop at 10 sec
        if (prev >= 9) {
          stopRecording();
          return 10;
        }

        return prev + 1;
      });
    }, 1000);

    // ✅ RECORD
    const data = await cameraRef.current.recordAsync({
      maxDuration: 10,
      mute: false,
    });

    console.log("VIDEO DATA:", data);

    // ✅ IMPORTANT CHECK
    if (!data?.uri) {
      throw new Error("No video data stored");
    }

    // ✅ SAVE VIDEO
    setVideo(data.uri);
    setPhoto(null);

    // ✅ SAVE TO LOCAL GALLERY
    try {
      await MediaLibrary.saveToLibraryAsync(data.uri);
      console.log("Saved to gallery");
    } catch (saveErr) {
      console.log("Gallery save failed:", saveErr);
    }

    // ✅ CLOSE CAMERA AFTER SAVE
    setCameraOpen(false);
    setMode(null);

    // ✅ GET LIVE LOCATION
    getLocation();

  } catch (err) {

    console.log("Recording error:", err);

    Alert.alert(
      "Recording Failed ❌",
      err.message || "Could not save video"
    );

  } finally {

    clearInterval(timerRef.current);
    setRecording(false);
    setRecordTime(0);

  }
};


const stopRecording = async () => {

  if (!cameraRef.current || !recording) return;

  try {

    clearInterval(timerRef.current);

    await cameraRef.current.stopRecording();

  } catch (err) {

    console.log("Stop error:", err);

  }
};


  /* ---------- GALLERY ---------- */
  const pickImage = async () => {
  const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert("Permission required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    videoMaxDuration: 10,
    quality: 1,
  });

  if (result.canceled) return;

  const asset = result.assets[0];

  console.log("SELECTED:", asset);

  // ---------- VIDEO CHECK ----------
  if (
    asset.type === "video" &&
    asset.duration &&
    asset.duration > 10000
  ) {
    Alert.alert(
      "Video Too Long ❌",
      "Please select a video under 10 seconds."
    );
    return;
  }

  // ---------- SET MEDIA ----------
  if (asset.type === "video") {
    setVideo(asset.uri);
    setPhoto(null);
  } else {
    setPhoto(asset.uri);
    setVideo(null);
  }

  // ---------- TRY GPS ----------
  try {
    if (asset.assetId) {
      const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);

      console.log("FULL INFO:", info);

      if (info.location) {
        setCoords({
          latitude: info.location.latitude,
          longitude: info.location.longitude,
        });

        const res = await Location.reverseGeocodeAsync(
          info.location
        );

        if (res.length > 0) {
          const place = res[0];

          setAddress(
            `${place.street || ""}, ${place.city || ""}`
          );

          return;
        }
      }
    }

    // ---------- NO GPS ----------
    setAddress("No location exists");
    setCoords(null);

  } catch (err) {
    console.log("Location read failed:", err);

    setAddress("No location exists");
    setCoords(null);
  }
};

const verifyManualLocation = async () => {

  if (!manualLocation.trim()) {
    Alert.alert("Enter location");
    return;
  }

  try {

    setLoadingLocation(true);

    // search typed location
    const result = await Location.geocodeAsync(
      manualLocation
    );

    // no result found
    if (result.length === 0) {
      Alert.alert(
        "Invalid Location ❌",
        "Location not found"
      );

      setLoadingLocation(false);
      return;
    }

    // first valid result
    const loc = result[0];

    // save REAL coordinates
    setCoords({
      latitude: loc.latitude,
      longitude: loc.longitude,
    });

    // get proper readable address
    const reverse =
      await Location.reverseGeocodeAsync({
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

    if (reverse.length > 0) {

      const place = reverse[0];

      setAddress(
        `${place.street || ""}, ${place.city || ""}, ${place.region || ""}`
      );

    } else {

      setAddress(manualLocation);

    }

    Alert.alert("Location Verified ✅");
    setManualLocation("");

  } catch (err) {

    console.log(err);

    Alert.alert(
      "Location Error ❌",
      "Could not verify location"
    );

  }

  setLoadingLocation(false);
};
  /* ---------- SUBMIT ---------- */
const submitReport = async () => {

  if (!description || (!photo && !video)) {
    Alert.alert("Fill all fields");
    return;
  }

  // ---------- MANUAL LOCATION ----------
let finalCoords = coords;
let finalAddress = address;

if (
  (!coords || !coords.latitude) &&
  manualLocation.trim() !== ""
) {
  Alert.alert(
    "Verify Location ❌",
    "Please click the check button to verify location."
  );
  return;
}

if (!finalCoords) {
  finalCoords = {
    latitude: 0,
    longitude: 0,
  };

  finalAddress = "No location exists";
}

// ✅ HERE
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
    formData.append("description", description);
    formData.append(
  "latitude",
  String(finalCoords.latitude)
);

formData.append(
  "longitude",
  String(finalCoords.longitude)
);

formData.append("address", finalAddress);

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
            <Text style={styles.heroTitle}>Report Issue</Text>
            <Text style={styles.heroSub}>Capture civic issues</Text>
          </View>

          {/* SELECTION BOX */}
          {!cameraOpen && !photo && !video && (
            <View style={[styles.logoContainer, { height: height * 0.5, backgroundColor: "#d3f2e1", borderRadius: 20 }]}>

              <Ionicons name="shield-checkmark" size={80} color="#10b981" />
              <Text style={styles.logoText}>Capture an issue</Text>

              <TouchableOpacity style={styles.cameraButton} onPress={() => openCamera("photo")}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.cameraButtonText}>Open Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.cameraButton, { marginTop: 10 }]} onPress={() => openCamera("video")}>
                <Ionicons name="videocam" size={24} color="white" />
                <Text style={styles.cameraButtonText}>Open Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <Ionicons name="images" size={22} color="#047857" />
                <Text style={styles.galleryText}>Choose From Gallery</Text>
              </TouchableOpacity>

            </View>
          )}

          {/* CAMERA */}
          {cameraOpen && (
            <View style={styles.cameraWrapper}>

              <CameraView
  ref={cameraRef}
  style={styles.camera}
  mode={mode === "video" ? "video" : "picture"}
/>

              {/* CLOSE */}
              <TouchableOpacity
                style={[styles.retakeBtn, { backgroundColor: "rgba(0,0,0,0.7)" }]}
                onPress={() => {
                  setCameraOpen(false);
                  setMode(null);
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>

              {/* RECORD TIMER */}
{recording && (
  <View
    style={{
      position: "absolute",
      top: 15,
      right: 15,
      backgroundColor: "rgba(255,0,0,0.85)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      zIndex: 999,
    }}
  >
    <Text
      style={{
        color: "white",
        fontWeight: "bold",
      }}
    >
      🎥 {recordTime}s
    </Text>
  </View>
)}

              {mode === "photo" && (
                <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                  <Ionicons name="camera" size={28} color="white" />
                </TouchableOpacity>
              )}

              {mode === "video" && (
                <TouchableOpacity
  style={styles.captureBtn}
  onPress={recording ? stopRecording : recordVideo}
>
  <Ionicons
    name={recording ? "stop" : "videocam"}
    size={28}
    color="white"
  />
</TouchableOpacity>
              )}

            </View>
          )}

          {/* PHOTO PREVIEW */}
{photo && (
  <View style={styles.previewWrapper}>

    <Image
      source={{ uri: photo }}
      style={styles.previewImage}
    />

    {/* RETAKE */}
    <TouchableOpacity
      style={styles.retakeBtn}
      onPress={() => {

        setPhoto(null);
        setVideo(null);

        // IMPORTANT
        setMode("photo");

        setTimeout(() => {
          setCameraOpen(true);
        }, 100);

      }}
    >

      <Ionicons
        name="refresh"
        size={18}
        color="white"
      />

      <Text style={styles.retakeText}>
        Retake
      </Text>

    </TouchableOpacity>

  </View>
)}

          
          {/* VIDEO PREVIEW */}
{video && (
  <View style={styles.previewWrapper}>

    <View
      style={{
        height: height * 0.35,

        borderRadius: 28,

        backgroundColor: "#dff7ea",

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1,
        borderColor: "#b7ebcf",

        overflow: "hidden",
      }}
    >

      <Ionicons
        name="videocam"
        size={65}
        color="#10b981"
      />

      <Text
        style={{
          marginTop: 12,
          fontSize: 18,
          fontWeight: "700",
          color: "#166534",
        }}
      >
        Video Selected
      </Text>

      <Text
        style={{
          marginTop: 6,
          color: "#15803d",
        }}
      >
        Ready for upload
      </Text>

    </View>

    {/* RETAKE */}
    <TouchableOpacity
      style={styles.retakeBtn}
      onPress={() => {
        setVideo(null);
        setPhoto(null);

        setCameraOpen(true);
        setMode("video");
      }}
    >

      <Ionicons
        name="refresh"
        size={18}
        color="white"
      />

      <Text style={styles.retakeText}>
        Retake
      </Text>

    </TouchableOpacity>

  </View>
)}

         {/* LOCATION */}
{(photo || video) && (
  <View style={styles.locationBox}>
    <Ionicons
      name="location-outline"
      size={20}
      color="#047857"
    />

    {loadingLocation ? (
      <ActivityIndicator style={{ marginLeft: 10 }} />
    ) : (
      <View style={{ marginLeft: 10, flex: 1 }}>
        
        <Text style={styles.locationAddress}>
          {address || "No location exists"}
        </Text>

        {coords?.latitude && coords?.longitude && (
          <Text style={styles.locationAddress}>
            {`Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`}
          </Text>
        )}

       {/* MANUAL LOCATION */}
{!coords && (
  <View style={{ marginTop: 10 }}>

    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >

      <TextInput
        placeholder="Enter your location"
        value={manualLocation}
        onChangeText={setManualLocation}
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "#b7ebcf",
          borderRadius: 10,
          padding: 10,
          backgroundColor: "#f6fffa",
        }}
      />

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        onPress={verifyManualLocation}
        style={{
          marginLeft: 8,
          backgroundColor: "#10B981",
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Ionicons
          name="checkmark"
          size={20}
          color="white"
        />
      </TouchableOpacity>

    </View>

  </View>
)}
      </View>
    )}
  </View>
)}


          {/* DESCRIPTION */}
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe issue..."
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#15803d"
          />

          {/* SUBMIT */}
         <TouchableOpacity style={styles.submitBtn} onPress={submitReport}>
  {loading ? (
    <ActivityIndicator color="white" />
  ) : (
    <>
      <Ionicons name="send" size={18} color="white" />
      <Text style={styles.submitText}>Submit Report</Text>
    </>
  )}
</TouchableOpacity>

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

  /* SELECTION */

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 40,

    backgroundColor: "#dff7ea",

    borderRadius: 30,

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

  logoText: {
    marginTop: 14,

    fontSize: width * 0.042,

    color: "#166534",

    fontWeight: "600",

    marginBottom: 24,
  },

  /* BUTTONS */

  cameraButton: {
    flexDirection: "row",

    backgroundColor: "#10b981",

    paddingVertical: 14,
    paddingHorizontal: 22,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    width: "82%",

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

    fontSize: 15,
  },

  galleryButton: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 14,

    backgroundColor: "#c8f2db",

    width: "82%",

    paddingVertical: 13,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#b7ebcf",
  },

  galleryText: {
    marginLeft: 8,

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

    shadowOpacity: 0.16,
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

    top: 14,
    right: 14,

    flexDirection: "row",

    backgroundColor: "rgba(16,185,129,0.92)",

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

    marginTop: 2,
  },

  /* SECTION */

  sectionTitle: {
    fontSize: width * 0.046,

    fontWeight: "700",

    marginBottom: 10,

    color: "#14532d",
  },

  /* INPUT */

  descriptionInput: {
    minHeight: 110,

    backgroundColor: "#dff7ea",

    borderWidth: 1,
    borderColor: "#b7ebcf",

    borderRadius: 24,

    padding: 15,

    textAlignVertical: "top",

    marginBottom: 22,

    color: "#14532d",

    fontSize: 14,
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

    fontSize: 15,
  },

});