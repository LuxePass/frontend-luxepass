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
			} catch (_error: unknown) {
				const err = _error as { response?: { status?: number } };
				if (err?.response?.status === 403) {
					return { data: [], meta: null };
				}
				throw _error;
			}
		},
		[request],
	);

	const approveTransfer = useCallback(async (id: string, notes?: string) => {
		const response = await api.patch(`/transfers/${id}/approve`, { notes });
		return response.data?.data;
	}, []);

	const rejectTransfer = useCallback(async (id: string, notes?: string) => {
		const response = await api.patch(`/transfers/${id}/reject`, { notes });
		return response.data?.data;
	}, []);

	return {
		transfers: Array.isArray(data?.data) ? data.data : [],
		meta: data?.meta,
		loading,
		error,
		getTransfers,
		approveTransfer,
		rejectTransfer,
	};
}
