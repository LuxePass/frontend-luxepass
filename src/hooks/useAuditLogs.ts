import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";
import { customToast } from "../Page/CustomToast";

export interface AuditLog {
	id: string;
	action: string;
	entityType: string;
	entityId: string;
	userId: string;
	userName: string;
	previousData: unknown;
	newData: unknown;
	ipAddress: string;
	userAgent: string;
	createdAt: string;
}

export function useAuditLogs() {
	const { data, loading, error, request } = useApi<{
		data: AuditLog[];
		meta: {
			totalItems: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>();

	const getAuditLogs = useCallback(
		async (params?: Record<string, unknown>) => {
			try {
				return await request(api.get("/audit", { params }));
			} catch (err: unknown) {
				console.error("Failed to fetch audit logs:", err);
				customToast.error("Failed to fetch audit logs");
				throw err;
			}
		},
		[request]
	);

	return {
		logs: data?.data || [],
		meta: data?.meta,
		loading,
		error,
		getAuditLogs,
	};
}
