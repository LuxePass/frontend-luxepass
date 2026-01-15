import { useState, useCallback } from "react";

interface ApiState<T> {
	data: T | null;
	loading: boolean;
	error: unknown;
}

export function useApi<T>() {
	const [state, setState] = useState<ApiState<T>>({
		data: null,
		loading: false,
		error: null,
	});

	const request = useCallback(async (apiCall: Promise<unknown>) => {
		setState((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const response = (await apiCall) as { data?: { data?: T } };
			const data = response.data?.data ?? (response.data as T);
			setState({ data, loading: false, error: null });
			return data;
		} catch (error: unknown) {
			const errorObj = error as {
				response?: { data?: unknown };
				message?: string;
			};
			const errorData = errorObj?.response?.data || errorObj?.message || error;
			setState({ data: null, loading: false, error: errorData });
			// Throw the original error so callers can check status codes (e.g. 403)
			throw error;
		}
	}, []);

	return { ...state, request, setState };
}
