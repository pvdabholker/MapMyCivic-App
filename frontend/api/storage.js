import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "user_token";

// 🔐 Save token
export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

// 📤 Get token
export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

// ❌ Remove token (logout)
export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};