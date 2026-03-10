import { useCallback, useState } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface Booking {
	id: string;
	userId: string;
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

export function useBookings() {
	const {
		data: bookingsData, // Renamed to avoid conflict
		loading: bookingsLoading, // Renamed to avoid conflict
		error: bookingsError, // Renamed to avoid conflict
		request,
	} = useApi<{
		data: Booking[];
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

	const getBookings = useCallback(
		async (params?: {
			page?: number;
			limit?: number;
			status?: string;
			type?: string;
			userId?: string;
			search?: string;
		}) => {
			try {
				let url = "/bookings";
				if (params) {
					const query = new URLSearchParams();
					if (params.page) query.append("page", params.page.toString());
					if (params.limit) query.append("limit", params.limit.toString());
					if (params.status) query.append("status", params.status);
					if (params.type) query.append("type", params.type);
					if (params.userId) query.append("userId", params.userId);
					if (params.search?.trim()) query.append("search", params.search.trim());

					const queryString = query.toString();
					if (queryString) url += `?${queryString}`;
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
			return response.data?.data;
		},
		[],
	);

	const confirmBooking = useCallback(async (id: string) => {
		const response = await api.patch(`/bookings/${id}/confirm`);
		return response.data?.data;
	}, []);

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

	return {
		bookings: bookingsData?.data || [],
		meta: bookingsData?.meta,
		loading: bookingsLoading,
		error: bookingsError,
		getBookings,
		getBookingById,
		updateBookingStatus,
		confirmBooking,
		// Expose new dashboard stats and function
		dashboardStats,
		dashboardStatsLoading,
		dashboardStatsError,
		getDashboardStats,
	};
}
