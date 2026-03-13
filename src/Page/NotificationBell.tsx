import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Bell, CheckCircle2, AlertCircle, Info, UserPlus } from "lucide-react";
import { cn } from "../utils";
import { useNotifications, NOTIFICATION_POLL_INTERVAL_MS } from "../hooks/useNotifications";

function formatTimeAgo(createdAt: string): string {
	const d = new Date(createdAt);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffMins = Math.floor(diffMs / 60_000);
	const diffHours = Math.floor(diffMs / 3_600_000);
	const diffDays = Math.floor(diffMs / 86_400_000);
	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins} min ago`;
	if (diffHours < 24) return `${diffHours} hour ago`;
	if (diffDays < 7) return `${diffDays} day ago`;
	return d.toLocaleDateString();
}

function playNotificationSound(): void {
	try {
		const audio = new Audio("/notification.mp3");
		audio.volume = 0.5;
		audio.play().catch(() => {});
	} catch {
		// no sound if file missing or autoplay blocked
	}
}

export function NotificationBell() {
	const {
		notifications,
		unreadCount,
		loading,
		fetchNotifications,
		markAsRead,
		markAllRead,
	} = useNotifications();
	const [isOpen, setIsOpen] = useState(false);
	const prevUnreadRef = useRef(0);
	const hasFetchedRef = useRef(false);

	useEffect(() => {
		fetchNotifications();
		hasFetchedRef.current = true;
	}, [fetchNotifications]);

	useEffect(() => {
		if (isOpen) fetchNotifications();
	}, [isOpen, fetchNotifications]);

	useEffect(() => {
		const interval = setInterval(() => {
			fetchNotifications();
		}, NOTIFICATION_POLL_INTERVAL_MS);
		return () => clearInterval(interval);
	}, [fetchNotifications]);

	// Play sound when unread count increases (e.g. new assignment)
	useEffect(() => {
		if (hasFetchedRef.current && unreadCount > prevUnreadRef.current) {
			playNotificationSound();
		}
		prevUnreadRef.current = unreadCount;
	}, [unreadCount]);

	const handleMarkAsRead = (id: string) => {
		markAsRead(id);
	};

	const handleMarkAllRead = () => {
		markAllRead();
	};

	const getIcon = (type: string) => {
		switch (type) {
			case "pa_assigned":
				return (
					<UserPlus className="size-4 text-violet-600 dark:text-violet-400" />
				);
			case "transfer_request":
				return (
					<AlertCircle className="size-4 text-orange-600 dark:text-orange-400" />
				);
			case "success":
				return (
					<CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
				);
			case "warning":
				return (
					<AlertCircle className="size-4 text-orange-600 dark:text-orange-400" />
				);
			case "info":
				return <Info className="size-4 text-blue-600 dark:text-blue-400" />;
			default:
				return <Info className="size-4 text-blue-600 dark:text-blue-400" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "pa_assigned":
				return "bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900";
			case "transfer_request":
				return "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900";
			case "success":
				return "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900";
			case "warning":
				return "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900";
			case "info":
				return "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900";
			default:
				return "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700";
		}
	};

	const read = (n: { readAt: string | null }) => !!n.readAt;

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				className="relative hover:bg-zinc-100 dark:hover:bg-zinc-800 size-9 p-0"
				onClick={() => setIsOpen(true)}>
				<Bell className="size-5" />
				{unreadCount > 0 && (
					<Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-violet-600 hover:bg-violet-600 text-xs">
						{unreadCount}
					</Badge>
				)}
			</Button>

			<Sheet
				open={isOpen}
				onOpenChange={setIsOpen}>
				<SheetContent
					side="right"
					className="w-full sm:w-96 p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
						<div className="flex items-center justify-between mb-2">
							<SheetTitle>Notifications</SheetTitle>
							{unreadCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleMarkAllRead}
									className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 h-8">
									Mark all read
								</Button>
							)}
						</div>
						<SheetDescription>
							{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
						</SheetDescription>
					</SheetHeader>

					<ScrollArea className="h-[calc(100vh-5rem)]">
						<div className="p-3">
							{loading && notifications.length === 0 ? (
								<div className="p-8 flex justify-center">
									<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
								</div>
							) : notifications.length === 0 ? (
								<div className="p-8 text-center">
									<Bell className="size-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
									<p className="text-zinc-400 dark:text-zinc-400">No notifications</p>
								</div>
							) : (
								notifications.map((notification, index) => (
									<div key={notification.id}>
										<div
											className={cn(
												"p-3 rounded-lg cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 relative",
												!read(notification) && "bg-zinc-100 dark:bg-zinc-800/30"
											)}
											onClick={() => handleMarkAsRead(notification.id)}>
											<div className="flex gap-3">
												<div
													className={cn(
														"size-8 rounded-lg flex items-center justify-center shrink-0 border",
														getTypeColor(notification.type)
													)}>
													{getIcon(notification.type)}
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2 mb-1">
														<p className="text-sm font-medium">{notification.title}</p>
													</div>
													<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 leading-relaxed">
														{notification.body ?? notification.title}
													</p>
													<div className="flex items-center gap-2">
														<span className="text-xs text-zinc-500 dark:text-zinc-500">
															{formatTimeAgo(notification.createdAt)}
														</span>
														{!read(notification) && (
															<div className="size-1.5 rounded-full bg-violet-500" />
														)}
													</div>
												</div>
											</div>
										</div>
										{index < notifications.length - 1 && (
											<Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />
										)}
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</>
	);
}
