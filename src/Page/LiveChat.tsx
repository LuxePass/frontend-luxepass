import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
	MessageCircle,
	Send,
	Phone,
	MoreVertical,
	CheckCheck,
	Clock,
	X,
} from "lucide-react";
import { cn } from "../utils";
import { customToast } from "./CustomToast";

interface ChatMessage {
	id: string;
	conversationId: string;
	sender: "client" | "pa";
	clientName?: string;
	content: string;
	timestamp: string;
	status: "sent" | "delivered" | "read";
	platform: "whatsapp";
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
};

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
	const [error, setError] = useState<string | null>(null);

	const whatsappBackendBaseUrl =
		import.meta.env.VITE_WHATSAPP_BACKEND_URL ?? "/api/whatsapp";
	const backendHeaders = useMemo(
		() => ({
			"Content-Type": "application/json",
		}),
		[]
	);

	const normalizeTimestamp = useCallback((timestamp?: string | number) => {
		if (!timestamp) return "";
		const numericTs =
			typeof timestamp === "string" ? Number(timestamp) : timestamp;
		if (Number.isNaN(numericTs)) return "";
		const date =
			numericTs < 10_000_000_000
				? new Date(numericTs * 1000)
				: new Date(numericTs);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}, []);

	const fetchConversations = useCallback(async () => {
		setIsLoadingConversations(true);
		setError(null);

		try {
			const response = await fetch(`${whatsappBackendBaseUrl}/conversations`, {
				headers: backendHeaders,
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body?.error?.message ?? "Unable to fetch conversations");
			}

			const payload = (await response.json()) as {
				data?: ConversationApiItem[];
			};
			const rawItems = Array.isArray(payload) ? payload : payload?.data ?? [];

			const normalized: ChatConversation[] = rawItems.map((conversation) => {
				const conv = conversation as ConversationApiItem;
				const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
				const timestamp =
					conv.lastMessageTime ??
					(conv.lastMessageTimestamp
						? normalizeTimestamp(conv.lastMessageTimestamp)
						: "");

				return {
					id: conv.id ?? fallbackId,
					clientName: conv.clientName ?? "WhatsApp User",
					clientPhone: conv.clientPhone ?? "Unknown",
					lastMessage: conv.lastMessage ?? "",
					lastMessageTime: timestamp,
					unreadCount: conv.unreadCount ?? 0,
					status: conv.status ?? "active",
				};
			});

			setConversations(normalized);
			if (normalized.length) {
				setSelectedConversation((prev) => prev ?? normalized[0].id);
			}
		} catch (err) {
			console.error(err);
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong fetching conversations."
			);
			customToast.error({
				title: "WhatsApp Error",
				description:
					err instanceof Error ? err.message : "Unable to load conversations.",
			});
		} finally {
			setIsLoadingConversations(false);
		}
	}, [backendHeaders, normalizeTimestamp, whatsappBackendBaseUrl]);

	const fetchMessages = useCallback(
		async (conversationId: string) => {
			setIsLoadingMessages(true);

			try {
				const response = await fetch(
					`${whatsappBackendBaseUrl}/conversations/${conversationId}/messages`,
					{
						headers: backendHeaders,
					}
				);

				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					throw new Error(body?.error?.message ?? "Unable to fetch messages");
				}

				const payload = (await response.json()) as {
					data?: MessageApiItem[];
				};
				const rawItems = Array.isArray(payload) ? payload : payload?.data ?? [];
				const normalizedMessages: ChatMessage[] = rawItems.map((message) => {
					const msg = message as MessageApiItem;
					const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

					return {
						id: msg.id ?? fallbackId,
						conversationId,
						sender: msg.sender ?? "client",
						clientName: msg.clientName,
						content: msg.content ?? "",
						timestamp:
							msg.timestamp ??
							(msg.timestampValue ? normalizeTimestamp(msg.timestampValue) : ""),
						status: msg.status ?? "sent",
						platform: msg.platform ?? "whatsapp",
					};
				});

				setMessages((prev) => ({
					...prev,
					[conversationId]: normalizedMessages,
				}));
			} catch (err) {
				console.error(err);
				setError(
					err instanceof Error
						? err.message
						: "Something went wrong fetching messages."
				);
				customToast.error({
					title: "WhatsApp Error",
					description:
						err instanceof Error ? err.message : "Unable to load messages.",
				});
			} finally {
				setIsLoadingMessages(false);
			}
		},
		[backendHeaders, normalizeTimestamp, whatsappBackendBaseUrl]
	);

	useEffect(() => {
		void fetchConversations();
	}, [fetchConversations]);

	useEffect(() => {
		if (!selectedConversation) return;
		void fetchMessages(selectedConversation);
	}, [fetchMessages, selectedConversation]);

	const handleSendMessage = useCallback(async () => {
		if (!inputMessage.trim() || !selectedConversation) return;

		const conv = conversations.find((c) => c.id === selectedConversation);
		if (!conv || !conv.clientPhone) return;

		setIsSending(true);

		try {
			const payload = {
				to: conv.clientPhone,
				conversationId: selectedConversation,
				message: inputMessage.trim(),
			};

			const response = await fetch(`${whatsappBackendBaseUrl}/messages`, {
				method: "POST",
				headers: backendHeaders,
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body?.error?.message ?? "Unable to send WhatsApp message");
			}

			const data = await response.json();
			const messageId = data?.id ?? Date.now().toString();
			const timestamp = new Date().toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			});

			const newMessage: ChatMessage = {
				id: messageId,
				conversationId: selectedConversation,
				sender: "pa",
				content: inputMessage.trim(),
				timestamp,
				status: "sent",
				platform: "whatsapp",
			};

			setMessages((prev) => ({
				...prev,
				[selectedConversation]: [...(prev[selectedConversation] ?? []), newMessage],
			}));

			setInputMessage("");
			customToast.success({
				title: "Message Sent",
				description: "Message sent via WhatsApp Business API",
			});
		} catch (err) {
			console.error(err);
			customToast.error({
				title: "WhatsApp Error",
				description:
					err instanceof Error ? err.message : "Failed to send WhatsApp message.",
			});
		} finally {
			setIsSending(false);
		}
	}, [
		backendHeaders,
		conversations,
		inputMessage,
		selectedConversation,
		whatsappBackendBaseUrl,
	]);

	const handleCloseChat = () => {
		if (!selectedConversation) return;

		const conv = conversations.find((c) => c.id === selectedConversation);
		if (conv) {
			customToast.success({
				title: "Chat Closed",
				description: `Conversation with ${conv.clientName} has been closed`,
			});
		}

		// Clear the selected conversation
		setSelectedConversation(null);
		setInputMessage("");
	};

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
				return <CheckCheck className="size-3 text-blue-400" />;
			case "delivered":
				return <CheckCheck className="size-3 text-zinc-500" />;
			default:
				return <Clock className="size-3 text-zinc-500" />;
		}
	};

	const selectedConv = conversations.find((c) => c.id === selectedConversation);
	const selectedMessages = selectedConversation
		? messages[selectedConversation] ?? []
		: [];

	return (
		<Card className="h-full flex flex-col lg:flex-row bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<div
				className={cn(
					"w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 lg:h-full",
					showChat && "hidden lg:flex"
				)}>
				<div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
					<div className="flex items-center gap-2 mb-1">
						<MessageCircle className="size-5 text-green-500 dark:text-green-400" />
						<h3 className="text-base lg:text-lg">WhatsApp Live Chat</h3>
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
							<div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
								{error}
							</div>
						)}

						{isLoadingConversations && (
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
								onClick={() => {
									setSelectedConversation(conv.id);
									setShowChat(true);
								}}
								className={cn(
									"w-full p-3 rounded-lg text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
									selectedConversation === conv.id &&
										"bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
								)}>
								<div className="flex items-start gap-3">
									<Avatar className="size-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
										<AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600">
											{getInitials(conv.clientName)}
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
								{selectedConv && (
									<Avatar className="size-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
										<AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600">
											{getInitials(selectedConv.clientName)}
										</AvatarFallback>
									</Avatar>
								)}
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
									className="hidden lg:flex size-8 p-0 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
									onClick={handleCloseChat}
									title="Close Chat">
									<X className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="size-8 p-0">
									<MoreVertical className="size-4" />
								</Button>
							</div>
						</div>

						{/* Messages */}
						<ScrollArea className="flex-1 p-3 lg:p-4 min-h-0">
							<div className="space-y-4">
								{isLoadingMessages && (
									<p className="text-xs text-zinc-500">Fetching messages…</p>
								)}

								{!isLoadingMessages && selectedMessages.length === 0 && (
									<p className="text-xs text-zinc-500">No messages exchanged yet.</p>
								)}

								{selectedMessages.map((message) => (
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
														: "bg-gradient-to-br from-violet-600 to-purple-600",
													"text-xs"
												)}>
												{message.sender === "client"
													? getInitials(message.clientName ?? "Client")
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
														? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
														: "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-800"
												)}>
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
						</ScrollArea>

						<Separator className="bg-zinc-200 dark:bg-zinc-800" />

						{/* Input */}
						<div className="p-3 lg:p-4 shrink-0">
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
