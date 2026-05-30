import axios from "axios";
import { storage } from "./storage";
import { API_BASE_URL } from "./env";

const DEBUG = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (DEBUG) {
      console.log(`[SangSangai] ➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      if (config.data) {
        const safe = typeof config.data === "string" ? config.data : JSON.stringify(config.data).slice(0, 200);
        console.log(`[SangSangai]   body: ${safe}`);
      }
    }
    return config;
  },
  (error) => {
    console.log("[SangSangai] ❌ Request interceptor error:", error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    if (DEBUG) {
      console.log(`[SangSangai] ✅ ${res.status} ${res.config.url}`);
    }
    return res;
  },
  async (error) => {
    if (error.response) {
      console.log(`[SangSangai] ❌ ${error.response.status} ${error.config?.url}`);
      console.log(`[SangSangai]   response data:`, JSON.stringify(error.response.data).slice(0, 300));
      if (error.response.status === 401) {
        await storage.clearAuth();
      }
    } else if (error.request) {
      console.log(`[SangSangai] ❌ No response received for ${error.config?.url}`);
      console.log(`[SangSangai]   Is the server running at ${API_BASE_URL}?`);
    } else {
      console.log(`[SangSangai] ❌ Request error:`, error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
