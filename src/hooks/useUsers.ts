import { useCallback } from "react";
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

export function useUsers() {
	const { data, loading, error, request } = useApi<{
		data: User[];
		meta: {
			totalItems: number;
			page: number;
			limit: number;
			hasMore: boolean;
			totalPages: number;
		};
	}>();

	const getAssignedUsers = useCallback(
		async (params?: { page?: number; limit?: number; search?: string }) => {
			try {
				return await request(api.get("/users", { params }));
			} catch (error: unknown) {
				// Handle 403 permission errors gracefully
				const err = error as {
					response?: {
						status?: number;
						data?: { error?: { message?: string; code?: string } };
					};
				};
				if (err?.response?.status === 403) {
					console.error("❌ 403 FORBIDDEN: Cannot access /users/assigned");
					console.error("Error details:", err?.response?.data);
					console.error(
						"Current user from localStorage:",
						localStorage.getItem("user")
					);
					console.error(
						"Required: PA role must be one of: PA, SENIOR_PA, ADMIN, or SUPER_ADMIN"
					);
					return { data: [], meta: null };
				}
				throw error;
			}
		},
		[request]
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
		[]
	);

	const deletePA = useCallback(async (id: string) => {
		await api.delete(`/pas/${id}`);
	}, []);

	return {
		users: data?.data || [],
		meta: data?.meta,
		loading,
		error,
		getAssignedUsers,
		getUserById,
		getAllPAs,
		createPA,
		updatePA,
		deletePA,
	};
}
