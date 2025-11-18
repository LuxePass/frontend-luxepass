/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn } from "../utils";
import { customToast } from "./CustomToast";

import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
	TrendingUp,
	DollarSign,
	Search,
	ChevronRight,
	MoreVertical,
	Eye,
	Download,
	CheckCircle2,
	Network,
	BarChart3,
	Filter,
} from "lucide-react";

interface ReferralActivity {
	id: string;
	referrerId: string;
	referrerName: string;
	referredId: string;
	referredName: string;
	referredEmail: string;
	referredPhone: string;
	dateReferred: string;
	dateJoined: string | null;
	status: "pending" | "joined" | "active" | "inactive";
	rewardStatus: "pending" | "processing" | "paid" | "cancelled";
	rewardAmount: number;
	tierLevel: number;
	totalSpent: number;
	lifetimeValue: number;
}

interface ClientReferralStats {
	clientId: string;
	clientName: string;
	totalReferrals: number;
	successfulReferrals: number;
	pendingReferrals: number;
	totalRewardsEarned: number;
	pendingRewards: number;
	lifetimeValueGenerated: number;
	joinDate: string;
	referralTier: "bronze" | "silver" | "gold" | "platinum";
	conversionRate: number;
}

const mockActivities: ReferralActivity[] = [
	{
		id: "1",
		referrerId: "r1",
		referrerName: "Adaeze Nnamdi",
		referredId: "c1",
		referredName: "Chidinma Okonkwo",
		referredEmail: "chidinma.okonkwo@email.com",
		referredPhone: "+234 (0)803 456 7890",
		dateReferred: "2025-09-15",
		dateJoined: "2025-09-16",
		status: "active",
		rewardStatus: "paid",
		rewardAmount: 500,
		tierLevel: 1,
		totalSpent: 45000,
		lifetimeValue: 45000,
	},
	{
		id: "2",
		referrerId: "c1",
		referrerName: "Chidinma Okonkwo",
		referredId: "c2",
		referredName: "Emeka Adeleke",
		referredEmail: "emeka.adeleke@email.com",
		referredPhone: "+234 (0)805 123 4567",
		dateReferred: "2025-10-01",
		dateJoined: "2025-10-02",
		status: "active",
		rewardStatus: "paid",
		rewardAmount: 250,
		tierLevel: 2,
		totalSpent: 28000,
		lifetimeValue: 28000,
	},
	{
		id: "3",
		referrerId: "r1",
		referrerName: "Adaeze Nnamdi",
		referredId: "c3",
		referredName: "Amara Nwosu",
		referredEmail: "amara.nwosu@email.com",
		referredPhone: "+234 (0)816 789 0123",
		dateReferred: "2025-10-10",
		dateJoined: "2025-10-11",
		status: "active",
		rewardStatus: "processing",
		rewardAmount: 250,
		tierLevel: 1,
		totalSpent: 22000,
		lifetimeValue: 22000,
	},
	{
		id: "4",
		referrerId: "c2",
		referrerName: "Emeka Adeleke",
		referredId: "c4",
		referredName: "Chukwudi Okafor",
		referredEmail: "chukwudi.okafor@email.com",
		referredPhone: "+234 (0)818 234 5678",
		dateReferred: "2025-10-12",
		dateJoined: null,
		status: "pending",
		rewardStatus: "pending",
		rewardAmount: 0,
		tierLevel: 2,
		totalSpent: 0,
		lifetimeValue: 0,
	},
	{
		id: "5",
		referrerId: "c1",
		referrerName: "Chidinma Okonkwo",
		referredId: "c5",
		referredName: "Ngozi Adekunle",
		referredEmail: "ngozi.adekunle@email.com",
		referredPhone: "+234 (0)809 345 6789",
		dateReferred: "2025-10-18",
		dateJoined: "2025-10-18",
		status: "active",
		rewardStatus: "processing",
		rewardAmount: 250,
		tierLevel: 2,
		totalSpent: 15000,
		lifetimeValue: 15000,
	},
	{
		id: "6",
		referrerId: "r1",
		referrerName: "Adaeze Nnamdi",
		referredId: "c6",
		referredName: "Kunle Bamidele",
		referredEmail: "kunle.bamidele@email.com",
		referredPhone: "+234 (0)807 567 8901",
		dateReferred: "2025-08-20",
		dateJoined: "2025-08-21",
		status: "active",
		rewardStatus: "paid",
		rewardAmount: 1000,
		tierLevel: 1,
		totalSpent: 89000,
		lifetimeValue: 89000,
	},
	{
		id: "7",
		referrerId: "r1",
		referrerName: "Adaeze Nnamdi",
		referredId: "c7",
		referredName: "Yetunde Oluwaseun",
		referredEmail: "yetunde.oluwaseun@email.com",
		referredPhone: "+234 (0)810 678 9012",
		dateReferred: "2025-09-05",
		dateJoined: null,
		status: "pending",
		rewardStatus: "pending",
		rewardAmount: 0,
		tierLevel: 1,
		totalSpent: 0,
		lifetimeValue: 0,
	},
];

