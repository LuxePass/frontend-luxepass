import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { UserCircle } from "lucide-react";
import {
	MessageCircle,
	Send,
	Phone,
	MoreVertical,
	CheckCheck,
	Clock,
	RefreshCw,
	UserPlus,
	Archive,
	Building2,
	Tag,
	UserRoundCog,
	Sparkles,
	Search,
	Image as ImageIcon,
	ChevronLeft,
} from "lucide-react";
import { cn } from "../utils";
import { customToast } from "./CustomToast";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";

interface ChatMessage {
	id: string;
	messageId?: string; // WhatsApp message ID for status tracking
	conversationId: string;
	sender: "client" | "pa";
	clientName?: string;
	content: string;
	timestamp: string;
	timestampValue?: number; // Numeric timestamp for sorting/grouping
	status: "sent" | "delivered" | "read" | "received";
	platform: "whatsapp";
	isBot?: boolean;
}

interface ChatConversation {
	id: string;
	clientName: string;
	clientPhone: string;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
	status: "active" | "archived";
}

type ConversationApiItem = Partial<ChatConversation> & {
	lastMessageTimestamp?: string | number;
};

type MessageApiItem = Partial<ChatMessage> & {
	timestampValue?: string | number;
	isBot?: boolean;
};

// Polling intervals (in milliseconds)
const CONVERSATIONS_POLL_INTERVAL = 10000; // 10 seconds
const MESSAGES_POLL_INTERVAL = 5000; // 5 seconds

