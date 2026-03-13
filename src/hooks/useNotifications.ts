import { useCallback, useState } from "react";
import api from "../services/api";

export interface NotificationItem {
	id: string;
	type: string;
	title: string;
	body: string | null;
	data: Record<string, unknown> | null;
	readAt: string | null;
	createdAt: string;
}

const NOTIFICATION_POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
	const [list, setList] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);

	const fetchNotifications = useCallback(
		async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
			setLoading(true);
			try {
				const res = await api.get("/notifications", {
					params: { limit: params?.limit ?? 50, ...params },
				});
				const raw = res.data?.data ?? res.data;
				const data = Array.isArray(raw) ? raw : raw?.data ?? [];
				const meta = res.data?.meta ?? raw?.meta;
				setList(data);
				const count = data.filter((n: NotificationItem) => !n.readAt).length;
				setUnreadCount(count);
				return { data, meta };
			} catch {
				setList([]);
				setUnreadCount(0);
				return { data: [], meta: null };
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const markAsRead = useCallback(async (id: string) => {
		try {
			await api.patch(`/notifications/${id}/read`);
			setList((prev) =>
				prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
			);
			setUnreadCount((c) => Math.max(0, c - 1));
		} catch {
			// ignore
		}
	}, []);

	const markAllRead = useCallback(async () => {
		try {
			await api.patch("/notifications/read-all");
			setList((prev) =>
				prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
			);
			setUnreadCount(0);
		} catch {
			// ignore
		}
	}, []);

	return {
		notifications: list,
		unreadCount,
		loading,
		fetchNotifications,
		markAsRead,
		markAllRead,
		setUnreadCount,
	};
}

export { NOTIFICATION_POLL_INTERVAL_MS };
