import { useCallback, useState } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface User {
	role: string;
	id: string;
	uniqueId: string;
	name: string;
	phone: string;
	email: string;
	tier: string;
	status: string;
	phoneVerified: boolean;
	kycStatus?: string;
	createdAt?: string;
}

// Define interface for dashboard stats
export interface DashboardStats {
	assignedClients: number;
	growthRates: {
		assignedClients: number;
	};
}

export function useUsers() {
	const {
		data: usersData, // Renamed to avoid conflict with new `userStats`
		loading: usersLoading, // Renamed to avoid conflict with new `loading`
		error: usersError, // Renamed to avoid conflict with new `error`
		request,
	} = useApi<{
		data: User[];
		meta: {
			totalItems: number;
			page: number;
			limit: number;
			hasMore: boolean;
			totalPages: number;
		};
	}>();

	// New state for dashboard stats
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null,
	);
	const [dashboardStatsLoading, setDashboardStatsLoading] = useState(false);
	const [dashboardStatsError, setDashboardStatsError] = useState<string | null>(
		null,
	);

	const getAssignedUsers = useCallback(
		async (params?: { page?: number; limit?: number; search?: string }) => {
			try {
				return await request(
					api.get("/users", {
						params: { ...params, limit: params?.limit ?? 100 },
					})
				);
			} catch (error: unknown) {
				// Handle 403 permission errors gracefully
				const err = error as {
					response?: {
						status?: number;
						data?: { error?: { message?: string; code?: string } };
					};
				};
				if (err?.response?.status === 403) {
					return { data: [], meta: null };
				}
				throw error;
			}
		},
		[request],
	);

	const getUserById = useCallback(async (id: string) => {
		const response = await api.get(`/users/${id}`);
		return response.data?.data;
	}, []);

	const getAllPAs = useCallback(async () => {
		const response = await api.get("/pas");
		return response.data?.data?.data || [];
	}, []);

	const createPA = useCallback(async (paData: Record<string, unknown>) => {
		const response = await api.post("/pas", paData);
		return response.data?.data;
	}, []);

	const updatePA = useCallback(
		async (id: string, paData: Record<string, unknown>) => {
			const response = await api.put(`/pas/${id}`, paData);
			return response.data?.data;
		},
		[],
	);

	const deletePA = useCallback(async (id: string) => {
		await api.delete(`/pas/${id}`);
	}, []);

	// New function to get dashboard stats
	const getDashboardStats = useCallback(async () => {
		setDashboardStatsLoading(true);
		setDashboardStatsError(null);
		try {
			const response = await api.get("/users/dashboard-stats");
			setDashboardStats(response.data);
		} catch (err: unknown) {
			if (err && typeof err === "object" && "response" in err) {
				const error = err as {
					response?: { data?: { message?: string } };
				};
				setDashboardStatsError(
					error.response?.data?.message || "Failed to fetch dashboard stats",
				);
			} else {
				setDashboardStatsError(
					err instanceof Error ? err.message : "Failed to fetch dashboard stats",
				);
			}
			throw err;
		} finally {
			setDashboardStatsLoading(false);
		}
	}, []);

	return {
		users: usersData?.data || [],
		meta: usersData?.meta,
		loading: usersLoading, // Renamed
		error: usersError, // Renamed
		getAssignedUsers,
		getUserById,
		getAllPAs,
		createPA,
		updatePA,
		deletePA,
		// Expose new dashboard stats and function
		dashboardStats,
		dashboardStatsLoading,
		dashboardStatsError,
		getDashboardStats,
	};
}
