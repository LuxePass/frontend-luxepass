import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import {
	ArrowLeft,
	ArrowRight,
	RefreshCw,
	Home,
	X,
	Search,
	Lock,
	Globe,
} from "lucide-react";

interface InAppBrowserProps {
	onClose: () => void;
}

const quickLinks = [
	{ name: "Google", url: "https://www.google.com" },
	{ name: "Gmail", url: "https://mail.google.com" },
	{ name: "Calendar", url: "https://calendar.google.com" },
	{ name: "Maps", url: "https://maps.google.com" },
	{ name: "WhatsApp Web", url: "https://web.whatsapp.com" },
	{ name: "LinkedIn", url: "https://www.linkedin.com" },
];

export function InAppBrowser({ onClose }: InAppBrowserProps) {
	const [url, setUrl] = useState("");
	const [currentUrl, setCurrentUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const handleNavigate = (targetUrl: string) => {
		if (!targetUrl) return;

		// Add https:// if not present
		let fullUrl = targetUrl;
		if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
			fullUrl = "https://" + fullUrl;
		}

		setLoading(true);
		setCurrentUrl(fullUrl);
		setUrl(fullUrl);

		// Update history
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push(fullUrl);
		setHistory(newHistory);
		setHistoryIndex(newHistory.length - 1);

		// Simulate loading
		setTimeout(() => setLoading(false), 500);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleNavigate(url);
	};

	const handleBack = () => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setCurrentUrl(history[newIndex]);
			setUrl(history[newIndex]);
		}
	};

	const handleForward = () => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setCurrentUrl(history[newIndex]);
			setUrl(history[newIndex]);
		}
	};

	const handleRefresh = () => {
		if (currentUrl) {
			setLoading(true);
			setTimeout(() => setLoading(false), 500);
		}
	};

	const handleHome = () => {
		setCurrentUrl("");
		setUrl("");
	};

	return (
		<div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col">
			{/* Browser Header */}
			<div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
				{/* Top Bar */}
				<div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800">
					<Button
						onClick={onClose}
						variant="ghost"
						size="sm"
						className="size-9 p-0">
						<X className="size-4" />
					</Button>

					<div className="flex-1 text-center">
						<h3 className="text-sm">In-App Browser</h3>
					</div>

					<Button
						onClick={handleHome}
						variant="ghost"
						size="sm"
						className="size-9 p-0">
						<Home className="size-4" />
					</Button>
				</div>

				{/* Navigation Bar */}
				<div className="flex items-center gap-2 p-3">
					<div className="flex items-center gap-1">
						<Button
							onClick={handleBack}
							variant="ghost"
							size="sm"
							disabled={historyIndex <= 0}
							className="size-9 p-0">
							<ArrowLeft className="size-4" />
						</Button>
						<Button
							onClick={handleForward}
							variant="ghost"
							size="sm"
							disabled={historyIndex >= history.length - 1}
							className="size-9 p-0">
							<ArrowRight className="size-4" />
						</Button>
						<Button
							onClick={handleRefresh}
							variant="ghost"
							size="sm"
							disabled={!currentUrl}
							className="size-9 p-0">
							<RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
						</Button>
					</div>

					<form
						onSubmit={handleSubmit}
						className="flex-1">
						<div className="relative">
							{currentUrl ? (
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-green-600 dark:text-green-400" />
							) : (
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
							)}
							<Input
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="Enter URL or search..."
								className="pl-10 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Browser Content */}
			<div className="flex-1 overflow-hidden">
				{currentUrl ? (
					<iframe
						src={currentUrl}
						className="w-full h-full border-0"
						title="In-App Browser"
						sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
					/>
				) : (
					<ScrollArea className="h-full">
						<div className="p-6 max-w-4xl mx-auto">
							<div className="text-center mb-8">
								<div className="inline-flex items-center justify-center size-16 rounded-full bg-violet-100 dark:bg-violet-950/50 mb-4">
									<Globe className="size-8 text-violet-600 dark:text-violet-400" />
								</div>
								<h2 className="text-xl mb-2">Welcome to In-App Browser</h2>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									Browse the web without leaving Luxepass PA dashboard
								</p>
							</div>

							<div className="space-y-4">
								<h3 className="text-sm text-zinc-500 dark:text-zinc-400">
									Quick Links
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
									{quickLinks.map((link) => (
										<Card
											key={link.name}
											onClick={() => handleNavigate(link.url)}
											className="p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-center">
											<div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2">
												<Globe className="size-5 text-zinc-600 dark:text-zinc-400" />
											</div>
											<p className="text-sm">{link.name}</p>
										</Card>
									))}
								</div>
							</div>

							<div className="mt-8 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
								<h4 className="text-sm mb-2">Tips</h4>
								<ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
									<li>• Enter a URL or search term in the address bar above</li>
									<li>• Use the navigation buttons to go back and forward</li>
									<li>• Click the home button to return to this page</li>
									<li>• Access your favorite sites without leaving the dashboard</li>
								</ul>
							</div>
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	);
}
