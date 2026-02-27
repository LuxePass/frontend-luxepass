import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "https://localhost:4000/api/v1";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor to handle token refresh and common errors
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Handle 401 Unauthorized (token expired)
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const refreshToken = localStorage.getItem("refreshToken");
			if (refreshToken) {
				try {
					// Note: PA refresh endpoint from documentation
					const response = await axios.post(`${API_BASE_URL}/auth/pa/refresh`, {
						refreshToken,
					});

					const { accessToken, refreshToken: newRefreshToken } = response.data.data;

					localStorage.setItem("accessToken", accessToken);
					localStorage.setItem("refreshToken", newRefreshToken);

					api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
					originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

					return api(originalRequest);
				} catch (refreshError) {
					// Refresh failed, logout
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					window.location.href = "/login";
					return Promise.reject(refreshError);
				}
			}
		}

		// Handle 403 Forbidden (permission denied)
		// Don't logout - this is a permission issue, not an auth issue
		if (error.response?.status === 403) {
			// Let the calling component handle this gracefully
		}

		return Promise.reject(error);
	},
);

export default api;
