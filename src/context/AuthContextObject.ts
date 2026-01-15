import { createContext } from "react";

export interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	status: string;
	phone?: string;
	uniqueId?: string;
	tier?: string;
	phoneVerified?: boolean;
	kycStatus?: string;
	createdAt?: string;
}

export interface LoginResponse {
	requiresTwoFactor: boolean;
	tempToken?: string;
}

export interface AuthContextType {
	user: User | null;
	accessToken: string | null;
	login: (email: string, password: string) => Promise<LoginResponse>;
	verify2FA: (tempToken: string, totpCode: string) => Promise<void>;
	changePassword: (
		currentPassword: string,
		newPassword: string
	) => Promise<void>;
	logout: () => void;
	loading: boolean;
	initialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);
