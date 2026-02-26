import { useCallback, useState } from "react";
import api from "../services/api";
import { useApi } from "./useApi";

export interface VirtualAccount {
	id: string;
	accountNumber: string;
	bankCode: string;
	bankName: string;
	accountName: string;
	isActive: boolean;
}

export interface Wallet {
	id: string;
	userId: string;
	balance: string;
	currency: string;
	setupStatus: string;
	setupAttempts: number;
	setupError: string | null;
	setupCompletedAt: string | null;
	createdAt: string;
	updatedAt: string;
	virtualAccounts: VirtualAccount[];
}

export interface SavedBankAccount {
	bankName: string;
	accountNumber: string;
	accountName: string;
	createdAt?: string;
}

export interface Transaction {
	id: string;
	type: string;
	amount: string;
	balanceBefore: string;
	balanceAfter: string;
	currency: string;
	reference: string;
	description: string;
	status: string;
	category: string;
	createdAt: string;
}

export function useWallet() {
	const { data: wallet, loading, request } = useApi<Wallet>();
	const [savedBankAccounts, setSavedBankAccounts] = useState<SavedBankAccount[]>(
		[],
	);
	const { data: transactions, request: requestTransactions } =
		useApi<Transaction[]>();

	const getMyWallet = useCallback(async () => {
		return request(api.get("/wallet/me"));
	}, [request]);

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
		[request],
	);

	const getTransferHistory = useCallback(
		async (userId: string) => {
			return requestTransactions(api.get("/transfers", { params: { userId } }));
		},
		[requestTransactions],
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
		[],
	);

	const fetchSavedBankAccounts = useCallback(async (identifier: string) => {
		const WHATSAPP_API_URL =
			import.meta.env.VITE_WHATSAPP_BACKEND_URL ||
			"https://whatsapp-backend-ix4v.onrender.com/api";
		try {
			const response = await fetch(
				`${WHATSAPP_API_URL}/users/${identifier}/bank-accounts`,
			);
			if (!response.ok) throw new Error("Failed to fetch bank accounts");
			const payload = await response.json();
			if (payload.success) {
				setSavedBankAccounts(payload.data);
				return payload.data;
			}
		} catch (error) {
			console.error("Error fetching saved bank accounts:", error);
		}
		return [];
	}, []);

	return {
		wallet,
		transactions: transactions || [],
		loading,
		savedBankAccounts,
		getMyWallet,
		getWalletById,
		getAllWallets,
		getTransferHistory,
		initiateTransfer,
		getUserWallet,
		fetchSavedBankAccounts,
	};
}
