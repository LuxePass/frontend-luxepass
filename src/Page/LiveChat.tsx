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
	X,
	RefreshCw,
	UserPlus,
	Archive,
} from "lucide-react";
import { cn } from "../utils";
import { customToast } from "./CustomToast";

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
	const [showChat, setShowChat] = useState(false);
	const [isLoadingConversations, setIsLoadingConversations] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastConversationFetch, setLastConversationFetch] = useState<number>(0);
	const [lastMessageFetch, setLastMessageFetch] = useState<
		Record<string, number>
	>({});

	const { user } = useAuth();

	// Refs for polling intervals
	const conversationsPollRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);
	const messagesPollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

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
							numericTs < 10_000_000_000
								? new Date(numericTs * 1000)
								: new Date(numericTs);
					} else {
						return "";
					}
				}
			} else {
				const numericTs = timestamp;
				date =
					numericTs < 10_000_000_000
						? new Date(numericTs * 1000)
						: new Date(numericTs);
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
		[]
	);

	const groupMessagesByDate = useCallback(
		(
			messages: ChatMessage[]
		): Array<{ date: string; messages: ChatMessage[] }> => {
			const groups: Map<string, ChatMessage[]> = new Map();

			messages.forEach((message) => {
				// Get timestamp value from message
				let timestampValue: number | null = null;

				if (message.timestampValue) {
					timestampValue =
						typeof message.timestampValue === "string"
							? Number(message.timestampValue)
							: message.timestampValue;
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
		[getDateLabel]
	);

	const whatsappBackendBaseUrl =
		import.meta.env.VITE_WHATSAPP_BACKEND_URL ??
		"https://whatsapp-backend-ix4v.onrender.com/api";

	const backendHeaders = useMemo(
		() => ({
			"Content-Type": "application/json",
		}),
		[]
	);

	const selectedConv = conversations.find((c) => c.id === selectedConversation);
	const selectedMessages = selectedConversation
		? messages[selectedConversation] ?? []
		: [];

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
							numericTs < 10_000_000_000
								? new Date(numericTs * 1000)
								: new Date(numericTs);
					} else {
						return "";
					}
				}
			} else {
				// Number timestamp
				const numericTs = timestamp;
				date =
					numericTs < 10_000_000_000
						? new Date(numericTs * 1000)
						: new Date(numericTs);
			}

			if (isNaN(date.getTime())) {
				return "";
			}

			return date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			});
		},
		[]
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
				const response = await fetch(`${whatsappBackendBaseUrl}/conversations`, {
					headers: backendHeaders,
					method: "GET",
				});

				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					const errorMessage =
						body?.error?.message || body?.error || "Unable to fetch conversations";
					throw new Error(errorMessage);
				}

				const payload = (await response.json()) as {
					success?: boolean;
					data?: ConversationApiItem[];
					error?: string;
				};

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
						(conv.clientPhone
							? conv.clientPhone.replace(/\D/g, "")
							: `${Date.now()}-${Math.random().toString(36).slice(2)}`);
					const timestamp =
						conv.lastMessageTime ??
						(conv.lastMessageTimestamp
							? normalizeTimestamp(conv.lastMessageTimestamp)
							: "");

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
				console.error("Error fetching conversations:", err);
				const errorMessage =
					err instanceof Error
						? err.message
						: "Something went wrong fetching conversations.";

				// Only set error if we don't have existing data (don't clear on refresh errors)
				setConversations((prev) => {
					// If we have existing conversations, keep them and just log the error
					if (prev.length > 0) {
						console.warn(
							"Failed to refresh conversations, keeping existing data:",
							errorMessage
						);
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
		]
	);

	/**
	 * Fetch messages for a specific conversation
	 */
	const fetchMessages = useCallback(
		async (conversationId: string, silent = false) => {
			if (!conversationId) return;

			if (!silent) {
				setIsLoadingMessages(true);
			}

			try {
				const response = await fetch(
					`${whatsappBackendBaseUrl}/conversations/${conversationId}/messages`,
					{
						headers: backendHeaders,
						method: "GET",
					}
				);

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
							typeof msg.timestampValue === "string"
								? Number(msg.timestampValue)
								: msg.timestampValue;

						if (!isNaN(timestampValue)) {
							// Convert to Date and format
							const date =
								timestampValue < 10_000_000_000
									? new Date(timestampValue * 1000)
									: new Date(timestampValue);
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
					return hasChanges || merged.length !== prevMessages.length
						? {
								...prev,
								[conversationId]: merged,
						  }
						: prev;
				});

				setLastMessageFetch((prev) => ({
					...prev,
					[conversationId]: Date.now(),
				}));
			} catch (err) {
				console.error("Error fetching messages:", err);
				const errorMessage =
					err instanceof Error
						? err.message
						: "Something went wrong fetching messages.";

				// Preserve existing messages on error (don't clear)
				setMessages((prev) => {
					const existingMessages = prev[conversationId] ?? [];
					if (existingMessages.length > 0) {
						console.warn(
							"Failed to refresh messages, keeping existing data:",
							errorMessage
						);
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
		[backendHeaders, normalizeTimestamp, whatsappBackendBaseUrl]
	);

	/**
	 * Handle manual refresh
	 */
	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await Promise.all([
			fetchConversations(false),
			selectedConversation
				? fetchMessages(selectedConversation, false)
				: Promise.resolve(),
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
					`Invalid phone number format: ${conv.clientPhone}. Phone number must be 10-15 digits.`
				);
			}

			const payload = {
				to: normalizedPhone,
				type: "text",
				message: inputMessage.trim(),
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
					c.id === selectedConversation
						? {
								...c,
								lastMessage: inputMessage.trim(),
								lastMessageTime: timestamp,
						  }
						: c
				)
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
			console.error("Error sending message:", err);
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

			await api.post(`/pas/${user.id}/assign`, {
				userId: targetUser.id,
			});

			customToast.success("User assigned to you successfully");
		} catch (err) {
			console.error("Assignment failed", err);
			customToast.error("Failed to assign user");
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
		} catch (err) {
			console.error("Resolution failed", err);
			customToast.error("Failed to mark as resolved");
		}
	};

	/**
	 * Handle conversation selection
	 */
	const handleSelectConversation = useCallback(
		(conversationId: string) => {
			setSelectedConversation(conversationId);
			setShowChat(true);
			// Fetch messages immediately when conversation is selected
			void fetchMessages(conversationId, false);
		},
		[fetchMessages]
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
				}
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
			console.error("Error ending live chat:", error);
			customToast.error({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to end live chat session",
			});
		}

		setSelectedConversation(null);
		setInputMessage("");
	};

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
			void fetch(
				`${whatsappBackendBaseUrl}/conversations/${selectedConversation}/read`,
				{
					method: "POST",
					headers: backendHeaders,
				}
			).catch((err) => console.error("Error marking as read:", err));
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
		<Card className="h-full flex flex-col lg:flex-row bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden">
			{/* Conversations List */}
			<div
				className={cn(
					"w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 lg:h-full",
					showChat && "hidden lg:flex"
				)}>
				<div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-2">
							<MessageCircle className="size-5 text-green-500 dark:text-green-400" />
							<h3 className="text-base lg:text-lg">WhatsApp Live Chat</h3>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="size-8 p-0"
							onClick={handleRefresh}
							disabled={isRefreshing}
							title="Refresh conversations">
							<RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
						</Button>
					</div>
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						{conversations.filter((c) => c.unreadCount > 0).length} unread
						conversation
						{conversations.filter((c) => c.unreadCount > 0).length !== 1 ? "s" : ""}
					</p>
				</div>

				<ScrollArea className="flex-1 min-h-0">
					<div className="p-2 space-y-2">
						{error && (
							<div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-md p-3">
								{error}
							</div>
						)}

						{isLoadingConversations && !isRefreshing && (
							<div className="text-xs text-zinc-500">Loading conversations…</div>
						)}

						{!isLoadingConversations && conversations.length === 0 && (
							<div className="text-xs text-zinc-500">
								No WhatsApp conversations yet.
							</div>
						)}

						{conversations.map((conv) => (
							<button
								key={conv.id}
								onClick={() => handleSelectConversation(conv.id)}
								className={cn(
									"w-full p-3 rounded-lg text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
									selectedConversation === conv.id &&
										"bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
								)}>
								<div className="flex items-start gap-3">
									<Avatar className="size-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
										<AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600">
											<UserCircle />
										</AvatarFallback>
									</Avatar>

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<span className="text-sm truncate">{conv.clientName}</span>
											{conv.unreadCount > 0 && (
												<Badge className="bg-green-600 hover:bg-green-600 ml-2 text-xs">
													{conv.unreadCount}
												</Badge>
											)}
										</div>
										<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-1">
											{conv.lastMessage}
										</p>
										<span className="text-xs text-zinc-500">{conv.lastMessageTime}</span>
									</div>
								</div>
							</button>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Chat Area */}
			<div
				className={cn(
					"flex-1 flex flex-col min-h-0 h-full lg:h-auto",
					!showChat && "hidden lg:flex"
				)}>
				{selectedConv ? (
					<>
						{/* Chat Header */}
						<div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<Button
									variant="ghost"
									size="sm"
									className="lg:hidden shrink-0 size-9 p-0"
									onClick={() => setShowChat(false)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round">
										<path d="m15 18-6-6 6-6" />
									</svg>
								</Button>
								<Avatar className="size-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
									<AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600">
										{getInitials(selectedConv.clientName)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="text-sm lg:text-base truncate">
										{selectedConv?.clientName ?? "WhatsApp Contact"}
									</p>
									<div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
										<Phone className="size-3" />
										<span className="truncate">
											{selectedConv?.clientPhone ?? "Unknown number"}
										</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1 shrink-0">
								<Button
									variant="ghost"
									size="sm"
									className="size-8 p-0"
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
								<Button
									variant="outline"
									size="sm"
									className="hidden lg:flex h-8 px-3 text-xs gap-2"
									onClick={handleAssignToMe}>
									<UserPlus className="size-3.5" />
									Assign to Me
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="hidden lg:flex h-8 px-3 text-xs gap-2"
									onClick={handleResolve}>
									<Archive className="size-3.5" />
									Resolve
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="hidden lg:flex h-8 px-3 text-xs bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
									onClick={handleCloseChat}
									title="End live chat session and return user to menu">
									End Live Chat
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="hidden lg:flex size-8 p-0"
									onClick={() => setShowChat(false)}
									title="Close chat window (doesn't end session)">
									<X className="size-4" />
								</Button>
							</div>
						</div>

						{/* Messages */}
						<ScrollArea className="flex-1 p-3 lg:p-4 min-h-0">
							<div className="space-y-4">
								{isLoadingMessages && !isRefreshing && (
									<p className="text-xs text-zinc-500">Fetching messages…</p>
								)}

								{!isLoadingMessages && selectedMessages.length === 0 && (
									<p className="text-xs text-zinc-500">No messages exchanged yet.</p>
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
													message.sender === "pa" && "flex-row-reverse"
												)}>
												<Avatar className="size-8 shrink-0">
													<AvatarFallback
														className={cn(
															message.sender === "client"
																? "bg-gradient-to-br from-green-600 to-emerald-600"
																: message.isBot
																? "bg-zinc-500 dark:bg-zinc-600"
																: "bg-gradient-to-br from-violet-600 to-purple-600",
															"text-xs"
														)}>
														{message.sender === "client"
															? getInitials(message.clientName ?? "Client")
															: message.isBot
															? "SYS"
															: "PA"}
													</AvatarFallback>
												</Avatar>

												<div
													className={cn(
														"flex flex-col max-w-[85%] lg:max-w-md",
														message.sender === "pa" && "items-end"
													)}>
													<div
														className={cn(
															"inline-block rounded-lg p-3 border",
															message.sender === "client"
																? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
																: message.isBot
																? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 italic"
																: "bg-green-600 dark:bg-green-700 border-green-700 dark:border-green-800 text-white"
														)}>
														{message.isBot && (
															<div className="flex items-center gap-1 mb-1 text-xs font-medium uppercase tracking-wider opacity-70">
																<span>System Auto-Reply</span>
															</div>
														)}
														<p className="text-sm whitespace-pre-wrap leading-relaxed">
															{message.content}
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

						{/* Input - Only show if user has requested live support */}
						{selectedConv && (
							<div className="p-3 lg:p-4 shrink-0">
								{/* Check if this is a live support conversation - you may need to add this field to your conversation data */}
								<div className="flex gap-2">
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
										className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-sm"
									/>
									<Button
										onClick={() => void handleSendMessage()}
										disabled={!inputMessage.trim() || isSending}
										className="bg-green-600 hover:bg-green-700 shrink-0 size-9 lg:size-10 p-0">
										<Send className="size-4" />
									</Button>
								</div>
								<p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
									<MessageCircle className="size-3 text-green-500" />
									Messages sent via WhatsApp Business API
								</p>
							</div>
						)}
					</>
				) : (
					<div className="flex-1 flex items-center justify-center p-8">
						<div className="text-center">
							<MessageCircle className="size-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
							<p className="text-zinc-400">Select a conversation to start chatting</p>
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}
