import { useState, useCallback, useMemo } from "react";

export interface ChatConversation {
	id: string;
	clientName: string;
	clientPhone: string;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
	status: "active" | "archived";
}

interface ConversationApiItem extends Partial<ChatConversation> {
	lastMessageTimestamp?: string | number;
}

const whatsappBackendBaseUrl =
	import.meta.env.VITE_WHATSAPP_BACKEND_URL ??
	"https://whatsapp-backend-ix4v.onrender.com/api";

export function useChat() {
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const backendHeaders = useMemo(
		() => ({
			"Content-Type": "application/json",
		}),
		[],
	);

	const normalizeTimestamp = useCallback(
		(timestamp?: string | number | Date) => {
			if (!timestamp) return "";
			let date: Date;
			if (timestamp instanceof Date) {
				date = timestamp;
			} else if (typeof timestamp === "string") {
				date = new Date(timestamp);
				if (isNaN(date.getTime())) {
					const numericTs = Number(timestamp);
					if (!isNaN(numericTs)) {
						date =
							numericTs < 10_000_000_000 ?
								new Date(numericTs * 1000)
							:	new Date(numericTs);
					} else return "";
				}
			} else {
				const numericTs = timestamp;
				date =
					numericTs < 10_000_000_000 ?
						new Date(numericTs * 1000)
					:	new Date(numericTs);
			}
			if (isNaN(date.getTime())) return "";
			return date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			});
		},
		[],
	);

	const fetchConversations = useCallback(
		async (silent = false) => {
			if (!silent) setLoading(true);
			setError(null);

			try {
				const response = await fetch(`${whatsappBackendBaseUrl}/conversations`, {
					headers: backendHeaders,
					method: "GET",
				});

				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					throw new Error(
						body?.error?.message || body?.error || "Unable to fetch conversations",
					);
				}

				const payload = await response.json();
				let rawItems: ConversationApiItem[] = [];
				if (Array.isArray(payload)) rawItems = payload;
				else if (payload.success && Array.isArray(payload.data))
					rawItems = payload.data;
				else if (Array.isArray(payload.data)) rawItems = payload.data;

				const normalized: ChatConversation[] = rawItems.map((conv) => {
					const stableId =
						conv.id ??
						conv.clientPhone?.replace(/\D/g, "") ??
						`${Date.now()}-${Math.random()}`;
					return {
						id: stableId,
						clientName: conv.clientName ?? "WhatsApp User",
						clientPhone: conv.clientPhone ?? "Unknown",
						lastMessage: conv.lastMessage ?? "",
						lastMessageTime:
							conv.lastMessageTime ??
							(conv.lastMessageTimestamp ?
								normalizeTimestamp(conv.lastMessageTimestamp)
							:	""),
						unreadCount: conv.unreadCount ?? 0,
						status: conv.status ?? "active",
					};
				});

				setConversations(normalized);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch conversations",
				);
			} finally {
				if (!silent) setLoading(false);
			}
		},
		[backendHeaders, normalizeTimestamp],
	);

	return {
		conversations,
		loading,
		error,
		fetchConversations,
	};
}
