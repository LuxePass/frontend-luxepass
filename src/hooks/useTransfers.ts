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

export interface PendingTransfer {
	id: string;
	reference: string;
	userId: string;
	userUniqueId: string;
	userName?: string;
	assignedPaId?: string;
	amount: string;
	currency: string;
	recipientBankName: string;
	recipientAccountNumber: string;
	recipientName: string;
	narration?: string;
	createdAt: string;
	expiresAt: string;
}

/** Full transfer detail (e.g. from GET /transfers/detail/:id) */
export interface TransferDetail extends Transfer {
	user?: { id: string; uniqueId: string; name: string | null };
	rejectedAt?: string | null;
	rejectionReason?: string | null;
	expiresAt?: string | null;
	recipientBankName?: string;
	recipientAccountNumber?: string;
	recipientName?: string;
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

	const rejectTransfer = useCallback(async (id: string, reason?: string) => {
		const response = await api.patch(`/transfers/${id}/reject`, { reason });
		return response.data?.data ?? response.data;
	}, []);

	const {
		data: pendingData,
		loading: pendingLoading,
		request: requestPending,
	} = useApi<PendingTransfer[]>();

	const getPendingTransfers = useCallback(async () => {
		try {
			const res = await requestPending(api.get("/transfers/pending"));
			return Array.isArray(res) ? res : [];
		} catch (_err: unknown) {
			const err = _err as { response?: { status?: number } };
			if (err?.response?.status === 403) return [];
			throw _err;
		}
	}, [requestPending]);

	const executeEmergencyTransfer = useCallback(async (id: string) => {
		const response = await api.post(`/transfers/${id}/execute`);
		return response.data?.data ?? response.data;
	}, []);

	const { data: detailData, loading: detailLoading, request: requestDetail } = useApi<TransferDetail>();

	const getTransferById = useCallback(
		async (id: string) => {
			const res = await requestDetail(api.get(`/transfers/detail/${id}`));
			return res;
		},
		[requestDetail],
	);

	return {
		transfers: data?.data || [],
		meta: data?.meta,
		loading,
		error,
		getTransfers,
		rejectTransfer,
		pendingTransfers: pendingData ?? [],
		pendingLoading,
		getPendingTransfers,
		executeEmergencyTransfer,
		getTransferById,
		transferDetail: detailData ?? null,
		transferDetailLoading: detailLoading,
	};
}
