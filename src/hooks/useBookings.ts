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
				return await request(api.get("/bookings", { params }));
			} catch (error: unknown) {
				// Handle 403 permission errors gracefully
				const err = error as { response?: { status?: number } };
				if (err?.response?.status === 403) {
					console.warn("Permission denied: Cannot access bookings");
					return { data: [], meta: null };
				}
				throw error;
			}
		},
		[request]
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
		[]
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
