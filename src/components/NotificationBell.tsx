import { useState } from "react";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Bell, CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../utils";

interface Notification {
	id: string;
	type: "success" | "warning" | "info";
	title: string;
	message: string;
	time: string;
	read: boolean;
}

const mockNotifications: Notification[] = [
	{
		id: "1",
		type: "warning",
		title: "Urgent Task Due",
		message: "Restaurant reservation for Chidinma Okonkwo due in 2 hours",
		time: "2 min ago",
		read: false,
	},
	{
		id: "2",
		type: "success",
		title: "Task Completed",
		message: "Wine collection delivery confirmed for Chukwudi Okafor",
		time: "1 hour ago",
		read: false,
	},
	{
		id: "3",
		type: "info",
		title: "New Client Message",
		message: "Emeka Adeleke sent a message about property viewing in Lekki",
		time: "2 hours ago",
		read: true,
	},
	{
		id: "4",
		type: "success",
		title: "Booking Confirmed",
		message: "Private jet booking confirmed for Amara Nwosu",
		time: "3 hours ago",
		read: true,
	},
];

export function NotificationBell() {
	const [notifications, setNotifications] = useState(mockNotifications);
	const [isOpen, setIsOpen] = useState(false);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const handleMarkAsRead = (id: string) => {
		setNotifications(
			notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
		);
	};

	const handleDismiss = (id: string) => {
		setNotifications(notifications.filter((n) => n.id !== id));
	};

	const handleMarkAllRead = () => {
		setNotifications(notifications.map((n) => ({ ...n, read: true })));
	};

	const getIcon = (type: string) => {
		switch (type) {
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
				return null;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "success":
				return "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900";
			case "warning":
				return "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900";
			case "info":
				return "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900";
			default:
				return "";
		}
	};

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
							{notifications.length === 0 ? (
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
												!notification.read && "bg-zinc-100 dark:bg-zinc-800/30"
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
														<p className="text-sm">{notification.title}</p>
														<Button
															variant="ghost"
															size="sm"
															className="size-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0"
															onClick={(e) => {
																e.stopPropagation();
																handleDismiss(notification.id);
															}}>
															<X className="size-3" />
														</Button>
													</div>
													<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 leading-relaxed">
														{notification.message}
													</p>
													<div className="flex items-center gap-2">
														<span className="text-xs text-zinc-500 dark:text-zinc-500">
															{notification.time}
														</span>
														{!notification.read && (
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
