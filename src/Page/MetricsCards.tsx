import { useEffect } from "react";
import { useUsers } from "../hooks/useUsers";
import { useBookings } from "../hooks/useBookings";
import { Card } from "../components/ui/card";
import {
	CheckCircle2,
	Clock,
	TrendingUp,
	Users as UsersIcon,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { cn } from "../utils";

export function MetricsCards() {
	const {
		dashboardStats: userStats,
		getDashboardStats: getUserDashboardStats,
		dashboardStatsLoading: loadingUsers,
	} = useUsers();
	const {
		dashboardStats: bookingStats,
		getDashboardStats: getBookingDashboardStats,
		dashboardStatsLoading: loadingBookings,
	} = useBookings();

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				await Promise.allSettled([
					getUserDashboardStats(),
					getBookingDashboardStats(),
				]);
			} catch (error: unknown) {
				console.warn("Failed to fetch dashboard stats", error);
			}
		};

		fetchDashboardData();
	}, [getUserDashboardStats, getBookingDashboardStats]);

	const pendingBookings = bookingStats?.pendingInquiries ?? 0;
	const confirmedBookings = bookingStats?.confirmedBookings ?? 0;
	const totalRevenue = bookingStats?.totalRevenue ?? 0;
	const assignedClients = userStats?.assignedClients ?? 0;

	const pendingChange = bookingStats?.growthRates?.pendingInquiries ?? 0;
	const confirmedChange = bookingStats?.growthRates?.confirmedBookings ?? 0;
	const revenueChange = bookingStats?.growthRates?.revenue ?? 0;
	const clientsChange = userStats?.growthRates?.assignedClients ?? 0;

	const metrics = [
		{
			label: "Assigned Clients",
			value: assignedClients.toString(),
			change: clientsChange,
			icon: UsersIcon,
			iconColor: "text-orange-400",
		},
		{
			label: "Pending Inquiries",
			value: pendingBookings.toString(),
			change: pendingChange,
			icon: Clock,
			iconColor: "text-blue-400",
		},
		{
			label: "Confirmed Bookings",
			value: confirmedBookings.toString(),
			change: confirmedChange,
			icon: CheckCircle2,
			iconColor: "text-green-400",
		},
		{
			label: "Estimated Revenue",
			value: "₦" + totalRevenue.toLocaleString(),
			change: revenueChange,
			icon: TrendingUp,
			iconColor: "text-violet-400",
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;
				const isPositive = metric.change > 0;
				const isNegativeGood =
					metric.label.includes("Response Time") || metric.label.includes("Pending");
				const showPositive = isNegativeGood ? !isPositive : isPositive;
				const isLoading =
					metric.label === "Assigned Clients" ? loadingUsers : loadingBookings;

				return (
					<Card
						key={metric.label}
						className="p-4 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
						{isLoading && (
							<div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-[1px] flex items-center justify-center z-10">
								<div className="size-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
							</div>
						)}
						<div className="flex items-start justify-between mb-3 lg:mb-3">
							<div
								className={cn(
									"p-2 lg:p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50",
									metric.iconColor,
								)}>
								<Icon className="size-5 lg:size-5" />
							</div>
							<div
								className={cn(
									"flex items-center gap-1 text-xs px-2 lg:px-2 py-1 lg:py-1 rounded",
									showPositive ?
										"text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50"
									:	"text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50",
								)}>
								{showPositive ?
									<ArrowUp className="size-3 lg:size-3" />
								:	<ArrowDown className="size-3 lg:size-3" />}
								<span>{Math.abs(metric.change)}%</span>
							</div>
						</div>
						<div>
							<p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1 line-clamp-2">
								{metric.label}
							</p>
							<p className="text-xl lg:text-2xl font-bold truncate">{metric.value}</p>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