const mockClientStats: ClientReferralStats[] = [
	{
		clientId: "r1",
		clientName: "Adaeze Nnamdi",
		totalReferrals: 5,
		successfulReferrals: 4,
		pendingReferrals: 1,
		totalRewardsEarned: 2000,
		pendingRewards: 250,
		lifetimeValueGenerated: 178000,
		joinDate: "2025-06-01",
		referralTier: "platinum",
		conversionRate: 80,
	},
	{
		clientId: "c1",
		clientName: "Chidinma Okonkwo",
		totalReferrals: 2,
		successfulReferrals: 2,
		pendingReferrals: 0,
		totalRewardsEarned: 500,
		pendingRewards: 250,
		lifetimeValueGenerated: 43000,
		joinDate: "2025-09-16",
		referralTier: "gold",
		conversionRate: 100,
	},
	{
		clientId: "c2",
		clientName: "Emeka Adeleke",
		totalReferrals: 1,
		successfulReferrals: 0,
		pendingReferrals: 1,
		totalRewardsEarned: 0,
		pendingRewards: 0,
		lifetimeValueGenerated: 0,
		joinDate: "2025-10-02",
		referralTier: "bronze",
		conversionRate: 0,
	},
];

export function ReferralProgram() {
	const [activities, setActivities] = useState(mockActivities);
	const [clientStats, setClientStats] = useState(mockClientStats);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [rewardFilter, setRewardFilter] = useState<string>("all");
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] =
		useState<ReferralActivity | null>(null);

	const filteredActivities = activities.filter((activity) => {
		const matchesSearch =
			activity.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			activity.referredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			activity.referredEmail.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || activity.status === statusFilter;
		const matchesReward =
			rewardFilter === "all" || activity.rewardStatus === rewardFilter;

		return matchesSearch && matchesStatus && matchesReward;
	});

	const filteredClientStats = clientStats.filter((client) =>
		client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalStats = {
		totalReferrals: activities.length,
		successfulReferrals: activities.filter((a) => a.status === "active").length,
		pendingReferrals: activities.filter((a) => a.status === "pending").length,
		totalRewardsPaid: activities.reduce(
			(sum, a) => (a.rewardStatus === "paid" ? sum + a.rewardAmount : sum),
			0
		),
		totalRewardsPending: activities.reduce(
			(sum, a) =>
				a.rewardStatus === "processing" || a.rewardStatus === "pending"
					? sum + a.rewardAmount
					: sum,
			0
		),
		totalLifetimeValue: activities.reduce((sum, a) => sum + a.lifetimeValue, 0),
		avgConversionRate: Math.round(
			clientStats.reduce((sum, c) => sum + c.conversionRate, 0) /
				clientStats.length
		),
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900">
						Active
					</Badge>
				);
			case "joined":
				return (
					<Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-900">
						Joined
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900">
						Pending
					</Badge>
				);
			case "inactive":
				return (
					<Badge className="bg-zinc-200 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-400 border-zinc-400 dark:border-zinc-600">
						Inactive
					</Badge>
				);
			default:
				return null;
		}
	};

	const getRewardStatusBadge = (status: string) => {
		switch (status) {
			case "paid":
				return (
					<Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900">
						Paid
					</Badge>
				);
			case "processing":
				return (
					<Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-900">
						Processing
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900">
						Pending
					</Badge>
				);
			case "cancelled":
				return (
					<Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900">
						Cancelled
					</Badge>
				);
			default:
				return null;
		}
	};

	const handleViewDetails = (id: string) => {
		const activity = activities.find((a) => a.id === id);
		if (activity) {
			setSelectedActivity(activity);
			setDetailsDialogOpen(true);
		}
	};

	const handleProcessReward = (id: string) => {
		customToast.success({
			title: "Reward Processing",
			description: "Reward has been marked for processing",
		});
	};

	const handleExport = () => {
		customToast.success({
			title: "Export Started",
			description: "Referral data is being exported...",
		});
	};

	return (
		<div className="h-full">
			<ScrollArea className="h-full overflow-auto">
				<div className="w-full max-w-[1280px] mx-auto space-y-4 lg:space-y-5 p-3 lg:p-5 pb-safe">
					{/* Admin Overview Stats */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
						<Card className="p-3 lg:p-3 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
							<div className="flex items-start gap-2 mb-2 lg:mb-2">
								<div className="p-1.5 lg:p-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/50 border border-violet-300 dark:border-violet-900 shrink-0">
									<Network className="size-4 lg:size-4 text-violet-600 dark:text-violet-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 truncate">
										Total Referrals
									</p>
									<p className="text-xl lg:text-xl truncate">
										{totalStats.totalReferrals}
									</p>
								</div>
							</div>
							<div className="text-xs text-zinc-500 truncate">
								<span className="text-green-600 dark:text-green-400">
									{totalStats.successfulReferrals} successful
								</span>
								{" • "}
								<span className="text-orange-600 dark:text-orange-400">
									{totalStats.pendingReferrals} pending
								</span>
							</div>
						</Card>

						<Card className="p-3 lg:p-3 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
							<div className="flex items-start gap-2 mb-2 lg:mb-2">
								<div className="p-1.5 lg:p-1.5 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-900 shrink-0">
									<DollarSign className="size-4 lg:size-4 text-green-600 dark:text-green-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 truncate">
										Rewards Paid
									</p>
									<p className="text-xl lg:text-xl truncate">
										₦{(totalStats.totalRewardsPaid / 1000).toFixed(1)}k
									</p>
								</div>
							</div>
							<div className="text-xs text-zinc-500 truncate">
								₦{totalStats.totalRewardsPending} pending
							</div>
						</Card>

						<Card className="p-3 lg:p-3 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
							<div className="flex items-start gap-2 mb-2 lg:mb-2">
								<div className="p-1.5 lg:p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-900 shrink-0">
									<TrendingUp className="size-4 lg:size-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 truncate">
										Generated LTV
									</p>
									<p className="text-xl lg:text-xl truncate">
										₦{(totalStats.totalLifetimeValue / 1000).toFixed(0)}k
									</p>
								</div>
							</div>
							<div className="text-xs text-zinc-500 truncate">
								Lifetime value from referrals
							</div>
						</Card>

						<Card className="p-3 lg:p-3 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
							<div className="flex items-start gap-2 mb-2 lg:mb-2">
								<div className="p-1.5 lg:p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-950/50 border border-yellow-300 dark:border-yellow-900 shrink-0">
									<BarChart3 className="size-4 lg:size-4 text-yellow-600 dark:text-yellow-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 truncate">
										Conversion Rate
									</p>
									<p className="text-xl lg:text-xl truncate">
										{totalStats.avgConversionRate}%
									</p>
								</div>
							</div>
							<div className="text-xs text-zinc-500 truncate">
								Average across all referrers
							</div>
						</Card>
					</div>

					<Tabs
						defaultValue="activity"
						className="space-y-4 lg:space-y-5">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
							<div className="flex items-center justify-between w-full sm:flex-1">
								<TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
									<TabsTrigger
										value="activity"
										className="text-xs lg:text-sm">
										Referral Activity
									</TabsTrigger>
									<TabsTrigger
										value="clients"
										className="text-xs lg:text-sm">
										Client Stats
									</TabsTrigger>
									<TabsTrigger
										value="network"
										className="text-xs lg:text-sm">
										Network Map
									</TabsTrigger>
								</TabsList>
								<Button
									onClick={handleExport}
									className="bg-violet-600 hover:bg-violet-700 sm:hidden shrink-0 ml-2">
									<Download className="size-4" />
								</Button>
							</div>
							<Button
								onClick={handleExport}
								className="hidden sm:flex bg-violet-600 hover:bg-violet-700 shrink-0">
								<Download className="size-4 mr-2" />
								Export Report
							</Button>
						</div>

						{/* Referral Activity Tab */}
						<TabsContent
							value="activity"
							className="space-y-4">
							<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
								<div className="flex flex-col lg:flex-row gap-3 mb-6">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
										<Input
											placeholder="Search by referrer, referred person, or email..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
										/>
									</div>
									<div className="flex gap-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="border-zinc-300 dark:border-zinc-700 flex-1 sm:flex-none">
													<Filter className="size-4 mr-2" />
													<span className="truncate">
														Status: {statusFilter === "all" ? "All" : statusFilter}
													</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
												<DropdownMenuItem onClick={() => setStatusFilter("all")}>
													All
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setStatusFilter("active")}>
													Active
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setStatusFilter("joined")}>
													Joined
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setStatusFilter("pending")}>
													Pending
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
													Inactive
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="border-zinc-300 dark:border-zinc-700 flex-1 sm:flex-none">
													<Filter className="size-4 mr-2" />
													<span className="truncate">
														Reward: {rewardFilter === "all" ? "All" : rewardFilter}
													</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
												<DropdownMenuItem onClick={() => setRewardFilter("all")}>
													All
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setRewardFilter("paid")}>
													Paid
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setRewardFilter("processing")}>
													Processing
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setRewardFilter("pending")}>
													Pending
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setRewardFilter("cancelled")}>
													Cancelled
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								{/* Desktop Table */}
								<div className="hidden lg:block overflow-x-auto -mx-6 pb-2">
									<div className="inline-block min-w-full align-middle px-6">
										<Table>
											<TableHeader>
												<TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[140px]">
														Referrer
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[140px]">
														Referred
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[160px] hidden xl:table-cell">
														Contact
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[110px]">
														Date
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[90px]">
														Status
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[100px] hidden xl:table-cell">
														Reward
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[80px]">
														Amount
													</TableHead>
													<TableHead className="text-zinc-600 dark:text-zinc-400 w-[90px] hidden 2xl:table-cell">
														LTV
													</TableHead>
													<TableHead className="w-[50px]"></TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredActivities.map((activity) => (
													<TableRow
														key={activity.id}
														className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
														<TableCell className="py-2">
															<div className="flex items-center gap-2">
																<Avatar className="size-7 border border-zinc-300 dark:border-zinc-700 shrink-0">
																	<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-[10px]">
																		{getInitials(activity.referrerName)}
																	</AvatarFallback>
																</Avatar>
																<div className="min-w-0">
																	<p className="text-xs truncate">{activity.referrerName}</p>
																	<p className="text-[10px] text-zinc-500 dark:text-zinc-500">
																		T{activity.tierLevel}
																	</p>
																</div>
															</div>
														</TableCell>
														<TableCell className="py-2">
															<div className="flex items-center gap-2">
																<Avatar className="size-7 border border-zinc-300 dark:border-zinc-700 shrink-0">
																	<AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-[10px]">
																		{getInitials(activity.referredName)}
																	</AvatarFallback>
																</Avatar>
																<span className="text-xs truncate">
																	{activity.referredName}
																</span>
															</div>
														</TableCell>
														<TableCell className="py-2 hidden xl:table-cell">
															<p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
																{activity.referredEmail}
															</p>
															<p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
																{activity.referredPhone}
															</p>
														</TableCell>
														<TableCell className="py-2 text-xs text-zinc-600 dark:text-zinc-400">
															<p className="truncate">{activity.dateReferred}</p>
															{activity.dateJoined && (
																<p className="text-[10px] text-green-600 dark:text-green-400 truncate">
																	Joined
																</p>
															)}
														</TableCell>
														<TableCell className="py-2">
															{getStatusBadge(activity.status)}
														</TableCell>
														<TableCell className="py-2 hidden xl:table-cell">
															{getRewardStatusBadge(activity.rewardStatus)}
														</TableCell>
														<TableCell className="py-2">
															<span
																className={cn(
																	"text-xs whitespace-nowrap",
																	activity.rewardAmount > 0
																		? "text-green-600 dark:text-green-400"
																		: "text-zinc-500"
																)}>
																₦{activity.rewardAmount}
															</span>
														</TableCell>
														<TableCell className="py-2 hidden 2xl:table-cell">
															<span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
																₦{(activity.lifetimeValue / 1000).toFixed(0)}k
															</span>
														</TableCell>
														<TableCell className="py-2">
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="size-7 p-0">
																		<MoreVertical className="size-3.5" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent
																	align="end"
																	className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
																	<DropdownMenuItem
																		onClick={() => handleViewDetails(activity.id)}>
																		<Eye className="size-4 mr-2" />
																		View Details
																	</DropdownMenuItem>
																	{activity.rewardStatus === "pending" && (
																		<DropdownMenuItem
																			onClick={() => handleProcessReward(activity.id)}>
																			<CheckCircle2 className="size-4 mr-2" />
																			Process Reward
																		</DropdownMenuItem>
																	)}
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</div>

								{/* Mobile Cards */}
								<div className="lg:hidden space-y-3">
									{filteredActivities.map((activity) => (
										<Card
											key={activity.id}
											className="p-4 bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
											<div className="space-y-3">
												<div className="flex items-start justify-between gap-2">
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<Avatar className="size-10 border border-zinc-200 dark:border-zinc-700 shrink-0">
															<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-xs">
																{getInitials(activity.referrerName)}
															</AvatarFallback>
														</Avatar>
														<div className="min-w-0">
															<p className="text-sm truncate">{activity.referrerName}</p>
															<p className="text-xs text-zinc-500 dark:text-zinc-500">
																Referrer • Tier {activity.tierLevel}
															</p>
														</div>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="size-8 p-0 shrink-0">
																<MoreVertical className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="end"
															className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
															<DropdownMenuItem onClick={() => handleViewDetails(activity.id)}>
																<Eye className="size-4 mr-2" />
																View Details
															</DropdownMenuItem>
															{activity.rewardStatus === "pending" && (
																<DropdownMenuItem
																	onClick={() => handleProcessReward(activity.id)}>
																	<CheckCircle2 className="size-4 mr-2" />
																	Process Reward
																</DropdownMenuItem>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</div>

												<div className="flex items-center gap-2 text-sm">
													<ChevronRight className="size-4 text-zinc-400 dark:text-zinc-500" />
													<Avatar className="size-8 border border-zinc-200 dark:border-zinc-700">
														<AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-xs">
															{getInitials(activity.referredName)}
														</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<p className="text-sm truncate">{activity.referredName}</p>
														<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
															{activity.referredEmail}
														</p>
													</div>
												</div>

												<div className="flex items-center gap-2 flex-wrap">
													{getStatusBadge(activity.status)}
													{getRewardStatusBadge(activity.rewardStatus)}
												</div>

												<div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-500">Reward</p>
														<p
															className={cn(
																"text-sm",
																activity.rewardAmount > 0
																	? "text-green-600 dark:text-green-400"
																	: "text-zinc-500"
															)}>
															₦{activity.rewardAmount}
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-500">
															Client LTV
														</p>
														<p className="text-sm text-blue-600 dark:text-blue-400">
															₦{activity.lifetimeValue.toLocaleString()}
														</p>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>
							</Card>
						</TabsContent>

						{/* Client Stats Tab */}
						<TabsContent
							value="clients"
							className="space-y-4">
							<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
								<h4 className="mb-6">Top Referrers Performance</h4>

								<div className="space-y-4">
									{filteredClientStats.map((client, idx) => (
										<Card
											key={client.clientId}
											className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
											<div className="flex flex-col lg:flex-row lg:items-center gap-4">
												<div className="flex items-center gap-4 flex-1 min-w-0">
													<span className="text-2xl text-zinc-400 dark:text-zinc-600 w-8 shrink-0">
														#{idx + 1}
													</span>
													<Avatar className="size-12 border border-zinc-300 dark:border-zinc-700 shrink-0">
														<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600">
															{getInitials(client.clientName)}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1 flex-wrap">
															<p className="truncate">{client.clientName}</p>
														</div>
														<p className="text-sm text-zinc-500 dark:text-zinc-400">
															Member since {client.joinDate}
														</p>
													</div>
												</div>

												<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
															Total Referrals
														</p>
														<p className="text-lg">{client.totalReferrals}</p>
														<p className="text-xs text-green-600 dark:text-green-400">
															{client.successfulReferrals} successful
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
															Conversion Rate
														</p>
														<p className="text-lg">{client.conversionRate}%</p>
														<Progress
															value={client.conversionRate}
															className="h-1 mt-1"
														/>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
															Rewards Earned
														</p>
														<p className="text-lg text-green-600 dark:text-green-400">
															₦{client.totalRewardsEarned}
														</p>
														{client.pendingRewards > 0 && (
															<p className="text-xs text-orange-600 dark:text-orange-400">
																+₦{client.pendingRewards} pending
															</p>
														)}
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
															Generated LTV
														</p>
														<p className="text-lg text-blue-600 dark:text-blue-400">
															₦{client.lifetimeValueGenerated.toLocaleString()}
														</p>
														<p className="text-xs text-zinc-500">lifetime value</p>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>
							</Card>
						</TabsContent>

						{/* Network Map Tab */}
						<TabsContent
							value="network"
							className="space-y-4">
							<Card className="p-4 lg:p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
								<h4 className="mb-6">Referral Network Visualization</h4>

								<div className="space-y-6">
									{/* Build referral tree */}
									{clientStats.map((client) => {
										const clientReferrals = activities.filter(
											(a) => a.referrerName === client.clientName
										);

										if (clientReferrals.length === 0) return null;

										return (
											<div
												key={client.clientId}
												className="space-y-3">
												<div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
													<Avatar className="size-10 border-2 border-violet-600 shrink-0">
														<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600">
															{getInitials(client.clientName)}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1 flex-wrap">
															<p className="truncate">{client.clientName}</p>
														</div>
														<p className="text-sm text-zinc-500 dark:text-zinc-400">
															{clientReferrals.length} direct referral
															{clientReferrals.length !== 1 ? "s" : ""} • ₦
															{client.totalRewardsEarned} earned
														</p>
													</div>
												</div>

												<div className="ml-8 lg:ml-14 space-y-2">
													{clientReferrals.map((referral) => (
														<div
															key={referral.id}
															className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
															<div className="w-6 h-px bg-zinc-300 dark:bg-zinc-700 shrink-0" />
															<ChevronRight className="size-4 text-zinc-400 dark:text-zinc-600 shrink-0" />
															<Avatar className="size-8 border border-zinc-300 dark:border-zinc-700 shrink-0">
																<AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-xs">
																	{getInitials(referral.referredName)}
																</AvatarFallback>
															</Avatar>
															<div className="flex-1 min-w-0">
																<p className="text-sm truncate">{referral.referredName}</p>
																<p className="text-xs text-zinc-500">
																	{referral.referredEmail}
																</p>
															</div>
															<div className="flex items-center gap-2 shrink-0">
																{getStatusBadge(referral.status)}
																<span
																	className={cn(
																		"text-sm whitespace-nowrap",
																		referral.rewardAmount > 0
																			? "text-green-600 dark:text-green-400"
																			: "text-zinc-500"
																	)}>
																	₦{referral.rewardAmount}
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										);
									})}
								</div>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</ScrollArea>

			{/* Details Dialog */}
			<Dialog
				open={detailsDialogOpen}
				onOpenChange={setDetailsDialogOpen}>
				<DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<DialogHeader>
						<DialogTitle>Referral Details</DialogTitle>
						<DialogDescription>
							View detailed information about the referral.
						</DialogDescription>
					</DialogHeader>

					{selectedActivity && (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<Avatar className="size-10 border border-zinc-700">
									<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-xs">
										{getInitials(selectedActivity.referrerName)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm">{selectedActivity.referrerName}</p>
									<p className="text-xs text-zinc-500">
										Referrer • Tier {selectedActivity.tierLevel}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-4">
								<Avatar className="size-10 border border-zinc-700">
									<AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-xs">
										{getInitials(selectedActivity.referredName)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm">{selectedActivity.referredName}</p>
									<p className="text-xs text-zinc-500">
										{selectedActivity.referredEmail}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-zinc-500">Date Referred</p>
									<p className="text-sm">{selectedActivity.dateReferred}</p>
								</div>
								<div>
									<p className="text-xs text-zinc-500">Date Joined</p>
									<p className="text-sm">{selectedActivity.dateJoined || "N/A"}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-zinc-500">Status</p>
									<p className="text-sm">{getStatusBadge(selectedActivity.status)}</p>
								</div>
								<div>
									<p className="text-xs text-zinc-500">Reward Status</p>
									<p className="text-sm">
										{getRewardStatusBadge(selectedActivity.rewardStatus)}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-zinc-500">Reward Amount</p>
									<p
										className={cn(
											"text-sm",
											selectedActivity.rewardAmount > 0
												? "text-green-400"
												: "text-zinc-500"
										)}>
										₦{selectedActivity.rewardAmount}
									</p>
								</div>
								<div>
									<p className="text-xs text-zinc-500">Client LTV</p>
									<p className="text-sm text-blue-400">
										₦{selectedActivity.lifetimeValue.toLocaleString()}
									</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
