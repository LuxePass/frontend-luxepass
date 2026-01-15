import { useState, useEffect, useMemo } from "react";
import { useUsers, type User as ApiUser } from "../hooks/useUsers";
import { useBookings, type Booking } from "../hooks/useBookings";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	DollarSign,
	TrendingUp,
	Clock,
	MessageSquare,
	CheckCircle2,
	AlertCircle,
	Target,
	X,
	Wallet as WalletIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientDetailsProps {
	clientId: string;
	clientName: string;
	onClose?: () => void;
}

export function ClientDetails({
	clientId,
	clientName,
	onClose,
}: ClientDetailsProps) {
	const navigate = useNavigate();
	const { getUserById, loading: userLoading } = useUsers();
	const { getBookings, loading: bookingsLoading } = useBookings();
	const [client, setClient] = useState<ApiUser | null>(null);
	const [clientBookings, setClientBookings] = useState<Booking[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userData = await getUserById(clientId);
				setClient(userData);

				const bookingsData = await getBookings({ userId: clientId });
				setClientBookings(bookingsData.data || []);
			} catch (err) {
				console.error("Failed to fetch client details", err);
			}
		};

		fetchData();
	}, [clientId, getUserById, getBookings]);

	const stats = useMemo(() => {
		const totalRequests = clientBookings.length;
		const completedRequests = clientBookings.filter(
			(b) => b.status === "COMPLETED" || b.status === "CONFIRMED"
		).length;
		const pendingRequests = clientBookings.filter(
			(b) => b.status === "INQUIRY"
		).length;
		const lifetimeValue = clientBookings
			.filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
			.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);

		const completionRate =
			totalRequests > 0
				? Math.round((completedRequests / totalRequests) * 100)
				: 0;

		return {
			totalRequests,
			completedRequests,
			pendingRequests,
			lifetimeValue,
			completionRate,
		};
	}, [clientBookings]);

	const getInitials = (name: string) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	if (userLoading || !client) {
		return (
			<div className="h-full flex items-center justify-center p-20">
				<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<ScrollArea className="h-full overflow-auto font-sans">
			<div className="p-3 lg:p-6 space-y-4 lg:space-y-6 pb-safe">
				{/* Client Header */}
				<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 relative shadow-none">
					{/* Close Button */}
					{onClose && (
						<Button
							variant="ghost"
							size="sm"
							className="absolute top-3 right-3 lg:top-4 lg:right-4 size-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
							onClick={onClose}>
							<X className="size-4" />
						</Button>
					)}

					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-8">
						<Avatar className="size-16 lg:size-20 border-4 border-violet-600">
							<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xl lg:text-2xl">
								{getInitials(client.name)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="flex flex-wrap items-center gap-2 mb-2">
								<h2 className="text-xl lg:text-2xl font-bold">{client.name}</h2>
								<Badge className="bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 border-none px-2 uppercase text-[10px] tracking-wider">
									{client.tier}
								</Badge>
								<Badge
									className={
										client.status === "ACTIVE"
											? "bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-none"
											: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none"
									}>
									{client.status}
								</Badge>
							</div>

							<div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
								<div className="flex items-center gap-2">
									<Mail className="size-4" />
									<span>{client.email}</span>
								</div>
								<div className="flex items-center gap-2">
									<Phone className="size-4" />
									<span>{client.phone}</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="size-4" />
									<span>
										Member since {new Date(client.createdAt || "").toLocaleDateString()}
									</span>
								</div>
							</div>
							<div className="mt-4">
								<Button
									size="sm"
									variant="outline"
									className="gap-2"
									onClick={() => navigate(`/wallet/${clientId}`)}>
									<WalletIcon className="size-4" />
									View Wallet
								</Button>
							</div>
						</div>
					</div>
				</Card>

				{/* Key Metrics */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/50">
								<DollarSign className="size-4 text-green-600 dark:text-green-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
								LTV
							</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1 font-bold">
							₦{stats.lifetimeValue.toLocaleString()}
						</p>
						<p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-semibold">
							Lifetime value
						</p>
					</Card>

					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/50">
								<MessageSquare className="size-4 text-violet-600 dark:text-violet-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
								Requests
							</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1 font-bold">
							{stats.totalRequests}
						</p>
						<p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-semibold">
							{stats.completedRequests} completed
						</p>
					</Card>

					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50">
								<Clock className="size-4 text-orange-600 dark:text-orange-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
								Pending
							</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1 font-bold">
							{stats.pendingRequests}
						</p>
						<p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-semibold">
							Active inquiries
						</p>
					</Card>

					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
								<TrendingUp className="size-4 text-blue-600 dark:text-blue-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
								Completion
							</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1 font-bold">
							{stats.completionRate}%
						</p>
						<p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-semibold">
							Success rate
						</p>
					</Card>
				</div>

				{/* Performance Stats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
					<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
						<h3 className="text-base lg:text-lg mb-4 flex items-center gap-2 font-bold">
							<Target className="size-5 text-violet-600 dark:text-violet-400" />
							Request Performance
						</h3>
						<div className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
										Completion Rate
									</span>
									<span className="text-sm font-bold">{stats.completionRate}%</span>
								</div>
								<Progress
									value={stats.completionRate}
									className="h-2"
								/>
							</div>

							<Separator className="bg-zinc-200 dark:bg-zinc-800" />

							<div className="grid grid-cols-3 gap-4">
								<div>
									<div className="flex items-center gap-2 mb-1">
										<CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
										<span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-tighter">
											Completed
										</span>
									</div>
									<p className="text-xl font-bold">{stats.completedRequests}</p>
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<Clock className="size-4 text-orange-600 dark:text-orange-400" />
										<span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-tighter">
											Pending
										</span>
									</div>
									<p className="text-xl font-bold">{stats.pendingRequests}</p>
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<AlertCircle className="size-4 text-red-600 dark:text-red-400" />
										<span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-tighter">
											Cancelled
										</span>
									</div>
									<p className="text-xl font-bold">
										{clientBookings.filter((b) => b.status === "CANCELLED").length}
									</p>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
						<h3 className="text-base lg:text-lg mb-4 flex items-center gap-2 font-bold">
							<Calendar className="size-5 text-violet-600 dark:text-violet-400" />
							Recent Activity
						</h3>
						<ScrollArea className="h-40">
							<div className="space-y-3">
								{clientBookings.slice(0, 5).map((booking) => (
									<div
										key={booking.id}
										className="flex items-center justify-between text-sm">
										<div className="flex flex-col">
											<span className="font-medium capitalize">
												{booking.type.toLowerCase()} booking
											</span>
											<span className="text-xs text-zinc-500">
												{new Date(booking.createdAt).toLocaleDateString()}
											</span>
										</div>
										<Badge
											className={
												booking.status === "CONFIRMED" || booking.status === "COMPLETED"
													? "bg-green-100 dark:bg-green-950/50 text-green-600 border-none"
													: "bg-orange-100 dark:bg-orange-950/50 text-orange-600 border-none"
											}>
											{booking.status}
										</Badge>
									</div>
								))}
								{clientBookings.length === 0 && (
									<p className="text-sm text-zinc-500 italic text-center py-4">
										No recent activity
									</p>
								)}
							</div>
						</ScrollArea>
					</Card>
				</div>
			</div>
		</ScrollArea>
	);
}
