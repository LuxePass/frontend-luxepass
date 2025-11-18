/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
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

const mockConversations: ChatConversation[] = [
	{
		id: "1",
		clientName: "Chidinma Okonkwo",
		clientPhone: "+234 (0)803 456 7890",
		lastMessage: "Thank you! Looking forward to the reservation.",
		lastMessageTime: "2 min ago",
		unreadCount: 2,
		status: "active",
	},
	{
		id: "2",
		clientName: "Emeka Adeleke",
		clientPhone: "+234 (0)805 123 4567",
		lastMessage: "Can you help me with the property viewing schedule?",
		lastMessageTime: "15 min ago",
		unreadCount: 1,
		status: "active",
	},
	{
		id: "3",
		clientName: "Amara Nwosu",
		clientPhone: "+234 (0)816 789 0123",
		lastMessage: "Perfect, thank you so much!",
		lastMessageTime: "1 hour ago",
		unreadCount: 0,
		status: "active",
	},
	{
		id: "4",
		clientName: "Ngozi Adekunle",
		clientPhone: "+234 (0)809 345 6789",
		lastMessage: "The art gallery viewing was amazing!",
		lastMessageTime: "3 hours ago",
		unreadCount: 0,
		status: "active",
	},
	{
		id: "5",
		clientName: "Chukwudi Okafor",
		clientPhone: "+234 (0)818 234 5678",
		lastMessage: "Wine collection arrived safely, thanks!",
		lastMessageTime: "5 hours ago",
		unreadCount: 0,
		status: "active",
	},
];

const mockMessages: { [conversationId: string]: ChatMessage[] } = {
	"1": [
		{
			id: "1-1",
			conversationId: "1",
			sender: "client",
			clientName: "Chidinma Okonkwo",
			content: "Hi! I need help with a dinner reservation for this Friday.",
			timestamp: "14:25",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "1-2",
			conversationId: "1",
			sender: "pa",
			content:
				"Hello Chidinma! I'd be happy to help. What type of cuisine are you interested in, and how many guests?",
			timestamp: "14:26",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "1-3",
			conversationId: "1",
			sender: "client",
			clientName: "Chidinma Okonkwo",
			content: "Fine dining would be great. Party of 4, around 7 PM.",
			timestamp: "14:27",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "1-4",
			conversationId: "1",
			sender: "pa",
			content:
				"Excellent choice! I'll secure a reservation at Le Bernardin for you. They have a wonderful private dining area. I'll confirm within the hour.",
			timestamp: "14:28",
			status: "delivered",
			platform: "whatsapp",
		},
		{
			id: "1-5",
			conversationId: "1",
			sender: "client",
			clientName: "Chidinma Okonkwo",
			content: "Thank you! Looking forward to the reservation.",
			timestamp: "14:30",
			status: "sent",
			platform: "whatsapp",
		},
	],
	"2": [
		{
			id: "2-1",
			conversationId: "2",
			sender: "client",
			clientName: "Emeka Adeleke",
			content: "Good morning! I need to reschedule my property viewings.",
			timestamp: "09:15",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "2-2",
			conversationId: "2",
			sender: "pa",
			content:
				"Good morning Emeka! Of course, I can help you with that. Which properties would you like to reschedule?",
			timestamp: "09:17",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "2-3",
			conversationId: "2",
			sender: "client",
			clientName: "Emeka Adeleke",
			content: "Can you help me with the property viewing schedule?",
			timestamp: "09:20",
			status: "read",
			platform: "whatsapp",
		},
	],
	"3": [
		{
			id: "3-1",
			conversationId: "3",
			sender: "client",
			clientName: "Amara Nwosu",
			content: "Hi! Just confirming my private jet booking to Aspen.",
			timestamp: "11:30",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "3-2",
			conversationId: "3",
			sender: "pa",
			content:
				"Hello Amara! Your jet is confirmed for tomorrow at 2:00 PM. I've sent all the details to your email.",
			timestamp: "11:32",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "3-3",
			conversationId: "3",
			sender: "client",
			clientName: "Amara Nwosu",
			content: "Perfect, thank you so much!",
			timestamp: "11:35",
			status: "read",
			platform: "whatsapp",
		},
	],
	"4": [
		{
			id: "4-1",
			conversationId: "4",
			sender: "client",
			clientName: "Ngozi Adekunle",
			content: "The art gallery viewing was amazing! Thank you for arranging it.",
			timestamp: "16:45",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "4-2",
			conversationId: "4",
			sender: "pa",
			content:
				"I'm so glad you enjoyed it, Ngozi! The curator was thrilled to host you.",
			timestamp: "16:50",
			status: "delivered",
			platform: "whatsapp",
		},
	],
	"5": [
		{
			id: "5-1",
			conversationId: "5",
			sender: "client",
			clientName: "Chukwudi Okafor",
			content: "Wine collection arrived safely, thanks!",
			timestamp: "13:20",
			status: "read",
			platform: "whatsapp",
		},
		{
			id: "5-2",
			conversationId: "5",
			sender: "pa",
			content:
				"Wonderful! Enjoy the collection. Let me know if you need anything else.",
			timestamp: "13:25",
			status: "read",
			platform: "whatsapp",
		},
	],
};

export function LiveChat() {
	const [conversations, setConversations] = useState(mockConversations);
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>("1");
	const [inputMessage, setInputMessage] = useState("");
	const [showChat, setShowChat] = useState(false);

	const handleSendMessage = () => {
		if (!inputMessage.trim() || !selectedConversation) return;

		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			conversationId: selectedConversation,
			sender: "pa",
			content: inputMessage,
			timestamp: new Date().toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: "sent",
			platform: "whatsapp",
		};

		// Add message to the conversation
		if (mockMessages[selectedConversation]) {
			mockMessages[selectedConversation].push(newMessage);
		}

		setInputMessage("");
		customToast.success({
			title: "Message Sent",
			description: "Message sent via WhatsApp Business API",
		});
	};

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

	return (
		<Card className="h-full flex flex-col lg:flex-row bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden">
			{/* Conversations List */}
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
					<div className="p-2">
						{conversations.map((conv) => (
							<button
								key={conv.id}
								onClick={() => {
									setSelectedConversation(conv.id);
									setShowChat(true);
								}}
								className={cn(
									"w-full p-3 rounded-lg text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80 mb-1",
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
								<Avatar className="size-10 border border-zinc-300 dark:border-zinc-700 shrink-0">
									<AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600">
										{getInitials(selectedConv.clientName)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="text-sm lg:text-base truncate">
										{selectedConv.clientName}
									</p>
									<div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
										<Phone className="size-3" />
										<span className="truncate">{selectedConv.clientPhone}</span>
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
								{(mockMessages[selectedConversation] || []).map((message) => (
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
													? getInitials(message.clientName!)
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
									onChange={(e) => setInputMessage(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
									className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-sm"
								/>
								<Button
									onClick={handleSendMessage}
									disabled={!inputMessage.trim()}
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
