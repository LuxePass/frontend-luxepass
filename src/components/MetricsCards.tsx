import { Card } from "./ui/card";
import {
	CheckCircle2,
	Clock,
	TrendingUp,
	Users,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { cn } from "../utils";

interface Metric {
	label: string;
	value: string;
	change: number;
	icon: React.ElementType;
	iconColor: string;
}

const metrics: Metric[] = [
	{
		label: "Tasks Completed Today",
		value: "24",
		change: 12.5,
		icon: CheckCircle2,
		iconColor: "text-green-400",
	},
	{
		label: "Avg Response Time",
		value: "8 min",
		change: -15.3,
		icon: Clock,
		iconColor: "text-blue-400",
	},
	{
		label: "Client Satisfaction",
		value: "98%",
		change: 2.1,
		icon: TrendingUp,
		iconColor: "text-violet-400",
	},
	{
		label: "Active Clients",
		value: "47",
		change: 5.2,
		icon: Users,
		iconColor: "text-orange-400",
	},
];

export function MetricsCards() {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;
				const isPositive = metric.change > 0;
				const isNegativeGood = metric.label.includes("Response Time");
				const showPositive = isNegativeGood ? !isPositive : isPositive;

				return (
					<Card
						key={metric.label}
						className="p-4 lg:p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
						<div className="flex items-start justify-between mb-3 lg:mb-3">
							<div
								className={cn(
									"p-2 lg:p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50",
									metric.iconColor
								)}>
								<Icon className="size-5 lg:size-5" />
							</div>
							<div
								className={cn(
									"flex items-center gap-1 text-xs px-2 lg:px-2 py-1 lg:py-1 rounded",
									showPositive
										? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50"
										: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50"
								)}>
								{showPositive ? (
									<ArrowUp className="size-3 lg:size-3" />
								) : (
									<ArrowDown className="size-3 lg:size-3" />
								)}
								<span>{Math.abs(metric.change)}%</span>
							</div>
						</div>
						<div>
							<p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1 line-clamp-2">
								{metric.label}
							</p>
							<p className="text-2xl lg:text-2xl">{metric.value}</p>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
