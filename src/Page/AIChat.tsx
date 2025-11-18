import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
	Sparkles,
	Send,
	Copy,
	ThumbsUp,
	RotateCw,
	FileText,
	Lightbulb,
	MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../utils";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
}

interface AIChatProps {
	selectedClient: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AIChat({ selectedClient }: AIChatProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content:
				"Hello! I'm your AI assistant. I can help you draft responses, summarize email threads, or brainstorm ideas for your clients. How can I assist you today?",
			timestamp: "14:30",
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);

	const quickActions = [
		{
			icon: MessageSquare,
			label: "Draft Response",
			prompt: "Help me draft a professional response to ",
		},
		{
			icon: FileText,
			label: "Summarize Thread",
			prompt: "Summarize the following email thread: ",
		},
		{
			icon: Lightbulb,
			label: "Brainstorm Ideas",
			prompt: "Help me brainstorm ideas for ",
		},
	];

	const handleSend = () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			// eslint-disable-next-line react-hooks/purity
			id: Date.now().toString(),
			role: "user",
			content: input,
			timestamp: new Date().toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		setMessages([...messages, userMessage]);
		setInput("");
		setIsTyping(true);

		// Simulate AI response
		setTimeout(() => {
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: generateMockResponse(input),
				timestamp: new Date().toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};
			setMessages((prev) => [...prev, aiMessage]);
			setIsTyping(false);
		}, 1500);
	};

	const generateMockResponse = (prompt: string) => {
		if (prompt.toLowerCase().includes("draft")) {
			return `Dear [Client Name],

Thank you for reaching out regarding your request. I'd be delighted to assist you with this matter.

I've reviewed your requirements and have identified several excellent options that align perfectly with your preferences. I'll follow up with detailed information within the next few hours.

Please let me know if you have any immediate questions or specific preferences I should consider.

Warm regards,
[Your Name]
Luxepass Personal Assistant`;
		} else if (prompt.toLowerCase().includes("summarize")) {
			return `**Thread Summary:**

• Client requested restaurant reservation for October 25th, 6:30 PM
• Preference for French cuisine, private dining area
• Party of 4 people, celebration occasion
• Budget: Premium tier
• Dietary restrictions: One vegetarian guest

**Action Items:**
1. Confirm availability at Le Bernardin or similar establishments
2. Request private dining room
3. Arrange for special celebration amenities
4. Follow up by EOD tomorrow`;
		} else {
			return `Here are some tailored suggestions based on your request:

1. **Premium Experience**: Consider arranging exclusive access or VIP treatment
2. **Personalization**: Add custom touches that reflect the client's preferences
3. **Proactive Communication**: Set up automated status updates
4. **Documentation**: Maintain detailed records for future reference
5. **Follow-up**: Schedule a check-in 24 hours after service delivery

Would you like me to elaborate on any of these suggestions?`;
		}
	};

	const handleCopy = (content: string) => {
		navigator.clipboard.writeText(content);
		toast.success("Copied to clipboard");
	};

	const handleQuickAction = (prompt: string) => {
		setInput(prompt);
	};

	return (
		<Card className="h-full flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
			{/* Header */}
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
				<div className="flex items-center gap-2">
					<Sparkles className="size-5 text-violet-500 dark:text-violet-400" />
					<h3>AI Assistant</h3>
					<Badge
						variant="outline"
						className="ml-auto border-violet-500 dark:border-violet-700 text-violet-600 dark:text-violet-400">
						GPT-4
					</Badge>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
				<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
					Quick Actions
				</p>
				<div className="flex gap-2 flex-wrap">
					{quickActions.map((action) => (
						<Button
							key={action.label}
							variant="outline"
							size="sm"
							className="text-xs border-zinc-300 dark:border-zinc-700 hover:border-violet-600 hover:bg-violet-100 dark:hover:bg-violet-950/30"
							onClick={() => handleQuickAction(action.prompt)}>
							<action.icon className="size-3 mr-1" />
							{action.label}
						</Button>
					))}
				</div>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"flex gap-3",
								message.role === "user" && "flex-row-reverse"
							)}>
							<div
								className={cn(
									"size-8 rounded-full flex items-center justify-center shrink-0",
									message.role === "assistant"
										? "bg-gradient-to-br from-violet-600 to-purple-600"
										: "bg-zinc-300 dark:bg-zinc-700"
								)}>
								{message.role === "assistant" ? (
									<Sparkles className="size-4" />
								) : (
									<span className="text-xs">PA</span>
								)}
							</div>

							<div
								className={cn(
									"flex-1 space-y-2",
									message.role === "user" && "flex flex-col items-end"
								)}>
								<div
									className={cn(
										"inline-block rounded-lg p-3 max-w-[85%]",
										message.role === "assistant"
											? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
											: "bg-violet-100 dark:bg-violet-900/50 border border-violet-300 dark:border-violet-800"
									)}>
									<p className="text-sm whitespace-pre-wrap leading-relaxed">
										{message.content}
									</p>
								</div>

								<div className="flex items-center gap-2">
									<span className="text-xs text-zinc-500">{message.timestamp}</span>
									{message.role === "assistant" && (
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="sm"
												className="size-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800"
												onClick={() => handleCopy(message.content)}>
												<Copy className="size-3" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="size-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800">
												<ThumbsUp className="size-3" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="size-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800">
												<RotateCw className="size-3" />
											</Button>
										</div>
									)}
								</div>
							</div>
						</div>
					))}

					{isTyping && (
						<div className="flex gap-3">
							<div className="size-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
								<Sparkles className="size-4" />
							</div>
							<div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
								<div className="flex gap-1">
									<div
										className="size-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}
									/>
									<div
										className="size-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"
										style={{ animationDelay: "150ms" }}
									/>
									<div
										className="size-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"
										style={{ animationDelay: "300ms" }}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			<Separator className="bg-zinc-200 dark:bg-zinc-800" />

			{/* Input */}
			<div className="p-4">
				<div className="flex gap-2">
					<Textarea
						placeholder="Ask AI to draft, summarize, or brainstorm..."
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						className="min-h-[60px] max-h-[120px] bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 resize-none"
					/>
					<Button
						onClick={handleSend}
						disabled={!input.trim() || isTyping}
						className="bg-violet-600 hover:bg-violet-700 shrink-0">
						<Send className="size-4" />
					</Button>
				</div>
				<p className="text-xs text-zinc-500 mt-2">
					Press Enter to send, Shift+Enter for new line
				</p>
			</div>
		</Card>
	);
}
