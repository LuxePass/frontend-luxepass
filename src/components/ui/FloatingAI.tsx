import React, { useState, useRef, useEffect } from "react";
import {
	FaRobot,
	FaPaperPlane,
	FaTimes,
	FaMinus,
	FaCommentAlt,
} from "react-icons/fa";
import api from "../../services/api";

export default function FloatingAI() {
	const [isOpen, setIsOpen] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [messages, setMessages] = useState<
		{ role: "user" | "bot"; content: string }[]
	>([
		{
			role: "bot",
			content: "Hello! I am Lux Assistant. How can I help you today?",
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const toggleChat = () => {
		setIsOpen(!isOpen);
		setIsMinimized(false);
	};

	const minimizeChat = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsMinimized(!isMinimized);
		setIsOpen(true);
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isOpen]);

	// Format AI response with markdown-like formatting
	const formatMessage = (content: string) => {
		const paragraphs = content.split("\n\n");

		return paragraphs.map((paragraph, pIdx) => {
			if (paragraph.trim().match(/^[-*•]\s/m)) {
				const items = paragraph.split("\n").filter((line) => line.trim());
				return (
					<ul
						key={pIdx}
						className="list-disc list-inside space-y-1 my-2">
						{items.map((item, iIdx) => (
							<li
								key={iIdx}
								className="ml-2">
								{item.replace(/^[-*•]\s/, "")}
							</li>
						))}
					</ul>
				);
			}

			if (paragraph.trim().match(/^\d+\.\s/m)) {
				const items = paragraph.split("\n").filter((line) => line.trim());
				return (
					<ol
						key={pIdx}
						className="list-decimal list-inside space-y-1 my-2">
						{items.map((item, iIdx) => (
							<li
								key={iIdx}
								className="ml-2">
								{item.replace(/^\d+\.\s/, "")}
							</li>
						))}
					</ol>
				);
			}

			const parts = paragraph.split(/(\*\*.*?\*\*)/g);
			return (
				<p
					key={pIdx}
					className="mb-2 last:mb-0">
					{parts.map((part, idx) => {
						if (part.startsWith("**") && part.endsWith("**")) {
							return <strong key={idx}>{part.slice(2, -2)}</strong>;
						}
						return part.split("\n").map((line, lineIdx) => (
							<span key={`${idx}-${lineIdx}`}>
								{line}
								{lineIdx < part.split("\n").length - 1 && <br />}
							</span>
						));
					})}
				</p>
			);
		});
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const userMsg = inputValue;
		setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
		setInputValue("");
		setIsLoading(true);

		try {
			const { data } = await api.post("/ai/chat", { message: userMsg });

			if (data.success) {
				const replyContent = data.data.reply;
				setMessages((prev) => [
					...prev,
					{ role: "bot", content: String(replyContent) },
				]);
			} else {
				setMessages((prev) => [
					...prev,
					{
						role: "bot",
						content: "Sorry, I'm having trouble connecting to the server.",
					},
				]);
			}
		} catch (_error) {
			setMessages((prev) => [
				...prev,
				{
					role: "bot",
					content: "Sorry, something went wrong. Please try again later.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{/* Chat Window */}
			{isOpen && !isMinimized && (
				<div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300">
					{/* Header */}
					<div className="bg-black p-4 flex items-center justify-between text-white">
						<div className="flex items-center space-x-2">
							<div className="bg-white/20 p-2 rounded-full">
								<FaRobot size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm">Lux Assistant</h3>
								<p className="text-xs text-gray-300 flex items-center">
									<span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
									Online
								</p>
							</div>
						</div>
						<div className="flex space-x-2">
							<button
								onClick={minimizeChat}
								className="p-1 hover:bg-white/20 rounded transition-colors"
								aria-label="Minimize chat">
								<FaMinus size={12} />
							</button>
							<button
								onClick={toggleChat}
								className="p-1 hover:bg-white/20 rounded transition-colors"
								aria-label="Close chat">
								<FaTimes size={12} />
							</button>
						</div>
					</div>

					{/* Messages Area */}
					<div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`max-w-[85%] p-3 rounded-lg text-sm ${
									msg.role === "user" ?
										"bg-black text-white self-end rounded-br-none"
									:	"bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm"
								}`}>
								{msg.role === "bot" ?
									<div className="prose prose-sm max-w-none">
										{formatMessage(msg.content)}
									</div>
								:	msg.content}
							</div>
						))}
						{isLoading && (
							<div className="bg-white border border-gray-200 p-3 rounded-lg self-start rounded-bl-none shadow-sm w-16 flex items-center justify-center">
								<div className="flex space-x-1">
									<div
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}></div>
									<div
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{ animationDelay: "150ms" }}></div>
									<div
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{ animationDelay: "300ms" }}></div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Input Area */}
					<form
						onSubmit={handleSendMessage}
						className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="Type a message..."
							className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm outline-none text-gray-700"
						/>
						<button
							type="submit"
							disabled={!inputValue.trim() || isLoading}
							className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
							<FaPaperPlane size={14} />
						</button>
					</form>
				</div>
			)}

			{/* Toggle Button */}
			<button
				onClick={toggleChat}
				className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
					isOpen && !isMinimized ?
						"bg-red-500 hover:bg-red-600 rotate-90"
					:	"bg-black hover:bg-gray-800"
				}`}>
				{isOpen && !isMinimized ?
					<FaTimes className="text-white text-xl" />
				:	<FaCommentAlt className="text-white text-xl" />}
			</button>
		</div>
	);
}
