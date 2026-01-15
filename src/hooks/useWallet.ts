import { useCallback } from "react";
import api from "../services/api";
import { useApi } from "./useApi";
import { useAuth } from "./useAuth";

export interface Wallet {
	id: string;
	userId: string;
	balance: string;
	currency: string;
	status: string;
	virtualAccount?: {
		accountNumber: string;
		bankName: string;
		accountName: string;
	};
}

export interface Transaction {
	id: string;
	reference: string;
	amount: string;
	status: string;
	createdAt: string;
	narration?: string;
}

export function useWallet() {
	const { user } = useAuth();

	const { data, loading, error, request } = useApi<Wallet>();
	const { data: transactions, request: requestTransactions } =
		useApi<Transaction[]>();

	const getMyWallet = useCallback(async () => {
		try {
			// First try standard endpoint
			return await request(api.get("/wallet/me"));
		} catch (err: unknown) {
			// Workaround: If user is PA and standard endpoint fails, try to find wallet by identifier (email)
			// This expects the backend to have a user with the same email as the PA
			if (
				user?.role === "PA" ||
				user?.role === "ADMIN" ||
				user?.role === "SUPER_ADMIN"
			) {
				// We can try to fetch by email if the API supports filtering/lookup
				// Or if we know the 'shadow' user ID.
				// For now, let's try to fetch by identifier using email
				try {
					if (user?.email) {
						// Try to get wallet by email/identifier
						const response = await api.get(`/wallet/${user.email}`);
						// If that fails, we might need to find the user ID first.
						// But sticking to the specific "workaround" request, we'll try this path.
						// If the backend doesn't support /wallet/:email directly, we might need a different query.
						// Assuming /wallet/:identifier works as per docs (Get Wallet by Identifier)
						if (response.data?.data) {
							// Manually update state since `request` wrapper might not trigger on catch block manual call
							// Actually `request` handles state. We should ideally use `request` again but we are inside catch.
							// Let's just return the data, the caller might handle it?
							// But `useApi` state (data, loading) needs to be updated.
							// We can't easily update `useApi` state from outside without exposing `setData`.
							// So we will just retry with `request`
							return await request(api.get(`/wallet/${user.email}`));
						}
					}
				} catch (retryErr) {
					console.warn("Retrying wallet fetch for PA also failed", retryErr);
					throw err;
				}
			}
			throw err;
		}
	}, [request, user]);

	const getWalletById = useCallback(async (id: string) => {
		const response = await api.get(`/wallet/${id}`);
		return response.data?.data;
	}, []);

	const getAllWallets = useCallback(async (params?: Record<string, unknown>) => {
		return api.get("/wallet", { params });
	}, []);

	const getUserWallet = useCallback(
		async (userId: string) => {
			// Assuming backend supports fetching wallet by userId or email via /wallet/:identifier
			// or /wallet?userId=...
			// Based on API docs "Get Wallet by Identifier", /wallet/:identifier should work.
			// However, standard might be /wallet/user/:userId if structured that way.
			// Let's try the generic identifier endpoint first which we know exists.
			return request(api.get(`/wallet/${userId}`));
		},
		[request]
	);

	const getTransferHistory = useCallback(
		async (userId: string) => {
			return requestTransactions(api.get("/transfers", { params: { userId } }));
		},
		[requestTransactions]
	);

	const initiateTransfer = useCallback(
		async (transferData: {
			amount: string | number;
			narration?: string;
			securityAnswer?: string;
			userIdentifier?: string;
		}) => {
			const response = await api.post("/transfers", transferData);
			return response.data?.data;
		},
		[]
	);

	return {
		wallet: data,
		transactions: transactions || [],
		loading,
		error,
		getMyWallet,
		getWalletById,
		getAllWallets,
		getTransferHistory,
		initiateTransfer,
		getUserWallet,
	};
}
