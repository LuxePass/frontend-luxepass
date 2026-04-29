import { useState, useCallback } from "react";

interface ApiState<T> {
	data: T | null;
	loading: boolean;
	error: unknown;
}

/**
 * The backend ResponseInterceptor always returns:
 *   { success, message, data: <payload>, meta?: <pagination>, timestamp }
 *
 * For paginated endpoints the controller returns { data: items[], meta: {...} }.
 * The interceptor strips meta to the top level, so we reconstruct the full
 * paginated object { data: items[], meta: {...} } here so all hooks see a
 * consistent shape matching their type parameter T.
 */
export function useApi<T>() {
	const [state, setState] = useState<ApiState<T>>({
		data: null,
		loading: false,
		error: null,
	});

	const request = useCallback(async (apiCall: Promise<unknown>) => {
		setState((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const response = (await apiCall) as {
				data?: {
					data?: unknown;
					meta?: unknown;
					success?: boolean;
				};
			};
			const raw = response.data;
			let data: T;
			if (raw?.meta !== undefined) {
				// Paginated: interceptor split { data: items[], meta } into
				// response.data.data = { data: items[] } and response.data.meta = pagination.
				// Reconstruct the original { data: items[], meta } shape.
				data = { ...(raw.data as object), meta: raw.meta } as T;
			} else {
				// Non-paginated: payload is directly in response.data.data
				data = (raw?.data ?? raw) as T;
			}
			setState({ data, loading: false, error: null });
			return data;
		} catch (error: unknown) {
			const errorObj = error as {
				response?: { data?: unknown };
				message?: string;
			};
			const errorData = errorObj?.response?.data || errorObj?.message || error;
			setState({ data: null, loading: false, error: errorData });
			throw error;
		}
	}, []);

	return { ...state, request, setState };
}
