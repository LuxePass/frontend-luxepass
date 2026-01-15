import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import {
	AuthContext,
	type User,
	type LoginResponse,
} from "./AuthContextObject";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(
		localStorage.getItem("accessToken")
	);
	const [loading, setLoading] = useState(false);
	const [initialized, setInitialized] = useState(false);

	const logout = useCallback(async () => {
		try {
			await api.post("/auth/pa/logout");
		} catch (error) {
			console.error("Logout API call failed", error);
		} finally {
			setAccessToken(null);
			setUser(null);
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("user");
			delete api.defaults.headers.common["Authorization"];
		}
	}, []);

	// Initialize auth state from local storage
	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem("accessToken");
			if (token) {
				try {
					const storedUser = localStorage.getItem("user");
					if (storedUser) {
						setUser(JSON.parse(storedUser));
					}
				} catch (error) {
					console.error("Failed to initialize auth", error);
					logout();
				}
			}
			setInitialized(true);
		};

		initAuth();
	}, [logout]);

	const login = useCallback(
		async (email: string, password: string): Promise<LoginResponse> => {
			setLoading(true);
			try {
				const response = await api.post("/auth/pa/login", { email, password });
				// Log the raw response to see structure
				console.log("🔐 Raw Login Response:", response.data);

				const { data } = response.data;

				if (data.requiresTwoFactor) {
					console.log("🔐 2FA Required");
					return {
						requiresTwoFactor: true,
						tempToken: data.tempToken,
					};
				}

				const { tokens, pa } = data;

				// Critical Debug: Check exactly what PA object looks like
				console.log(
					"🔐 Login successful - Full PA Object:",
					JSON.stringify(pa, null, 2)
				);

				setAccessToken(tokens.accessToken);
				setUser(pa);

				localStorage.setItem("accessToken", tokens.accessToken);
				localStorage.setItem("refreshToken", tokens.refreshToken);
				localStorage.setItem("user", JSON.stringify(pa));

				api.defaults.headers.common[
					"Authorization"
				] = `Bearer ${tokens.accessToken}`;

				return { requiresTwoFactor: false };
			} catch (error) {
				console.error("Login failed", error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const verify2FA = useCallback(async (tempToken: string, totpCode: string) => {
		setLoading(true);
		try {
			const response = await api.post("/auth/pa/verify-2fa", {
				tempToken,
				totpCode,
			});
			const { tokens, pa } = response.data.data;

			console.log(
				"🔐 2FA Verified - Full PA Object:",
				JSON.stringify(pa, null, 2)
			);

			setAccessToken(tokens.accessToken);
			setUser(pa);

			localStorage.setItem("accessToken", tokens.accessToken);
			localStorage.setItem("refreshToken", tokens.refreshToken);
			localStorage.setItem("user", JSON.stringify(pa));

			api.defaults.headers.common[
				"Authorization"
			] = `Bearer ${tokens.accessToken}`;
		} catch (error) {
			console.error("2FA verification failed", error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const changePassword = useCallback(
		async (currentPassword: string, newPassword: string) => {
			try {
				await api.post("/auth/pa/change-password", {
					currentPassword,
					newPassword,
				});
			} catch (error) {
				console.error("Password change failed", error);
				throw error;
			}
		},
		[]
	);

	const value = useMemo(
		() => ({
			user,
			accessToken,
			login,
			verify2FA,
			logout,
			loading,
			initialized,
			changePassword,
		}),
		[
			user,
			accessToken,
			logout,
			loading,
			initialized,
			changePassword,
			login,
			verify2FA,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
