import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface Transfer {
	id: string;
	reference: string;
	userId: string;
	amount: string;
	currency: string;
	status: "PENDING" | "SUCCESS" | "FAILED";
	narration: string;
	createdAt: string;
}

export function useTransfers() {
	const { data, loading, error, request } = useApi<{
		data: Transfer[];
		meta: {
			totalItems: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>();

	const getTransfers = useCallback(
		async (params?: Record<string, unknown>) => {
			try {
				return await request(api.get("/transfers", { params }));
			} catch (error: unknown) {
				const err = error as { response?: { status?: number } };
				if (err?.response?.status === 403) {
					console.warn("Permission denied: Cannot access transfers");
					return { data: [], meta: null };
				}
				throw error;
			}
		},
		[request]
	);

	return {
		transfers: data?.data || [],
		meta: data?.meta,
		loading,
		error,
		getTransfers,
	};
}
