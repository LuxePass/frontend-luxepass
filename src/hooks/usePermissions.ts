import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface PAPermission {
	key: string;
	granted: boolean;
	source: "role" | "explicit";
	constraints?: any;
	expiresAt?: string | null;
	description?: string;
}

export function usePermissions() {
	const getPAPermissions = useCallback(async (paId: string) => {
		// Attempting probable GET endpoint based on auth prefix pattern
		const response = await api.get(`/auth/permissions/pa/${paId}`);
		// The API returns { data: { paId, permissions: [], totalCount } }
		return response.data?.data?.permissions || [];
	}, []);

	const updatePAPermissions = useCallback(
		async (paId: string, permissions: PAPermission[]) => {
			// Transform UI permissions to API expected payload format if needed
			// API expects { permissions: [{ permissionKey: "..." }] }
			// But let's check what we are sending.
			// For now, let's assume we need to send permissionKey.

			const payload = permissions.map((p) => ({
				permissionKey: p.key,
				constraints: p.constraints,
				expiresAt: p.expiresAt,
			}));

			const response = await api.post(`/auth/permissions/pa/${paId}/bulk-grant`, {
				permissions: payload,
			});
			return response.data?.data;
		},
		[]
	);

	return {
		getPAPermissions,
		updatePAPermissions,
	};
}
