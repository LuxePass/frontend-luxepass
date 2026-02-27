import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface Booking {
	id: string;
	userId: string;
	type: "SHORTLET" | "FLIGHT";
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

export function useBookings() {
	const { data, loading, error, request } = useApi<{
		data: Booking[];
		meta: {
			totalItems: number;
			page: number;
			limit: number;
			hasMore: boolean;
			totalPages: number;
		};
	}>();

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
			return response.data?.data;
		},
		[],
	);

	const confirmBooking = useCallback(async (id: string) => {
		const response = await api.patch(`/bookings/${id}/confirm`);
		return response.data?.data;
	}, []);

	return {
		bookings: data?.data || [],
		meta: data?.meta,
		loading,
		error,
		getBookings,
		getBookingById,
		updateBookingStatus,
		confirmBooking,
	};
}
