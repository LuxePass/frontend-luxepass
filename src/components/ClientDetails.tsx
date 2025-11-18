import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
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
} from "lucide-react";

interface ClientDetailsProps {
	clientId: string;
	clientName: string;
	onClose?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientData: Record<string, any> = {
	"1": {
		name: "Chidinma Okonkwo",
		email: "chidinma.okonkwo@email.com",
		phone: "+234 (0)803 456 7890",
		location: "Ikoyi, Lagos",
		memberSince: "June 2023",
		tier: "Platinum",
		lifetimeValue: 145000,
		totalRequests: 127,
		completedRequests: 119,
		pendingRequests: 5,
		averageResponseTime: "8 minutes",
		satisfactionScore: 98,
		preferredCategories: ["Dining", "Travel", "Events"],
		recentSpending: {
			thisMonth: 12500,
			lastMonth: 9800,
			trend: "up",
		},
		urgentTasks: 2,
	},
	"2": {
		name: "Emeka Adeleke",
		email: "emeka.adeleke@email.com",
		phone: "+234 (0)805 123 4567",
		location: "Lekki Phase 1, Lagos",
		memberSince: "March 2024",
		tier: "Gold",
		lifetimeValue: 82000,
		totalRequests: 89,
		completedRequests: 84,
		pendingRequests: 3,
		averageResponseTime: "12 minutes",
		satisfactionScore: 95,
		preferredCategories: ["Real Estate", "Business", "Lifestyle"],
		recentSpending: {
			thisMonth: 8500,
			lastMonth: 11200,
			trend: "down",
		},
		urgentTasks: 1,
	},
	"3": {
		name: "Amara Nwosu",
		email: "amara.nwosu@email.com",
		phone: "+234 (0)816 789 0123",
		location: "Victoria Island, Lagos",
		memberSince: "January 2024",
		tier: "Platinum",
		lifetimeValue: 210000,
		totalRequests: 156,
		completedRequests: 148,
		pendingRequests: 4,
		averageResponseTime: "6 minutes",
		satisfactionScore: 99,
		preferredCategories: ["Travel", "Luxury Goods", "Events"],
		recentSpending: {
			thisMonth: 18900,
			lastMonth: 15600,
			trend: "up",
		},
		urgentTasks: 3,
	},
	"4": {
		name: "Chukwudi Okafor",
		email: "chukwudi.okafor@email.com",
		phone: "+234 (0)818 234 5678",
		location: "Banana Island, Lagos",
		memberSince: "September 2023",
		tier: "Silver",
		lifetimeValue: 45000,
		totalRequests: 67,
		completedRequests: 63,
		pendingRequests: 2,
		averageResponseTime: "15 minutes",
		satisfactionScore: 92,
		preferredCategories: ["Wine & Spirits", "Shopping", "Dining"],
		recentSpending: {
			thisMonth: 4200,
			lastMonth: 3800,
			trend: "up",
		},
		urgentTasks: 0,
	},
	"5": {
		name: "Ngozi Adekunle",
		email: "ngozi.adekunle@email.com",
		phone: "+234 (0)809 345 6789",
		location: "Parkview Estate, Ikoyi",
		memberSince: "May 2023",
		tier: "Platinum",
		lifetimeValue: 310000,
		totalRequests: 203,
		completedRequests: 195,
		pendingRequests: 6,
		averageResponseTime: "5 minutes",
		satisfactionScore: 100,
		preferredCategories: ["Art & Culture", "Yachts", "Fine Dining"],
		recentSpending: {
			thisMonth: 25000,
			lastMonth: 28500,
			trend: "down",
		},
		urgentTasks: 4,
	},
};

export function ClientDetails({
	clientId,
	clientName,
	onClose,
}: ClientDetailsProps) {
	const client = clientData[clientId] || {
		name: clientName,
		email: "N/A",
		phone: "N/A",
		location: "N/A",
		memberSince: "N/A",
		tier: "Silver",
		lifetimeValue: 0,
		totalRequests: 0,
		completedRequests: 0,
		pendingRequests: 0,
		averageResponseTime: "N/A",
		satisfactionScore: 0,
		preferredCategories: [],
		recentSpending: { thisMonth: 0, lastMonth: 0, trend: "same" },
		urgentTasks: 0,
	};

	const completionRate =
		client.totalRequests > 0
			? Math.round((client.completedRequests / client.totalRequests) * 100)
			: 0;

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	return (
		<ScrollArea className="h-full overflow-auto">
			<div className="p-3 lg:p-6 space-y-4 lg:space-y-6 pb-safe">
				{/* Client Header */}
				<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 relative">
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
								<h2 className="text-xl lg:text-2xl">{client.name}</h2>
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
									<MapPin className="size-4" />
									<span>{client.location}</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="size-4" />
									<span>Member since {client.memberSince}</span>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Key Metrics */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/50">
								<DollarSign className="size-4 text-green-600 dark:text-green-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">LTV</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1">
							₦{(client.lifetimeValue / 1000).toFixed(0)}k
						</p>
						<p className="text-xs text-zinc-500">Lifetime value</p>
					</Card>

					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="p-1.5 lg:p-2 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-900">
									<TrendingUp className="size-4 lg:size-5 text-green-600 dark:text-green-400" />
								</div>
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">This Month</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1">
							₦{(client.recentSpending.thisMonth / 1000).toFixed(1)}k
						</p>
						<p
							className={`text-xs ${
								client.recentSpending.trend === "up"
									? "text-green-600 dark:text-green-400"
									: client.recentSpending.trend === "down"
									? "text-red-600 dark:text-red-400"
									: "text-zinc-500"
							}`}>
							{client.recentSpending.trend === "up"
								? "↑"
								: client.recentSpending.trend === "down"
								? "↓"
								: "→"}{" "}
							vs last month
						</p>
					</Card>

					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/50">
								<MessageSquare className="size-4 text-violet-600 dark:text-violet-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">Requests</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1">{client.totalRequests}</p>
						<p className="text-xs text-zinc-500">
							{client.completedRequests} completed
						</p>
					</Card>

					<Card className="p-3 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50">
								<Clock className="size-4 text-orange-600 dark:text-orange-400" />
							</div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Response</p>
						</div>
						<p className="text-lg lg:text-2xl mb-1">
							{client.averageResponseTime.split(" ")[0]}
						</p>
						<p className="text-xs text-zinc-500">minutes</p>
					</Card>
				</div>

				{/* Performance Stats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
					<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<h3 className="text-base lg:text-lg mb-4 flex items-center gap-2">
							<Target className="size-5 text-violet-600 dark:text-violet-400" />
							Request Performance
						</h3>
						<div className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-zinc-600 dark:text-zinc-400">
										Completion Rate
									</span>
									<span className="text-sm">{completionRate}%</span>
								</div>
								<Progress
									value={completionRate}
									className="h-2"
								/>
							</div>

							<Separator className="bg-zinc-200 dark:bg-zinc-800" />

							<div className="grid grid-cols-3 gap-4">
								<div>
									<div className="flex items-center gap-2 mb-1">
										<CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
										<span className="text-xs text-zinc-500 dark:text-zinc-400">
											Completed
										</span>
									</div>
									<p className="text-xl">{client.completedRequests}</p>
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<Clock className="size-4 text-orange-600 dark:text-orange-400" />
										<span className="text-xs text-zinc-500 dark:text-zinc-400">
											Pending
										</span>
									</div>
									<p className="text-xl">{client.pendingRequests}</p>
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<AlertCircle className="size-4 text-red-600 dark:text-red-400" />
										<span className="text-xs text-zinc-500 dark:text-zinc-400">
											Urgent
										</span>
									</div>
									<p className="text-xl">{client.urgentTasks}</p>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<h3 className="text-base lg:text-lg mb-4 flex items-center gap-2">
							<User className="size-5 text-violet-600 dark:text-violet-400" />
							Client Satisfaction
						</h3>
						<div className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-zinc-600 dark:text-zinc-400">
										Satisfaction Score
									</span>
									<span className="text-sm">{client.satisfactionScore}%</span>
								</div>
								<Progress
									value={client.satisfactionScore}
									className="h-2"
								/>
							</div>

							<Separator className="bg-zinc-200 dark:bg-zinc-800" />

							<div>
								<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
									Preferred Categories
								</p>
								<div className="flex flex-wrap gap-2">
									{client.preferredCategories.map((category: string) => (
										<Badge
											key={category}
											variant="outline"
											className="text-xs border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400">
											{category}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</ScrollArea>
	);
}
