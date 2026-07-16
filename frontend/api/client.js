import axios from "axios";
import { getToken } from "./storage";

const API = axios.create({
  baseURL: "http://10.26.171.33:8000",
  timeout: 300000, // 🔥 increased for video + ML processing
});

/* ================= REQUEST INTERCEPTOR ================= */

API.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();

      console.log("🚀 API CALL:", config.url);
      console.log("🔐 TOKEN:", token);

      // ✅ Attach JWT token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 🔥 CRITICAL FIX: bypass ngrok warning page
      config.headers["ngrok-skip-browser-warning"] = "true";

      // ❗ DO NOT manually set multipart header
      // Axios handles it automatically

      return config;
    } catch (error) {
      console.log("❌ Request Interceptor Error:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

API.interceptors.response.use(
  (response) => {
    // ✅ Log success
    console.log("✅ RESPONSE:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // 🔍 Deep debugging
    console.log("❌ AXIOS ERROR:", error.message);

    if (error.response) {
      console.log("📡 STATUS:", error.response.status);
      console.log("📦 DATA:", error.response.data);
      console.log("📨 HEADERS:", error.response.headers);
    } else if (error.request) {
      console.log("🚫 NO RESPONSE RECEIVED (Network issue)");
    } else {
      console.log("⚠️ REQUEST SETUP ERROR:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;