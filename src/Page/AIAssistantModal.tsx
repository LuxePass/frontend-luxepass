import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Sparkles, Send } from "lucide-react";
import { cn } from "../utils";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
}

interface AIAssistantModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const quickPrompts = [
	"Draft a response to client inquiry",
	"Summarize recent interactions",
	"Suggest luxury dining options",
	"Help with travel itinerary",
];

export function AIAssistantModal({
	open,
	onOpenChange,
}: AIAssistantModalProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content:
				"Hello! I'm your AI assistant. I can help you draft responses, summarize threads, brainstorm ideas, and assist with client requests. How can I help you today?",
			timestamp: new Date().toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = async () => {
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
		setIsLoading(true);

		// Simulate AI response
		setTimeout(() => {
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: getAIResponse(input),
				timestamp: new Date().toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};
			setMessages((prev) => [...prev, aiMessage]);
			setIsLoading(false);
		}, 1000);
	};

	const getAIResponse = (userInput: string): string => {
		const lowerInput = userInput.toLowerCase();

		if (lowerInput.includes("draft") || lowerInput.includes("response")) {
			return "I'd be happy to help draft a response. Here's a professional template:\n\n\"Dear [Client Name],\n\nThank you for reaching out. I appreciate your inquiry regarding [subject]. I'd be delighted to assist you with this request.\n\n[Specific response to their needs]\n\nPlease let me know if you need any additional information or have other preferences I should consider.\n\nBest regards,\n[Your Name]\"\n\nWould you like me to customize this further?";
		}

		if (lowerInput.includes("summarize") || lowerInput.includes("summary")) {
			return "Based on recent client interactions, here's a summary:\n\n• Sarah Chen - Requested dinner reservation at French restaurant (Party of 4, Friday 7 PM)\n• Marcus Johnson - Property viewing schedule adjustments needed\n• Elena Rodriguez - Private jet booking confirmed for Aspen tomorrow at 2 PM\n\nAll high-priority requests are being handled. Would you like more details on any specific client?";
		}

		if (lowerInput.includes("dining") || lowerInput.includes("restaurant")) {
			return "Here are some luxury dining recommendations:\n\n1. Le Bernardin - French fine dining, Michelin 3-star\n2. Eleven Madison Park - Contemporary American, exceptional service\n3. Per Se - Thomas Keller's NYC flagship, tasting menu\n4. Daniel - Classic French cuisine, elegant atmosphere\n\nWould you like me to help with reservation details or provide more options?";
		}

		if (lowerInput.includes("travel") || lowerInput.includes("itinerary")) {
			return "I can help create a luxury travel itinerary. Could you provide:\n\n• Destination and dates\n• Number of travelers\n• Preferred activities (dining, shopping, cultural experiences, relaxation)\n• Budget range\n• Any special requirements or preferences\n\nOnce I have these details, I'll craft a personalized itinerary with exclusive recommendations.";
		}

		return (
			"I understand you're asking about \"" +
			userInput +
			'". I can assist with:\n\n• Drafting professional client responses\n• Summarizing conversation threads\n• Providing luxury service recommendations\n• Creating travel itineraries\n• Brainstorming creative solutions\n\nCould you provide more specific details so I can better assist you?'
		);
	};

	const handleQuickPrompt = (prompt: string) => {
		setInput(prompt);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl h-[90vh] sm:h-[85vh] max-h-[700px] p-0 gap-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 w-[calc(100%-2rem)] sm:w-full mx-auto my-auto">
				<DialogHeader className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
					<DialogTitle className="flex items-center gap-3 text-lg">
						<div className="size-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
							<Sparkles className="size-5 text-white" />
						</div>
						AI Assistant
					</DialogTitle>
					<DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 ml-[52px]">
						Your intelligent PA companion
					</DialogDescription>
				</DialogHeader>

				{/* Quick Prompts */}
				{messages.length === 1 && (
					<div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
						<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
							Quick prompts:
						</p>
						<div className="flex flex-wrap gap-2">
							{quickPrompts.map((prompt, index) => (
								<Button
									key={index}
									variant="outline"
									size="sm"
									onClick={() => handleQuickPrompt(prompt)}
									className="text-xs h-7 border-zinc-300 dark:border-zinc-700">
									{prompt}
								</Button>
							))}
						</div>
					</div>
				)}

				{/* Messages */}
				<ScrollArea className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
					<div className="space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={cn(
									"flex gap-2 sm:gap-3",
									message.role === "user" && "flex-row-reverse"
								)}>
								<Avatar className="size-8 shrink-0">
									<AvatarFallback
										className={cn(
											message.role === "assistant"
												? "bg-gradient-to-br from-violet-600 to-purple-600"
												: "bg-gradient-to-br from-zinc-700 to-zinc-600",
											"text-xs"
										)}>
										{message.role === "assistant" ? (
											<Sparkles className="size-4" />
										) : (
											"You"
										)}
									</AvatarFallback>
								</Avatar>

								<div
									className={cn(
										"flex flex-col max-w-[85%] sm:max-w-[80%]",
										message.role === "user" && "items-end"
									)}>
									<div
										className={cn(
											"inline-block rounded-lg p-3 sm:p-3 border",
											message.role === "assistant"
												? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
												: "bg-violet-100 dark:bg-violet-900/50 border-violet-300 dark:border-violet-800"
										)}>
										<p className="text-sm whitespace-pre-wrap leading-relaxed">
											{message.content}
										</p>
									</div>
									<span className="text-xs text-zinc-500 mt-1 px-1">
										{message.timestamp}
									</span>
								</div>
							</div>
						))}

						{isLoading && (
							<div className="flex gap-2 sm:gap-3">
								<Avatar className="size-8 shrink-0">
									<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600">
										<Sparkles className="size-4" />
									</AvatarFallback>
								</Avatar>
								<div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
									<div className="flex gap-1">
										<div
											className="size-2 bg-zinc-400 rounded-full animate-bounce"
											style={{ animationDelay: "0ms" }}></div>
										<div
											className="size-2 bg-zinc-400 rounded-full animate-bounce"
											style={{ animationDelay: "150ms" }}></div>
										<div
											className="size-2 bg-zinc-400 rounded-full animate-bounce"
											style={{ animationDelay: "300ms" }}></div>
									</div>
								</div>
							</div>
						)}
					</div>
				</ScrollArea>

				<Separator className="bg-zinc-200 dark:bg-zinc-800 shrink-0" />

				{/* Input */}
				<div className="p-4 sm:p-6 shrink-0">
					<div className="flex gap-2">
						<Textarea
							placeholder="Ask me anything..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							className="min-h-[60px] max-h-[120px] resize-none bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-sm"
						/>
						<Button
							onClick={handleSend}
							disabled={!input.trim() || isLoading}
							className="bg-violet-600 hover:bg-violet-700 shrink-0 size-[60px] p-0">
							<Send className="size-4" />
						</Button>
					</div>
					<p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
						<Sparkles className="size-3 text-violet-500" />
						<span className="truncate">
							AI-powered assistance for drafting and brainstorming
						</span>
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