export function LiveChat() {
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoadingConversations, setIsLoadingConversations] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [, setLastConversationFetch] = useState<number>(0);
	const [, setLastMessageFetch] = useState<Record<string, number>>({});
	const [offerListingOpen, setOfferListingOpen] = useState(false);
	const [offerConciergeOpen, setOfferConciergeOpen] = useState(false);
	const [listingsForOffer, setListingsForOffer] = useState<
		Array<{
			id: string;
			name: string;
			propertyType?: string;
			pricePerNight?: number;
			currency?: string;
			city?: string;
			media?: Array<{ url: string }>;
		}>
	>([]);
	const [conciergeForOffer, setConciergeForOffer] = useState<
		Array<{
			id: string;
			name: string;
			category?: string;
			price?: string;
			currency?: string;
			mediaUrl?: string;
		}>
	>([]);
	const [listingSearch, setListingSearch] = useState("");
	const [conciergeSearch, setConciergeSearch] = useState("");
	const [transferSearch, setTransferSearch] = useState("");
	const [sendingOffer, setSendingOffer] = useState(false);
	const [transferOpen, setTransferOpen] = useState(false);
	const [otherPAs, setOtherPAs] = useState<
		Array<{ id: string; name: string; email?: string }>
	>([]);
	const [transferringToPaId, setTransferringToPaId] = useState<string | null>(
		null,
	);

	const { user } = useAuth();

	// Refs for polling intervals
	const conversationsPollRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const messagesPollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	/** Normalize message content for display: strip trailing ISO timestamp, fix known truncated system text */
	const displayContent = useCallback((content: string | undefined): string => {
		if (content == null || content === "") return "";
		let text = content.trim();
		// Strip trailing ISO timestamp if it was mistakenly stored as part of content
		text = text.replace(/\s*\d{4}-\d{2}-\d{2}T[\d.:+-]+Z?\d*\s*$/i, "").trim();
		// Fix known truncated system message
		if (text === "Connecting you wit" || text.startsWith("Connecting you wit "))
			text =
				"Connecting you with a Live Agent...\nPlease wait, one of our specialists will be with you shortly.";
		return text || content;
	}, []);

	/**
	 * Get date label for message grouping (Today, Yesterday, or date)
	 */
	const getDateLabel = useCallback(
		(timestamp?: string | number | Date): string => {
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
					} else {
						return "";
					}
				}
			} else {
				const numericTs = timestamp;
				date =
					numericTs < 10_000_000_000 ?
						new Date(numericTs * 1000)
					:	new Date(numericTs);
			}

			if (isNaN(date.getTime())) {
				return "";
			}

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			const messageDate = new Date(date);
			messageDate.setHours(0, 0, 0, 0);

			if (messageDate.getTime() === today.getTime()) {
				return "Today";
			} else if (messageDate.getTime() === yesterday.getTime()) {
				return "Yesterday";
			} else {
				return messageDate.toLocaleDateString("en-US", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			}
		},
		[],
	);

	const groupMessagesByDate = useCallback(
		(
			messages: ChatMessage[],
		): Array<{ date: string; messages: ChatMessage[] }> => {
			const groups: Map<string, ChatMessage[]> = new Map();

			messages.forEach((message) => {
				// Get timestamp value from message
				let timestampValue: number | null = null;

				if (message.timestampValue) {
					timestampValue =
						typeof message.timestampValue === "string" ?
							Number(message.timestampValue)
						:	message.timestampValue;
				} else if (message.timestamp) {
					// Try to parse timestamp string
					const date = new Date(message.timestamp);
					if (!isNaN(date.getTime())) {
						timestampValue = date.getTime();
					}
				}

				if (timestampValue === null) {
					// Fallback to current time if no valid timestamp
					timestampValue = Date.now();
				}

				const dateLabel = getDateLabel(timestampValue);
				if (!dateLabel) return;

				if (!groups.has(dateLabel)) {
					groups.set(dateLabel, []);
				}
				groups.get(dateLabel)!.push(message);
			});

			// Convert to array and sort by date (most recent first)
			return Array.from(groups.entries())
				.map(([date, msgs]) => ({ date, messages: msgs }))
				.sort((a, b) => {
					// Sort dates: Older dates first, then Yesterday, then Today
					if (a.date === "Today") return 1;
					if (b.date === "Today") return -1;
					if (a.date === "Yesterday") return 1;
					if (b.date === "Yesterday") return -1;
					// For older dates, compare the actual dates (Ascending)
					const dateA = new Date(a.messages[0]?.timestampValue || 0);
					const dateB = new Date(b.messages[0]?.timestampValue || 0);
					return dateA.getTime() - dateB.getTime();
				});
		},
		[getDateLabel],
	);

	const whatsappBackendBaseUrl =
		import.meta.env.VITE_WHATSAPP_BACKEND_URL ??
		"https://whatsapp-backend-ix4v.onrender.com/api";

	const backendHeaders = useMemo(
		() => ({
			"Content-Type": "application/json",
		}),
		[],
	);

	const selectedConv = conversations.find((c) => c.id === selectedConversation);
	const selectedMessages = useMemo(() => {
		return selectedConversation ? (messages[selectedConversation] ?? []) : [];
	}, [selectedConversation, messages]);

	// Group messages by date
	const groupedMessages = useMemo(() => {
		if (selectedMessages.length === 0) return [];
		return groupMessagesByDate(selectedMessages);
	}, [selectedMessages, groupMessagesByDate]);
	/**
	 * Normalize timestamp to time string (HH:MM format)
	 */
	const normalizeTimestamp = useCallback(
		(timestamp?: string | number | Date) => {
			if (!timestamp) return "";

			let date: Date;

			if (timestamp instanceof Date) {
				date = timestamp;
			} else if (typeof timestamp === "string") {
				// Try parsing ISO string first
				date = new Date(timestamp);
				// If invalid, try parsing as number
				if (isNaN(date.getTime())) {
					const numericTs = Number(timestamp);
					if (!isNaN(numericTs)) {
						date =
							numericTs < 10_000_000_000 ?
								new Date(numericTs * 1000)
							:	new Date(numericTs);
					} else {
						return "";
					}
				}
			} else {
				// Number timestamp
				const numericTs = timestamp;
				date =
					numericTs < 10_000_000_000 ?
						new Date(numericTs * 1000)
					:	new Date(numericTs);
			}

			if (isNaN(date.getTime())) {
				return "";
			}

			return date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			});
		},
		[],
	);

	/**
	 * Group messages by date
	 */

	/**
	 * Normalize phone number to digits only (backend requirement)
	 */
	const normalizePhoneNumber = useCallback((phone: string): string => {
		// Remove all non-digit characters
		return phone.replace(/\D/g, "");
	}, []);

	/**
	 * Fetch conversations from backend
	 */
	const fetchConversations = useCallback(
		async (silent = false) => {
			if (!silent) {
				setIsLoadingConversations(true);
			}
			setError(null);

			try {
				if (!user?.id) {
					setError("You must be signed in to view your assigned conversations.");
					return;
				}

				const url = new URL(`${whatsappBackendBaseUrl}/conversations`);
				url.searchParams.append("paId", user.id);

				const response = await fetch(url.toString(), {
					headers: backendHeaders,
					method: "GET",
				});

				const payload = (await response.json()) as {
					success?: boolean;
					data?: ConversationApiItem[];
					error?: string;
				};

				// console.log("📦 [LiveChat] Fetch Payload:", payload);

				// Handle different response formats
				let rawItems: ConversationApiItem[] = [];
				if (Array.isArray(payload)) {
					rawItems = payload;
				} else if (payload.success && Array.isArray(payload.data)) {
					rawItems = payload.data;
				} else if (Array.isArray(payload.data)) {
					rawItems = payload.data;
				}

				const normalized: ChatConversation[] = rawItems.map((conversation) => {
					const conv = conversation as ConversationApiItem;
					// Use conversation ID if available, otherwise generate a stable ID from phone number
					const stableId =
						conv.id ??
						(conv.clientPhone ?
							conv.clientPhone.replace(/\D/g, "")
						:	`${Date.now()}-${Math.random().toString(36).slice(2)}`);
					const timestamp =
						conv.lastMessageTime ??
						(conv.lastMessageTimestamp ?
							normalizeTimestamp(conv.lastMessageTimestamp)
						:	"");

					return {
						id: stableId,
						clientName: conv.clientName ?? "WhatsApp User",
						clientPhone: conv.clientPhone ?? "Unknown",
						lastMessage: conv.lastMessage ?? "",
						lastMessageTime: timestamp,
						unreadCount: conv.unreadCount ?? 0,
						status: conv.status ?? "active",
					};
				});

				// Smart merge: preserve existing conversations and only update what changed
				setConversations((prev) => {
					// If this is the first load and we have no previous data, just set it
					if (prev.length === 0 && normalized.length > 0) {
						return normalized;
					}

					// If new data is empty but we have existing data, preserve existing (don't clear)
					if (normalized.length === 0 && prev.length > 0) {
						return prev;
					}

					// Create a map of existing conversations by ID for quick lookup
					const prevMap = new Map(prev.map((c) => [c.id, c]));
					const newMap = new Map(normalized.map((c) => [c.id, c]));

					// Check if anything actually changed
					let hasChanges = false;
					const merged: ChatConversation[] = [];

					// Process all conversations (both existing and new)
					const allIds = new Set([...prevMap.keys(), ...newMap.keys()]);

					for (const id of allIds) {
						const prevConv = prevMap.get(id);
						const newConv = newMap.get(id);

						if (!newConv) {
							// Conversation exists in prev but not in new - keep it (don't remove)
							if (prevConv) {
								merged.push(prevConv);
							}
						} else if (!prevConv) {
							// New conversation - add it
							merged.push(newConv);
							hasChanges = true;
						} else {
							// Both exist - check if changed
							const changed =
								prevConv.clientName !== newConv.clientName ||
								prevConv.clientPhone !== newConv.clientPhone ||
								prevConv.lastMessage !== newConv.lastMessage ||
								prevConv.lastMessageTime !== newConv.lastMessageTime ||
								prevConv.unreadCount !== newConv.unreadCount ||
								prevConv.status !== newConv.status;

							if (changed) {
								merged.push(newConv);
								hasChanges = true;
							} else {
								// No change - keep the previous one to maintain reference stability
								merged.push(prevConv);
							}
						}
					}

					// Sort by last message time (most recent first)
					merged.sort((a, b) => {
						const timeA = new Date(a.lastMessageTime || 0).getTime();
						const timeB = new Date(b.lastMessageTime || 0).getTime();
						return timeB - timeA;
					});

					// Only update if something changed
					return hasChanges || merged.length !== prev.length ? merged : prev;
				});

				setLastConversationFetch(Date.now());

				// Auto-select first conversation if none selected
				if (normalized.length > 0 && !selectedConversation) {
					setSelectedConversation(normalized[0].id);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ?
						err.message
					:	"Something went wrong fetching conversations.";

				// Only set error if we don't have existing data (don't clear on refresh errors)
				setConversations((prev) => {
					// If we have existing conversations, keep them and just log the error
					if (prev.length > 0) {
						return prev;
					}
					// Only set error if we have no data
					return prev;
				});

				setError(errorMessage);

				if (!silent) {
					customToast.error({
						title: "WhatsApp Error",
						description: errorMessage,
					});
				}
			} finally {
				if (!silent) {
					setIsLoadingConversations(false);
				}
			}
		},
		[
			backendHeaders,
			normalizeTimestamp,
			whatsappBackendBaseUrl,
			selectedConversation,
			user?.id,
		],
	);

	/**
	 * Fetch messages for a specific conversation
	 */
	const fetchMessages = useCallback(
		async (conversationId: string, silent = false) => {
			if (!conversationId) return;
			if (!user?.id) return;

			if (!silent) {
				setIsLoadingMessages(true);
			}

			try {
				const url = new URL(
					`${whatsappBackendBaseUrl}/conversations/${conversationId}/messages`,
				);
				url.searchParams.set("paId", user.id);
				const response = await fetch(url.toString(), {
					headers: backendHeaders,
					method: "GET",
				});

				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					const errorMessage =
						body?.error?.message || body?.error || "Unable to fetch messages";
					throw new Error(errorMessage);
				}

				const payload = (await response.json()) as {
					success?: boolean;
					data?: MessageApiItem[];
					error?: string;
				};

				// Handle different response formats
				let rawItems: MessageApiItem[] = [];
				if (Array.isArray(payload)) {
					rawItems = payload;
				} else if (payload.success && Array.isArray(payload.data)) {
					rawItems = payload.data;
				} else if (Array.isArray(payload.data)) {
					rawItems = payload.data;
				}

				const normalizedMessages: ChatMessage[] = rawItems.map((message) => {
					const msg = message as MessageApiItem;
					// Use message ID if available, otherwise generate stable ID
					const stableId =
						msg.id ??
						`msg_${conversationId}_${msg.timestampValue ?? Date.now()}_${Math.random()
							.toString(36)
							.slice(2)}`;

					// Parse timestamp value properly
					let timestampValue: number | undefined = undefined;
					let timestampStr = msg.timestamp ?? "";

					if (msg.timestampValue !== undefined) {
						timestampValue =
							typeof msg.timestampValue === "string" ?
								Number(msg.timestampValue)
							:	msg.timestampValue;

						if (!isNaN(timestampValue)) {
							// Convert to Date and format
							const date =
								timestampValue < 10_000_000_000 ?
									new Date(timestampValue * 1000)
								:	new Date(timestampValue);
							if (!isNaN(date.getTime())) {
								timestampStr = normalizeTimestamp(date);
								if (!timestampValue || timestampValue < 10_000_000_000) {
									timestampValue = date.getTime();
								}
							}
						}
					} else if (msg.timestamp) {
						// Try to parse timestamp string
						const date = new Date(msg.timestamp);
						if (!isNaN(date.getTime())) {
							timestampValue = date.getTime();
							timestampStr = normalizeTimestamp(date);
						}
					}

					// If still no timestamp, use current time
					if (!timestampValue) {
						timestampValue = Date.now();
						timestampStr = normalizeTimestamp(new Date());
					}

					return {
						id: stableId,
						messageId: msg.messageId,
						conversationId,
						sender: msg.sender ?? "client",
						clientName: msg.clientName,
						content: msg.content ?? "",
						timestamp: timestampStr,
						timestampValue: timestampValue,
						status: msg.status ?? "sent",
						platform: msg.platform ?? "whatsapp",
						isBot: msg.isBot,
					};
				});

				// Smart merge: preserve existing messages and only update what changed
				setMessages((prev) => {
					const prevMessages = prev[conversationId] ?? [];

					// If this is the first load for this conversation, just set it
					if (prevMessages.length === 0 && normalizedMessages.length > 0) {
						return {
							...prev,
							[conversationId]: normalizedMessages,
						};
					}

					// If new data is empty but we have existing messages, preserve existing
					if (normalizedMessages.length === 0 && prevMessages.length > 0) {
						return prev;
					}

					// Create maps for quick lookup
					const prevMap = new Map(prevMessages.map((m) => [m.id, m]));
					const newMap = new Map(normalizedMessages.map((m) => [m.id, m]));

					// Check if anything actually changed
					let hasChanges = false;
					const merged: ChatMessage[] = [];

					// Process all messages (both existing and new)
					const allIds = new Set([...prevMap.keys(), ...newMap.keys()]);

					for (const id of allIds) {
						const prevMsg = prevMap.get(id);
						const newMsg = newMap.get(id);

						if (!newMsg) {
							// Message exists in prev but not in new - keep it (don't remove)
							if (prevMsg) {
								merged.push(prevMsg);
							}
						} else if (!prevMsg) {
							// New message - add it
							merged.push(newMsg);
							hasChanges = true;
						} else {
							// Both exist - check if changed
							const changed =
								prevMsg.content !== newMsg.content ||
								prevMsg.timestamp !== newMsg.timestamp ||
								prevMsg.status !== newMsg.status ||
								prevMsg.sender !== newMsg.sender;

							if (changed) {
								merged.push(newMsg);
								hasChanges = true;
							} else {
								// No change - keep the previous one to maintain reference stability
								merged.push(prevMsg);
							}
						}
					}

					// Sort by timestamp (oldest first for chat display)
					merged.sort((a, b) => {
						const timeA = new Date(a.timestamp || 0).getTime();
						const timeB = new Date(b.timestamp || 0).getTime();
						return timeA - timeB;
					});

					// Only update if something changed
					return hasChanges || merged.length !== prevMessages.length ?
							{
								...prev,
								[conversationId]: merged,
							}
						:	prev;
				});

				setLastMessageFetch((prev) => ({
					...prev,
					[conversationId]: Date.now(),
				}));
			} catch (err) {
				const errorMessage =
					err instanceof Error ?
						err.message
					:	"Something went wrong fetching messages.";

				// Preserve existing messages on error (don't clear)
				setMessages((prev) => {
					const existingMessages = prev[conversationId] ?? [];
					if (existingMessages.length > 0) {
						return prev;
					}
					return prev;
				});

				setError(errorMessage);

				if (!silent) {
					customToast.error({
						title: "WhatsApp Error",
						description: errorMessage,
					});
				}
			} finally {
				if (!silent) {
					setIsLoadingMessages(false);
				}
			}
		},
		[backendHeaders, normalizeTimestamp, whatsappBackendBaseUrl, user?.id],
	);

	/**
	 * Handle manual refresh
	 */
	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await Promise.all([
			fetchConversations(false),
			selectedConversation ?
				fetchMessages(selectedConversation, false)
			:	Promise.resolve(),
		]);
		setIsRefreshing(false);
		customToast.success({
			title: "Refreshed",
			description: "Conversations and messages updated",
		});
	}, [fetchConversations, fetchMessages, selectedConversation]);

	/**
	 * Send a message
	 */
	const handleSendMessage = useCallback(async () => {
		if (!inputMessage.trim() || !selectedConversation) return;

		const conv = conversations.find((c) => c.id === selectedConversation);
		if (!conv || !conv.clientPhone) {
			customToast.error({
				title: "Error",
				description: "Invalid conversation or phone number",
			});
			return;
		}

		setIsSending(true);

		try {
			// Normalize phone number (remove + and spaces)
			const normalizedPhone = normalizePhoneNumber(conv.clientPhone);

			// Validate phone number format
			if (
				!normalizedPhone ||
				normalizedPhone.length < 10 ||
				normalizedPhone.length > 15
			) {
				throw new Error(
					`Invalid phone number format: ${conv.clientPhone}. Phone number must be 10-15 digits.`,
				);
			}

			if (!user?.id) {
				customToast.error({
					title: "Error",
					description: "You must be signed in to send messages.",
				});
				return;
			}

			const payload = {
				to: normalizedPhone,
				type: "text",
				message: inputMessage.trim(),
				paId: user.id,
			};

			const response = await fetch(`${whatsappBackendBaseUrl}/messages`, {
				method: "POST",
				headers: backendHeaders,
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				// Handle different error formats
				let errorMessage = "Unable to send WhatsApp message";
				if (body?.error) {
					if (typeof body.error === "string") {
						errorMessage = body.error;
					} else if (body.error.message) {
						errorMessage = body.error.message;
					} else if (body.error.error?.message) {
						errorMessage = body.error.error.message;
					}
				}

				// Check for specific error about phone number ID
				if (
					errorMessage.includes("phoneNumberId") ||
					errorMessage.includes("META_PHONE_NUMBER_ID")
				) {
					errorMessage =
						"Backend configuration error: WhatsApp Phone Number ID is not set. Please contact administrator.";
				}

				throw new Error(errorMessage);
			}

			const data = await response.json();
			const messageId =
				data?.messageId ??
				data?.id ??
				`msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
			const now = new Date();
			const timestamp = normalizeTimestamp(now);
			const timestampValue = now.getTime();

			const newMessage: ChatMessage = {
				id: messageId,
				messageId: messageId, // Store WhatsApp message ID for status tracking
				conversationId: selectedConversation,
				sender: "pa",
				content: inputMessage.trim(),
				timestamp,
				timestampValue,
				status: "sent",
				platform: "whatsapp",
			};

			// Optimistically update UI
			setMessages((prev) => ({
				...prev,
				[selectedConversation]: [...(prev[selectedConversation] ?? []), newMessage],
			}));

			// Update conversation last message
			// Update conversation last message
			setConversations((prev) =>
				prev.map((c) =>
					c.id === selectedConversation ?
						{
							...c,
							lastMessage: inputMessage.trim(),
							lastMessageTime: timestamp,
						}
					:	c,
				),
			);

			setInputMessage("");
			customToast.success({
				title: "Message Sent",
				description: "Message sent via WhatsApp Business API",
			});

			// Refresh messages after a short delay
			setTimeout(() => {
				void fetchMessages(selectedConversation, true);
			}, 1000);
		} catch (err) {
			// console.error("Error sending message:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to send message";
			customToast.error({
				title: "Error",
				description: errorMessage,
			});
		} finally {
			setIsSending(false);
		}
	}, [
		inputMessage,
		selectedConversation,
		conversations,
		user?.id,
		backendHeaders,
		normalizeTimestamp,
		normalizePhoneNumber,
		whatsappBackendBaseUrl,
		fetchMessages,
	]);

	const handleAssignToMe = async () => {
		if (!selectedConversation || !user?.id) return;
		const conv = conversations.find((c) => c.id === selectedConversation);
		if (!conv?.clientPhone) return;

		try {
			const phone = conv.clientPhone.replace(/\D/g, "");
			const userRes = await api.get("/users", { params: { phone } });
			const targetUser = userRes.data?.data?.users?.[0] || userRes.data?.data?.[0];

			if (!targetUser) {
				customToast.error("User not found in system");
				return;
			}

			// Assign in core backend (PA assignment + conversation)
			await api.post(`/pas/${user.id}/assign`, {
				userId: targetUser.id,
			});

			// Sync assignment to WhatsApp backend so this PA can send messages
			const assignRes = await fetch(`${whatsappBackendBaseUrl}/livechat/assign`, {
				method: "POST",
				headers: backendHeaders,
				body: JSON.stringify({ phone: conv.clientPhone, paId: user.id }),
			});
			if (!assignRes.ok) {
				const body = await assignRes.json().catch(() => ({}));
				throw new Error(body?.error ?? "WhatsApp backend sync failed");
			}

			customToast.success("User assigned to you successfully");
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Failed to assign user";
			customToast.error(msg);
		}
	};

	const handleResolve = async () => {
		if (!selectedConversation || !user?.id) return;
		const conv = conversations.find((c) => c.id === selectedConversation);
		if (!conv?.clientPhone) return;

		try {
			const phone = conv.clientPhone.replace(/\D/g, "");
			const userRes = await api.get("/users", { params: { phone } });
			const targetUser = userRes.data?.data?.users?.[0] || userRes.data?.data?.[0];

			if (!targetUser) {
				customToast.error("User not found");
				return;
			}

			await api.post(`/pas/${user.id}/unassign/${targetUser.id}`, {
				reason: "Resolved via Live Chat",
			});

			customToast.success("Marked as resolved (Unassigned)");
		} catch (e) {
			customToast.error(
				e instanceof Error ? e.message : "Failed to mark as resolved",
			);
		}
	};

	/**
	 * Handle conversation selection
	 */
	const handleSelectConversation = useCallback(
		(conversationId: string) => {
			setSelectedConversation(conversationId);
			void fetchMessages(conversationId, false);
		},
		[fetchMessages],
	);

	/**
	 * Handle close chat
	 */
	const handleCloseChat = async () => {
		if (!selectedConversation) return;

		const conv = conversations.find((c) => c.id === selectedConversation);
		if (!conv) return;

		try {
			// Call backend to end live chat session
			const response = await fetch(
				`${whatsappBackendBaseUrl}/livechat/${conv.clientPhone}/end`,
				{
					method: "POST",
					headers: backendHeaders,
				},
			);

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body?.error || "Failed to end live chat session");
			}

			customToast.success({
				title: "Chat Ended",
				description: `Live chat with ${conv.clientName} has been ended. User can now access the menu.`,
			});
		} catch (error) {
			// console.error("Error ending live chat:", error);
			customToast.error({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to end live chat session",
			});
		}

		setSelectedConversation(null);
		setInputMessage("");
	};

	/** Fetch listings when opening Send listing dialog (backend returns { data: { data: array, meta } }) */
	useEffect(() => {
		if (!offerListingOpen) return;
		let cancelled = false;
		setListingSearch("");
		(async () => {
			try {
				const res = await api.get("/listings", { params: { limit: 100 } });
				const raw = res.data?.data;
				const list =
					Array.isArray(raw) ? raw : (
						((raw && typeof raw === "object" && "data" in raw ?
							(raw as { data: unknown[] }).data
						:	[]) ?? [])
					);
				if (!cancelled) setListingsForOffer(Array.isArray(list) ? list : []);
			} catch {
				if (!cancelled) setListingsForOffer([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [offerListingOpen]);

	/** Fetch concierge items when opening Send concierge dialog (backend returns { data: { data: array, meta } }) */
	useEffect(() => {
		if (!offerConciergeOpen) return;
		let cancelled = false;
		setConciergeSearch("");
		(async () => {
			try {
				const res = await api.get("/concierge");
				const raw = res.data?.data;
				const list =
					Array.isArray(raw) ? raw : (
						((raw && typeof raw === "object" && "data" in raw ?
							(raw as { data: unknown[] }).data
						:	[]) ?? [])
					);
				if (!cancelled) setConciergeForOffer(Array.isArray(list) ? list : []);
			} catch {
				if (!cancelled) setConciergeForOffer([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [offerConciergeOpen]);

	const sendOffer = useCallback(
		async (type: "listing" | "concierge", id: string) => {
			if (!selectedConversation || !user?.id) return;
			const conv = conversations.find((c) => c.id === selectedConversation);
			if (!conv?.clientPhone) return;
			const to = conv.clientPhone.replace(/\D/g, "");
			setSendingOffer(true);
			try {
				const payload: Record<string, string | number> = {
					to,
					type,
					paId: user.id,
				};
				if (type === "listing") payload.listingId = id;
				else payload.conciergeItemId = id;
				const response = await fetch(`${whatsappBackendBaseUrl}/messages`, {
					method: "POST",
					headers: backendHeaders,
					body: JSON.stringify(payload),
				});
				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					throw new Error(
						body?.error?.message ?? body?.error ?? "Failed to send offer",
					);
				}
				customToast.success({
					title: "Offer sent",
					description:
						type === "listing" ?
							"Listing sent via WhatsApp."
						:	"Concierge offer sent via WhatsApp.",
				});
				if (type === "listing") setOfferListingOpen(false);
				else setOfferConciergeOpen(false);
				void fetchMessages(selectedConversation, true);
			} catch (err) {
				customToast.error({
					title: "Error",
					description: err instanceof Error ? err.message : "Failed to send offer",
				});
			} finally {
				setSendingOffer(false);
			}
		},
		[
			selectedConversation,
			conversations,
			user?.id,
			whatsappBackendBaseUrl,
			backendHeaders,
			fetchMessages,
		],
	);

	/** Fetch other PAs when opening Transfer dialog */
	useEffect(() => {
		if (!transferOpen || !user?.id) return;
		let cancelled = false;
		setTransferSearch("");
		(async () => {
			try {
				const res = await api.get("/pas", { params: { limit: 100 } });
				const raw = res.data?.data?.data ?? res.data?.data ?? res.data;
				const list: Array<{ id?: string; name?: string; email?: string }> =
					Array.isArray(raw) ? raw : (
						((raw && typeof raw === "object" && "data" in raw ?
							(raw as { data: Array<{ id?: string; name?: string; email?: string }> })
								.data
						:	[]) ?? [])
					);
				const others = list
					.filter(
						(pa): pa is { id: string; name?: string; email?: string } =>
							!!pa.id && pa.id !== user?.id,
					)
					.map((pa) => ({
						id: pa.id,
						name: pa.name ?? pa.email ?? "PA",
						email: pa.email,
					}));
				if (!cancelled) setOtherPAs(others);
			} catch {
				if (!cancelled) setOtherPAs([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [transferOpen, user?.id]);

	const handleTransfer = useCallback(
		async (toPaId: string) => {
			if (!selectedConversation || !user?.id || toPaId === user.id) return;
			const conv = conversations.find((c) => c.id === selectedConversation);
			if (!conv?.clientPhone) return;
			setTransferringToPaId(toPaId);
			try {
				const phone = conv.clientPhone.replace(/\D/g, "");
				const userRes = await api.get("/users", { params: { phone } });
				const targetUser =
					userRes.data?.data?.users?.[0] || userRes.data?.data?.[0];
				if (!targetUser) {
					customToast.error("User not found in system");
					return;
				}
				await api.post(`/pas/${user.id}/transfer`, {
					userId: targetUser.id,
					toPaId,
				});
				const transferRes = await fetch(
					`${whatsappBackendBaseUrl}/livechat/transfer`,
					{
						method: "POST",
						headers: backendHeaders,
						body: JSON.stringify({ phone: conv.clientPhone, toPaId }),
					},
				);
				if (!transferRes.ok) {
					const body = await transferRes.json().catch(() => ({}));
					throw new Error(body?.error ?? "WhatsApp backend sync failed");
				}
				customToast.success("Client transferred successfully");
				setTransferOpen(false);
				setSelectedConversation(null);
				void fetchConversations(false);
			} catch (err) {
				customToast.error(
					err instanceof Error ? err.message : "Failed to transfer",
				);
			} finally {
				setTransferringToPaId(null);
			}
		},
		[
			selectedConversation,
			conversations,
			user?.id,
			whatsappBackendBaseUrl,
			backendHeaders,
			fetchConversations,
		],
	);

	// Initial fetch on mount
	useEffect(() => {
		void fetchConversations(false);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Set up polling for conversations
	useEffect(() => {
		// Clear existing interval
		if (conversationsPollRef.current) {
			clearInterval(conversationsPollRef.current);
		}

		// Set up new interval for polling conversations
		conversationsPollRef.current = setInterval(() => {
			void fetchConversations(true); // Silent fetch
		}, CONVERSATIONS_POLL_INTERVAL);

		// Cleanup on unmount
		return () => {
			if (conversationsPollRef.current) {
				clearInterval(conversationsPollRef.current);
			}
		};
	}, [fetchConversations]);

	// Set up polling for messages of selected conversation
	useEffect(() => {
		if (!selectedConversation) {
			// Clear interval if no conversation selected
			if (messagesPollRef.current) {
				clearInterval(messagesPollRef.current);
				messagesPollRef.current = null;
			}
			return;
		}

		// Clear existing interval
		if (messagesPollRef.current) {
			clearInterval(messagesPollRef.current);
		}

		// Set up new interval for polling messages
		messagesPollRef.current = setInterval(() => {
			void fetchMessages(selectedConversation, true); // Silent fetch
		}, MESSAGES_POLL_INTERVAL);

		// Cleanup on unmount or conversation change
		return () => {
			if (messagesPollRef.current) {
				clearInterval(messagesPollRef.current);
			}
		};
	}, [selectedConversation, fetchMessages]);

	// Fetch messages when conversation is selected
	useEffect(() => {
		if (selectedConversation) {
			void fetchMessages(selectedConversation, false);
			// Mark conversation as read when viewing
			const readUrl = new URL(
				`${whatsappBackendBaseUrl}/conversations/${selectedConversation}/read`,
			);
			if (user?.id) readUrl.searchParams.set("paId", user.id);
			void fetch(readUrl.toString(), {
				method: "POST",
				headers: backendHeaders,
			}).catch((err) => console.error("Error marking as read:", err));
		}
	}, [selectedConversation]); // eslint-disable-line react-hooks/exhaustive-deps

	// Auto-scroll to latest message
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [selectedMessages]);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "read":
				// Double blue checkmarks (read)
				return <CheckCheck className="size-3 text-blue-500 dark:text-blue-400" />;
			case "delivered":
				// Double gray checkmarks (delivered)
				return <CheckCheck className="size-3 text-zinc-500 dark:text-zinc-400" />;
			case "sent":
				// Single gray checkmark (sent)
				return (
					<svg
						className="size-3 text-zinc-500 dark:text-zinc-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="2">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				);
			default:
				// Clock icon for pending
				return <Clock className="size-3 text-zinc-500 dark:text-zinc-400" />;
		}
	};

	return (
		<Card className="flex-1 min-h-0 flex flex-row bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
			{/* Left panel: Conversation list (fixed width on desktop, full width on mobile if no chat selected) */}
			<div
				className={cn(
					"flex-shrink-0 flex flex-col min-h-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 transition-all",
					selectedConv ?
						"hidden md:flex md:w-[280px] lg:w-[320px]"
					:	"flex w-full md:w-[280px] lg:w-[320px]",
				)}>
				<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
					<div className="flex items-center justify-between gap-2">
						<div>
							<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
								Live Chat
							</h2>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
								Assigned to you · {conversations.length} conversation
								{conversations.length !== 1 ? "s" : ""}
							</p>
						</div>
						<Button
							variant="outline"
							size="icon"
							className="shrink-0"
							onClick={handleRefresh}
							disabled={isRefreshing}
							title="Refresh conversations">
							<RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-1 min-h-0">
					<div className="p-2 space-y-0.5">
						{error && (
							<div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3 mx-2 mb-2">
								{error}
							</div>
						)}
						{isLoadingConversations && !isRefreshing && (
							<div className="py-6 text-center text-sm text-zinc-500">Loading…</div>
						)}
						{!isLoadingConversations && conversations.length === 0 && (
							<div className="py-8 px-4 text-center">
								<UserCircle className="size-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									No conversations yet
								</p>
								<p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
									Conversations assigned to you will appear here
								</p>
							</div>
						)}
						{conversations.map((conv) => {
							const isSelected = selectedConversation === conv.id;
							const hasUnread = (conv.unreadCount ?? 0) > 0;
							return (
								<button
									key={conv.id}
									onClick={() => handleSelectConversation(conv.id)}
									className={cn(
										"w-full p-3 rounded-lg text-left transition-colors border border-transparent",
										isSelected ?
											"bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm"
										:	"hover:bg-white/80 dark:hover:bg-zinc-800/60",
									)}>
									<div className="flex items-center gap-3">
										<div className="relative shrink-0">
											<Avatar className="size-10 ring-2 ring-zinc-200 dark:ring-zinc-700">
												<AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-medium">
													{getInitials(conv.clientName)}
												</AvatarFallback>
											</Avatar>
											{/* Status indicator: green when unread, gray when read */}
											<span
												className={cn(
													"absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-zinc-50 dark:border-zinc-900",
													hasUnread ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-500",
												)}
												title={hasUnread ? "Unread" : "Read"}
											/>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-2">
												<span className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">
													{conv.clientName}
												</span>
												{hasUnread && (
													<Badge className="bg-green-500 text-white text-xs shrink-0">
														{conv.unreadCount}
													</Badge>
												)}
											</div>
											<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
												{conv.lastMessage || "No messages yet"}
											</p>
											<span className="text-xs text-zinc-400">{conv.lastMessageTime}</span>
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</ScrollArea>
			</div>

			{/* Right panel: Active chat window (takes remaining space, hidden on mobile if no chat selected) */}
			<div
				className={cn(
					"flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-zinc-950",
					!selectedConv && "hidden md:flex",
				)}>
				{selectedConv ?
					<>
						{/* Chat header: avatar, name, phone, actions */}
						<div className="shrink-0 border-b border-zinc-200 dark:border-zinc-800">
							<div className="p-4 flex items-center gap-2 sm:gap-3">
								<Button
									variant="ghost"
									size="icon"
									className="md:hidden shrink-0 -ml-2 mr-1 h-9 w-9 text-zinc-600 dark:text-zinc-400"
									onClick={() => setSelectedConversation(null)}>
									<ChevronLeft className="size-5" />
								</Button>
								<Avatar className="size-10 sm:size-12 shrink-0 ring-2 ring-zinc-200 dark:ring-zinc-700">
									<AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-medium">
										{getInitials(selectedConv.clientName)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
										{selectedConv.clientName ?? "WhatsApp Contact"}
									</h3>
									<div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
										<Phone className="size-3.5 shrink-0" />
										<span className="truncate font-mono">
											{selectedConv.clientPhone ?? "—"}
										</span>
									</div>
								</div>
							</div>

							{/* Action bar: Chat, offers, assign, transfer, resolve, end */}
							<div className="px-4 pb-3 flex flex-wrap items-center gap-2 mb-2">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() =>
										selectedConversation &&
										void fetchMessages(selectedConversation, false)
									}
									disabled={isLoadingMessages}
									title="Refresh messages">
									<RefreshCw
										className={cn("size-4", isLoadingMessages && "animate-spin")}
									/>
								</Button>
								<Separator
									orientation="vertical"
									className="h-6 hidden sm:block"
								/>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 text-xs"
									onClick={() => setOfferListingOpen(true)}
									disabled={sendingOffer}
									title="Send a property listing">
									<Building2 className="size-3.5" />
									<span className="hidden sm:inline">Listing</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 text-xs"
									onClick={() => setOfferConciergeOpen(true)}
									disabled={sendingOffer}
									title="Send a concierge offer">
									<Tag className="size-3.5" />
									<span className="hidden sm:inline">Concierge</span>
								</Button>
								<Separator
									orientation="vertical"
									className="h-6 hidden sm:block"
								/>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 text-xs"
									onClick={handleAssignToMe}
									title="Assign this client to you">
									<UserPlus className="size-3.5" />
									<span className="hidden md:inline">Assign to Me</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 text-xs"
									onClick={() => setTransferOpen(true)}
									title="Transfer to another PA">
									<UserRoundCog className="size-3.5" />
									<span className="hidden md:inline">Transfer</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 text-xs"
									onClick={handleResolve}
									title="Mark resolved and unassign">
									<Archive className="size-3.5" />
									<span className="hidden md:inline">Resolve</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 gap-1.5 text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
									onClick={handleCloseChat}
									title="End live chat session">
									End Chat
								</Button>
								<div className="hidden lg:block flex-1" />
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 w-8 p-0"
											title="More actions">
											<MoreVertical className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-48">
										<DropdownMenuItem onClick={() => setOfferListingOpen(true)}>
											<Building2 className="size-3.5 mr-2" />
											Send listing
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setOfferConciergeOpen(true)}>
											<Tag className="size-3.5 mr-2" />
											Send concierge
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleAssignToMe}>
											<UserPlus className="size-3.5 mr-2" />
											Assign to Me
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTransferOpen(true)}>
											<UserRoundCog className="size-3.5 mr-2" />
											Transfer to PA
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleResolve}>
											<Archive className="size-3.5 mr-2" />
											Resolve
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={handleCloseChat}
											className="text-red-600 dark:text-red-400">
											End Live Chat
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>

						{/* Scrollable messages area (takes most vertical space) */}
						<ScrollArea className="flex-1 min-h-0 p-4">
							<div className="space-y-4 mx-auto">
								{isLoadingMessages && !isRefreshing && (
									<p className="text-sm text-zinc-500 py-4">Fetching messages…</p>
								)}

								{!isLoadingMessages && selectedMessages.length === 0 && (
									<div className="py-12 text-center">
										<Sparkles className="size-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
										<p className="text-sm text-zinc-500 dark:text-zinc-400">
											No messages yet
										</p>
										<p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
											Send a message or share a listing or concierge offer
										</p>
									</div>
								)}

								{groupedMessages.map((group) => (
									<div
										key={group.date}
										className="space-y-4">
										{/* Date Header */}
										<div className="flex items-center justify-center my-4">
											<div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
												<span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
													{group.date}
												</span>
											</div>
										</div>

										{/* Messages for this date */}
										{group.messages.map((message) => (
											<div
												key={message.id}
												className={cn(
													"flex gap-2 lg:gap-3",
													message.sender === "pa" && "flex-row-reverse",
												)}>
												<Avatar className="size-8 shrink-0">
													<AvatarFallback
														className={cn(
															message.sender === "client" ?
																"bg-gradient-to-br from-green-600 to-emerald-600"
															: message.isBot ? "bg-zinc-500 dark:bg-zinc-600"
															: "bg-gradient-to-br from-violet-600 to-purple-600",
															"text-xs",
														)}>
														{message.sender === "client" ?
															getInitials(message.clientName ?? "Client")
														: message.isBot ?
															"SYS"
														:	"PA"}
													</AvatarFallback>
												</Avatar>

												<div
													className={cn(
														"flex flex-col max-w-[85%] lg:max-w-md",
														message.sender === "pa" && "items-end",
													)}>
													<div
														className={cn(
															"inline-block rounded-lg p-3 border",
															message.sender === "client" ?
																"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
															: message.isBot ?
																"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 italic"
															:	"bg-green-600 dark:bg-green-700 border-green-700 dark:border-green-800 text-white",
														)}>
														{message.isBot && (
															<div className="flex items-center gap-1 mb-1 text-xs font-medium uppercase tracking-wider opacity-70">
																<span>System Auto-Reply</span>
															</div>
														)}
														<p className="text-sm whitespace-pre-wrap leading-relaxed">
															{displayContent(message.content)}
														</p>
													</div>
													<div className="flex items-center gap-1 mt-1 px-1">
														<span className="text-xs text-zinc-500">{message.timestamp}</span>
														{message.sender === "pa" && getStatusIcon(message.status)}
													</div>
												</div>
											</div>
										))}
									</div>
								))}
								{/* Auto-scroll anchor */}
								<div ref={messagesEndRef} />
							</div>
						</ScrollArea>

						<Separator className="bg-zinc-200 dark:border-zinc-800" />

						{/* Composer + quick offers */}
						{selectedConv && (
							<div className="p-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800">
								<div className="flex gap-2 max-w-3xl mx-auto">
									<Input
										placeholder="Type your message..."
										value={inputMessage}
										disabled={isSending}
										onChange={(e) => setInputMessage(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												void handleSendMessage();
											}
										}}
										className="flex-1 rounded-xl bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-sm"
									/>
									<Button
										onClick={() => void handleSendMessage()}
										disabled={!inputMessage.trim() || isSending}
										className="bg-green-600 hover:bg-green-700 shrink-0 size-10 rounded-xl px-4">
										<Send className="size-4" />
									</Button>
								</div>
								<div className="flex flex-wrap items-center gap-2 mt-3 max-w-3xl mx-auto">
									<Button
										variant="ghost"
										size="sm"
										className="h-8 text-xs text-zinc-600 dark:text-zinc-400"
										onClick={() => setOfferListingOpen(true)}
										disabled={sendingOffer}>
										<Building2 className="size-3.5 mr-1.5" />
										Send listing
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 text-xs text-zinc-600 dark:text-zinc-400"
										onClick={() => setOfferConciergeOpen(true)}
										disabled={sendingOffer}>
										<Tag className="size-3.5 mr-1.5" />
										Send concierge
									</Button>
									<span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto flex items-center gap-1">
										<MessageCircle className="size-3 text-green-500" />
										WhatsApp Business API
									</span>
								</div>
							</div>
						)}
					</>
				:	<div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-zinc-50/50 dark:bg-zinc-900/30 border-l border-zinc-200 dark:border-zinc-800">
						<div className="text-center max-w-sm px-6">
							<div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-8 inline-block mb-5">
								<MessageCircle className="size-16 text-zinc-400 dark:text-zinc-500" />
							</div>
							<p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
								Select a conversation
							</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
								Choose a conversation from the list on the left to view messages and
								reply.
							</p>
						</div>
					</div>
				}
			</div>

			{/* Transfer to PA dialog */}
			<Dialog
				open={transferOpen}
				onOpenChange={setTransferOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserRoundCog className="size-5" />
							Transfer client to another PA
						</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						This client will be unassigned from you and assigned to the selected PA.
						They will be able to chat and send offers.
					</p>
					<div className="relative shrink-0">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
						<Input
							placeholder="Search PAs..."
							value={transferSearch}
							onChange={(e) => setTransferSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
					<ScrollArea className="max-h-[280px] -mx-2 px-2">
						<div className="space-y-1 py-2">
							{otherPAs.length === 0 && (
								<p className="text-sm text-zinc-500 py-4 text-center">
									No other PAs available.
								</p>
							)}
							{otherPAs
								.filter((pa) => {
									const q = transferSearch.trim().toLowerCase();
									if (!q) return true;
									return (
										(pa.name ?? "").toLowerCase().includes(q) ||
										(pa.email ?? "").toLowerCase().includes(q)
									);
								})
								.map((pa) => (
									<button
										key={pa.id}
										type="button"
										disabled={transferringToPaId !== null}
										onClick={() => void handleTransfer(pa.id)}
										className="w-full text-left rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors disabled:opacity-50 flex items-center gap-3">
										<Avatar className="size-9 shrink-0">
											<AvatarFallback className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-sm">
												{getInitials(pa.name || pa.email || "PA")}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium truncate">
												{pa.name || "Personal Assistant"}
											</p>
											{pa.email && (
												<p className="text-xs text-zinc-500 truncate">{pa.email}</p>
											)}
										</div>
										{transferringToPaId === pa.id && (
											<RefreshCw className="size-4 animate-spin text-zinc-500 shrink-0" />
										)}
									</button>
								))}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>

			{/* Send listing offer dialog */}
			<Dialog
				open={offerListingOpen}
				onOpenChange={setOfferListingOpen}>
				<DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Building2 className="size-5" />
							Send listing to client
						</DialogTitle>
					</DialogHeader>
					<div className="relative shrink-0">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
						<Input
							placeholder="Search listings..."
							value={listingSearch}
							onChange={(e) => setListingSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
					<ScrollArea className="flex-1 min-h-0 -mx-2 px-2">
						<div className="space-y-2 py-2">
							{listingsForOffer.length === 0 && (
								<p className="text-sm text-zinc-500 py-4">No listings available.</p>
							)}
							{listingsForOffer
								.filter((l) => {
									const q = listingSearch.trim().toLowerCase();
									if (!q) return true;
									return (
										(l.name ?? "").toLowerCase().includes(q) ||
										(l.propertyType ?? "").toLowerCase().includes(q) ||
										(l.city ?? "").toLowerCase().includes(q)
									);
								})
								.map((l) => {
									const sym = l.currency === "USD" ? "$" : "₦";
									const price = `${sym}${Number(l.pricePerNight || 0).toLocaleString()}/night`;
									const imgUrl = l.media?.[0]?.url;
									return (
										<button
											key={l.id}
											type="button"
											disabled={sendingOffer}
											onClick={() => void sendOffer("listing", l.id)}
											className="w-full text-left rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3">
											<div className="size-14 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
												{imgUrl ?
													<img
														src={imgUrl}
														alt=""
														className="size-full object-cover"
													/>
												:	<div className="size-full flex items-center justify-center">
														<ImageIcon className="size-6 text-zinc-400" />
													</div>
												}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium truncate">
													{l.name || "Listing"}
												</p>
												<p className="text-xs text-zinc-500">
													{l.propertyType ?? ""} · {price}
												</p>
											</div>
										</button>
									);
								})}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>

			{/* Send concierge offer dialog */}
			<Dialog
				open={offerConciergeOpen}
				onOpenChange={setOfferConciergeOpen}>
				<DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Tag className="size-5" />
							Send concierge offer to client
						</DialogTitle>
					</DialogHeader>
					<div className="relative shrink-0">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
						<Input
							placeholder="Search concierge..."
							value={conciergeSearch}
							onChange={(e) => setConciergeSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
					<ScrollArea className="flex-1 min-h-0 -mx-2 px-2">
						<div className="space-y-2 py-2">
							{conciergeForOffer.length === 0 && (
								<p className="text-sm text-zinc-500 py-4">
									No concierge items available.
								</p>
							)}
							{conciergeForOffer
								.filter((item) => {
									const q = conciergeSearch.trim().toLowerCase();
									if (!q) return true;
									return (
										(item.name ?? "").toLowerCase().includes(q) ||
										(item.category ?? "").toLowerCase().includes(q)
									);
								})
								.map((item) => {
									const sym = item.currency === "USD" ? "$" : "₦";
									const price = `${sym}${Number(item.price || 0).toLocaleString()}`;
									const imgUrl = item.mediaUrl;
									return (
										<button
											key={item.id}
											type="button"
											disabled={sendingOffer}
											onClick={() => void sendOffer("concierge", item.id)}
											className="w-full text-left rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3">
											<div className="size-14 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
												{imgUrl ?
													<img
														src={imgUrl}
														alt=""
														className="size-full object-cover"
													/>
												:	<div className="size-full flex items-center justify-center">
														<ImageIcon className="size-6 text-zinc-400" />
													</div>
												}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium truncate">
													{item.name || "Concierge"}
												</p>
												<p className="text-xs text-zinc-500">
													{item.category ?? ""} · {price}
												</p>
											</div>
										</button>
									);
								})}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
