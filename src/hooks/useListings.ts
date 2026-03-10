import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface ListingMedia {
	id: string;
	url: string;
	fileName: string;
	fileType: string;
	size: number;
	isPrimary: boolean;
	createdAt: string;
}

export interface PropertyListing {
	id: string;
	name: string;
	description: string;
	address: string;
	city: string;
	state: string;
	country: string;
	propertyType: string;
	bedrooms: number;
	bathrooms: number;
	maxGuests: number;
	amenities: string[];
	pricePerNight: string;
	currency: string;
	vettingStatus: "PENDING" | "APPROVED" | "REJECTED";
	isActive: boolean;
	media?: ListingMedia[];
	createdAt: string;
}

export function useListings() {
	const { data, loading, error, request, setState } = useApi<{
		data: PropertyListing[];
		meta: {
			totalItems: number;
			page: number;
			limit: number;
			hasMore: boolean;
			totalPages: number;
		};
	}>();

	const getListings = useCallback(
		async (params?: Record<string, unknown>) => {
			try {
				return await request(api.get("/listings", { params }));
			} catch (error: unknown) {
				const err = error as { response?: { status?: number } };
				if (err?.response?.status === 403) {
					console.warn("Permission denied: Cannot access listings");
					return { data: [], meta: null };
				}
				throw error;
			}
		},
		[request]
	);

	const createListing = useCallback(
		async (listingData: Partial<PropertyListing>) => {
			const response = await api.post("/listings", listingData);
			return response.data?.data;
		},
		[]
	);

	const updateListing = useCallback(
		async (id: string, listingData: Partial<PropertyListing>) => {
			const response = await api.put(`/listings/${id}`, listingData);
			return response.data?.data;
		},
		[]
	);

	const updateVettingStatus = useCallback(
		async (id: string, vettingStatus: string, notes?: string) => {
			const response = await api.put(`/listings/${id}/vetting`, {
				vettingStatus,
				notes,
			});
			return response.data?.data;
		},
		[]
	);

	// Helper to manually update a listing in the local state
	const updateLocalListing = useCallback(
		(updatedListing: PropertyListing) => {
			setState((prev) => {
				if (!prev.data) return prev;
				const currentListings = prev.data.data;
				const updatedListings = currentListings.map((item) =>
					item.id === updatedListing.id ? updatedListing : item
				);
				return {
					...prev,
					data: {
						...prev.data,
						data: updatedListings,
					},
				};
			});
		},
		[setState]
	);

	// Helper to manually add a new listing to the local state
	const addLocalListing = useCallback(
		(newListing: PropertyListing) => {
			setState((prev) => {
				if (!prev.data) return prev;
				return {
					...prev,
					data: {
						...prev.data,
						data: [newListing, ...prev.data.data],
						meta: {
							...prev.data.meta,
							totalItems: (prev.data.meta?.totalItems || 0) + 1,
						},
					},
				};
			});
		},
		[setState]
	);

	// Helper to manually remove a listing from the local state
	const removeLocalListing = useCallback(
		(id: string) => {
			setState((prev) => {
				if (!prev.data) return prev;
				const currentListings = prev.data.data;
				const updatedListings = currentListings.filter((item) => item.id !== id);
				return {
					...prev,
					data: {
						...prev.data,
						data: updatedListings,
					},
				};
			});
		},
		[setState]
	);

	const deleteListing = useCallback(async (id: string) => {
		await api.delete(`/listings/${id}`);
	}, []);

	const getMedia = useCallback(async (listingId: string) => {
		const response = await api.get(`/listings/${listingId}/media`);
		return response.data?.data;
	}, []);

	const addMedia = useCallback(async (listingId: string, file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		const response = await api.post(`/listings/${listingId}/media`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data?.data;
	}, []);

	const deleteMedia = useCallback(async (listingId: string, mediaId: string) => {
		await api.delete(`/listings/${listingId}/media/${mediaId}`);
	}, []);

	return {
		listings: data?.data || [],
		meta: data?.meta,
		loading,
		error,
		getListings,
		createListing,
		updateListing,
		updateVettingStatus,
		deleteListing,
		getMedia,
		addMedia,
		deleteMedia,
		updateLocalListing,
		addLocalListing,
		removeLocalListing,
	};
}
