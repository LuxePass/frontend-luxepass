import { useEffect, useMemo } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useBookings } from "../hooks/useBookings";
import { useChat } from "../hooks/useChat";
import { useTransfers } from "../hooks/useTransfers";
import { useListings } from "../hooks/useListings";
import {
	ListTodo,
	MessageCircle,
	ShieldAlert,
	Building2,
	Users,
	ChevronRight,
	Clock,
	AlertCircle,
} from "lucide-react";

interface QuickViewsProps {
	onTasksClick: () => void;
	onChatClick: () => void;
	onTransferClick: () => void;
	onListingsClick: () => void;
	onReferralsClick: () => void;
}

export function QuickViews({
	onTasksClick,
	onChatClick,
	onTransferClick,
	onListingsClick,
	onReferralsClick,
}: QuickViewsProps) {
	const { bookings, getBookings, loading: loadingBookings } = useBookings();
	const { conversations, fetchConversations, loading: loadingChat } = useChat();
	const { transfers, getTransfers, loading: loadingTransfers } = useTransfers();
	const { listings, getListings, loading: loadingListings } = useListings();

	useEffect(() => {
		getBookings();
		fetchConversations();
		getTransfers();
		getListings();
	}, [getBookings, fetchConversations, getTransfers, getListings]);

	const pendingInquiries = useMemo(
		() => bookings.filter((b) => b.status === "INQUIRY"),
		[bookings]
	);

	const pendingTransfers = useMemo(
		() => transfers.filter((t) => t.status === "PENDING"),
		[transfers]
	);

	const activeListings = useMemo(
		() => listings.filter((l) => l.isActive),
		[listings]
	);

	const quickViewItems = useMemo(
		() => [
			{
				title: "Task Queue",
				description: `${pendingInquiries.length} urgent tasks pending`,
				icon: ListTodo,
				iconColor: "text-violet-600 dark:text-violet-400",
				bgColor: "bg-violet-100 dark:bg-violet-950/50",
				borderColor: "border-violet-200 dark:border-violet-900",
				onClick: onTasksClick,
				badge: { text: pendingInquiries.length.toString(), color: "bg-violet-600" },
				items: pendingInquiries.slice(0, 3).map((task) => ({
					text: `${task.type} booking - ${task.currency} ${parseFloat(
						task.totalAmount
					).toLocaleString()}`,
					time: new Date(task.createdAt).toLocaleDateString(),
					urgent: true,
				})),
			},
			{
				title: "WhatsApp Live Chat",
				description: `${conversations.length} active conversations`,
				icon: MessageCircle,
				iconColor: "text-green-600 dark:text-green-400",
				bgColor: "bg-green-100 dark:bg-green-950/50",
				borderColor: "border-green-200 dark:border-green-900",
				onClick: onChatClick,
				badge: { text: conversations.length.toString(), color: "bg-green-600" },
				items: conversations.slice(0, 3).map((conv) => ({
					text: `${conv.clientName}: ${conv.lastMessage}`,
					time: conv.lastMessageTime || "Just now",
					urgent: conv.unreadCount > 0,
				})),
			},
			{
				title: "Transfer Override",
				description: `${pendingTransfers.length} pending approvals`,
				icon: ShieldAlert,
				iconColor: "text-orange-600 dark:text-orange-400",
				bgColor: "bg-orange-100 dark:bg-orange-950/50",
				borderColor: "border-orange-200 dark:border-orange-900",
				onClick: onTransferClick,
				badge: { text: pendingTransfers.length.toString(), color: "bg-orange-600" },
				items: pendingTransfers.slice(0, 3).map((transfer) => ({
					text: `Transfer - ${transfer.currency} ${parseFloat(
						transfer.amount
					).toLocaleString()}`,
					time: "Pending",
					urgent: true,
				})),
			},
			{
				title: "Listing Management",
				description: `${activeListings.length} active listings`,
				icon: Building2,
				iconColor: "text-blue-600 dark:text-blue-400",
				bgColor: "bg-blue-100 dark:bg-blue-950/50",
				borderColor: "border-blue-200 dark:border-blue-900",
				onClick: onListingsClick,
				badge: { text: activeListings.length.toString(), color: "bg-blue-600" },
				items: activeListings.slice(0, 3).map((listing) => ({
					text: `${listing.name} - ${listing.city}`,
					time: listing.isActive ? "Active" : "Inactive",
					urgent: listing.vettingStatus === "PENDING",
				})),
			},
			{
				title: "Referral Program",
				description: "8 new referrals this week",
				icon: Users,
				iconColor: "text-indigo-600 dark:text-indigo-400",
				bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
				borderColor: "border-indigo-200 dark:border-indigo-900",
				onClick: onReferralsClick,
				badge: { text: "8", color: "bg-indigo-600" },
				items: [
					{ text: "Lisa → Sarah - ₦500,000 earned", time: "Today", urgent: false },
					{ text: "Marcus → David - Pending", time: "Yesterday", urgent: false },
					{ text: "Elena → 2 referrals", time: "This week", urgent: false },
				],
			},
		],
		[
			pendingInquiries,
			conversations,
			pendingTransfers,
			activeListings,
			onTasksClick,
			onChatClick,
			onTransferClick,
			onListingsClick,
			onReferralsClick,
		]
	);

	return (
		<ScrollArea className="h-full">
			<div className="p-4 space-y-4 pb-safe">
				<div>
					<h3 className="mb-1">Quick Access</h3>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Tap any card to view details
					</p>
				</div>

				<div className="space-y-3">
					{quickViewItems.map((item) => {
						const Icon = item.icon;
						return (
							<Card
								key={item.title}
								onClick={item.onClick}
								className={`p-4 cursor-pointer transition-all hover:shadow-md active:scale-98 bg-white dark:bg-zinc-900/50 border-2 ${item.borderColor}`}>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className={`p-2.5 rounded-lg ${item.bgColor}`}>
											<Icon className={`size-5 ${item.iconColor}`} />
										</div>
										<div>
											<h4 className="text-sm mb-0.5">{item.title}</h4>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												{item.description}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge className={`${item.badge.color} hover:${item.badge.color}`}>
											{item.badge.text}
										</Badge>
										<ChevronRight className="size-4 text-zinc-400" />
									</div>
								</div>

								{/* Preview items */}
								<div className="space-y-2 pl-1">
									{item.items.map((subItem, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-zinc-50 dark:bg-zinc-800/50">
											<div className="flex items-center gap-2 flex-1 min-w-0">
												{subItem.urgent && (
													<AlertCircle className="size-3 text-red-600 dark:text-red-400 shrink-0" />
												)}
												<span className="truncate text-zinc-700 dark:text-zinc-300">
													{subItem.text}
												</span>
											</div>
											<div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 shrink-0 ml-2">
												<Clock className="size-3" />
												<span className="text-xs">{subItem.time}</span>
											</div>
										</div>
									))}
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</ScrollArea>
	);
}
