import { useCallback, useState } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface BookingUserSummary {
	id: string;
	uniqueId: string;
	name: string;
}

export interface Booking {
	id: string;
	userId: string;
	user?: BookingUserSummary;
	type: "SHORTLET" | "FLIGHT" | "CONCIERGE";
	status: "INQUIRY" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
	propertyId?: string;
	checkIn?: string;
	checkOut?: string;
	totalAmount: string;
	currency: string;
	createdAt: string;
	updatedAt: string;
	property?: unknown;
}

// Define interface for dashboard stats
export interface DashboardStats {
	pendingInquiries: number;
	confirmedBookings: number;
	totalRevenue: number;
	growthRates: {
		pendingInquiries: number;
		confirmedBookings: number;
		revenue: number;
	};
}

type BookingsApiData = {
	data: Booking[];
	meta: {
		totalItems: number;
		page: number;
		limit: number;
		hasMore: boolean;
		totalPages: number;
	};
};

export function useBookings() {
	const {
		data: bookingsData,
		loading: bookingsLoading,
		error: bookingsError,
		request,
		setState,
	} = useApi<BookingsApiData>();

	// New state for dashboard stats
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null,
	);
	const [dashboardStatsLoading, setDashboardStatsLoading] = useState(false);
	const [dashboardStatsError, setDashboardStatsError] = useState<string | null>(
		null,
	);

	const getBookings = useCallback(
		async (params?: {
			page?: number;
			limit?: number;
			status?: string;
			type?: string;
			userId?: string;
		}) => {
			try {
				// Use explicit query params formatting as per user suggestion to avoid 404
				let url = "/bookings";
				if (params) {
					const query = new URLSearchParams();
					if (params.page) query.append("page", params.page.toString());
					if (params.limit) query.append("limit", params.limit.toString());
					if (params.status) query.append("status", params.status);
					if (params.type) query.append("type", params.type);

					// Handle userId specially to ensure we support both UUID and uniqueId
					if (params.userId) {
						query.append("userId", params.userId);
					}

					const queryString = query.toString();
					if (queryString) {
						url += `?${queryString}`;
					}
				}
				return await request(api.get(url));
			} catch (error: unknown) {
				// Handle 403 permission errors gracefully
				const err = error as { response?: { status?: number } };
				if (err?.response?.status === 403) {
					return { data: [], meta: null };
				}
				throw error;
			}
		},
		[request],
	);

	const getBookingById = useCallback(async (id: string) => {
		const response = await api.get(`/bookings/${id}`);
		return response.data?.data;
	}, []);

	const updateBookingStatus = useCallback(
		async (id: string, status: string, specialRequests?: string) => {
			const response = await api.put(`/bookings/${id}`, {
				status,
				specialRequests,
			});
			const raw = response.data?.data ?? response.data;
			return (typeof raw === "object" && raw !== null && "id" in raw
				? raw
				: undefined) as Booking | undefined;
		},
		[],
	);

	const confirmBooking = useCallback(async (id: string) => {
		const response = await api.patch(`/bookings/${id}/confirm`);
		const raw = response.data?.data ?? response.data;
		return (typeof raw === "object" && raw !== null && "id" in raw
			? raw
			: undefined) as Booking | undefined;
	}, []);

	/** Update a single booking in the local list (e.g. after status change) so UI updates immediately */
	const updateBookingInList = useCallback(
		(updated: Partial<Booking> & { id: string }) => {
			if (!updated?.id) return;
			setState((prev) => {
				if (!prev?.data) return prev;
				const current = prev.data as BookingsApiData | Booking[];
				const list = Array.isArray(current) ? current : (current?.data ?? []);
				const nextList = list.map((b) =>
					b.id === updated.id ? { ...b, ...updated } : b,
				);
				const meta =
					typeof current === "object" && current !== null && "meta" in current
						? (current as BookingsApiData).meta
						: { totalItems: nextList.length, page: 1, limit: nextList.length, hasMore: false, totalPages: 1 };
				const nextData: BookingsApiData = {
					data: nextList,
					meta: meta ?? { totalItems: nextList.length, page: 1, limit: nextList.length, hasMore: false, totalPages: 1 },
				};
				return { ...prev, data: nextData };
			});
		},
		[setState],
	);

	// New function to get dashboard stats
	const getDashboardStats = useCallback(async () => {
		setDashboardStatsLoading(true);
		setDashboardStatsError(null);
		try {
			const response = await api.get("/bookings/dashboard-stats");
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

	// Support both shapes: { data: Booking[], meta } or array (from API/interceptor)
	const bookingsList = Array.isArray(bookingsData)
		? bookingsData
		: (bookingsData?.data ?? []);

	return {
		bookings: bookingsList,
		meta: Array.isArray(bookingsData) ? undefined : bookingsData?.meta,
		loading: bookingsLoading,
		error: bookingsError,
		getBookings,
		getBookingById,
		updateBookingStatus,
		confirmBooking,
		updateBookingInList,
		dashboardStats,
		dashboardStatsLoading,
		dashboardStatsError,
		getDashboardStats,
	};
}
