import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";
import { customToast } from "../Page/CustomToast";

export interface AuditLog {
	id: string;
	action: string;
	actorType: string;
	actorId?: string;
	resourceType: string;
	resourceId?: string;
	oldValue?: Record<string, unknown>;
	newValue?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	status: string;
	createdAt: string;
}

export interface AuditLogMeta {
	totalItems: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage?: boolean;
	hasPreviousPage?: boolean;
}

export function useAuditLogs() {
	const { data, loading, error, request } = useApi<{
		data: AuditLog[];
		meta: AuditLogMeta;
	}>();

	const getAuditLogs = useCallback(
		async (params?: {
			page?: number;
			limit?: number;
			actorType?: string;
			actorId?: string;
			action?: string;
			resourceType?: string;
			resourceId?: string;
			startDate?: string;
			endDate?: string;
		}) => {
			try {
				return await request(api.get("/audit", { params }));
			} catch (err: unknown) {
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
