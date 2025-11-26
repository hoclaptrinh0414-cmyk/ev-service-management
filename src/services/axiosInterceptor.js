/**
 * Axios Interceptor Service
 * Xử lý Token Refresh tự động khi AccessToken hết hạn
 *
 * ============================================
 * THEO YÊU CẦU CỦA BACKEND
 * ============================================
 *
 * 1. LOGIN ENDPOINT:
 *    - Path: POST /api/auth/login
 *    - Request Body: { username, password }
 *    - Response: { success, data: { User, Customer, AccessToken, RefreshToken } }
 *
 * 2. REFRESH TOKEN ENDPOINT:
 *    - Path: POST /api/auth/refresh
 *    - Request Body: { "refreshToken": "string" }
 *    - Response: { success, data: { AccessToken, RefreshToken } }
 *
 * 3. LOGOUT ENDPOINT:
 *    - Path: POST /api/auth/logout
 *    - Request Body: { "refreshToken": "string" }
 *
 * ============================================
 * LOGIC HOẠT ĐỘNG:
 * ============================================
 *
 * 1. Request Interceptor:
 *    - Tự động đính kèm AccessToken vào header Authorization của mỗi request
 *
 * 2. Response Interceptor:
 *    - Khi gặp lỗi 401 Unauthorized:
 *      a. Gọi API /api/auth/refresh với refreshToken hiện tại
 *      b. Nếu refresh thành công:
 *         - Lưu AccessToken và RefreshToken mới
 *         - Thực hiện lại request ban đầu với token mới
 *      c. Nếu refresh thất bại:
 *         - Clear toàn bộ auth data
 *         - Redirect về trang /login
 *
 * 3. Queue Management:
 *    - Nếu nhiều request cùng lúc gặp 401, chỉ gọi refresh 1 lần
 *    - Các request khác sẽ chờ trong queue và dùng token mới
 */

import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://unprepared-kade-nonpossibly.ngrok-free.dev/api";

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng lên 30s để xử lý appointment
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// ============ REQUEST INTERCEPTOR ============
// Đính kèm AccessToken vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("🔐 Request with AccessToken:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ============ RESPONSE INTERCEPTOR ============
// Xử lý khi AccessToken hết hạn (401)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response success:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ⚠️ BỎ QUA refresh token cho login/register endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/customer-registration/register") ||
      originalRequest.url?.includes("/auth/external/");

    if (isAuthEndpoint) {
      console.log("⚠️ Auth endpoint failed, skip token refresh");
      return Promise.reject(error);
    }

    // Nếu lỗi là 401 và request này chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error(
          "❌ No refreshToken found, will redirect to login shortly"
        );
        // Remove sensitive auth keys but avoid immediate hard redirect so the UI
        // doesn't abruptly lose state (useful while editing forms)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Delay redirect slightly to give user a chance to see the error and
        // potentially copy unsaved data. Use a short timeout instead of
        // immediate navigation.
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Attempting to refresh token...");

        // Gọi API refresh token (không cần Authorization header)
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        console.log("🔍 Refresh response:", response.data);

        // ✅ BE trả về: { success, data: { AccessToken, RefreshToken } }
        // hoặc { Success, Data: { AccessToken, RefreshToken } } (PascalCase)
        const success = response.data.success || response.data.Success;
        const data = response.data.data || response.data.Data;

        if (success && data) {
          const newAccessToken = data.AccessToken || data.accessToken;
          const newRefreshToken = data.RefreshToken || data.refreshToken;

          if (!newAccessToken || !newRefreshToken) {
            console.error(
              "❌ Missing AccessToken or RefreshToken in refresh response"
            );
            throw new Error("Invalid refresh response - missing tokens");
          }

          // Lưu token mới
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          console.log("✅ Token refreshed successfully");

          // Cập nhật header của request ban đầu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Xử lý queue
          processQueue(null, newAccessToken);

          // Thực hiện lại request ban đầu
          return axiosInstance(originalRequest);
        } else {
          console.error("❌ Invalid refresh response:", { success, data });
          throw new Error("Invalid refresh response");
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError.message);

        // Clear auth data but avoid an immediate hard redirect so user doesn't
        // lose unsaved form data. Redirect after a short delay.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        processQueue(refreshError, null);

        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
