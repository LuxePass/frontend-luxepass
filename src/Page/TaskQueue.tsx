/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useBookings, type Booking } from "../hooks/useBookings";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
	ListTodo,
	MoreVertical,
	UserPlus,
	CheckCircle2,
	Clock,
	AlertCircle,
} from "lucide-react";
import { cn } from "../utils";
import { customToast } from "./CustomToast";

interface TaskQueueProps {
	selectedClient: string | null;
}

export function TaskQueue({ selectedClient }: TaskQueueProps) {
	const { bookings, getBookings, confirmBooking, updateBookingStatus, loading } =
		useBookings();
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

	useEffect(() => {
		getBookings();
	}, [getBookings]);

	const handleConfirm = async (taskId: string) => {
		try {
			await confirmBooking(taskId);
			customToast.success({
				title: "Booking Confirmed",
				description: "The booking has been confirmed successfully",
			});
			getBookings();
		} catch (err) {
			customToast.error("Failed to confirm booking");
		}
	};

	const handleCancel = async (taskId: string) => {
		try {
			await updateBookingStatus(taskId, "CANCELLED");
			customToast.success({
				title: "Booking Cancelled",
				description: "The booking has been marked as cancelled",
			});
			getBookings();
		} catch (err) {
			customToast.error("Failed to cancel booking");
		}
	};

	const getPriorityBadge = (status: string) => {
		if (status === "INQUIRY") {
			return (
				<Badge className="text-[10px] bg-red-600 hover:bg-red-600 text-white dark:bg-red-500/50 dark:border-red-500 border-none px-1.5 uppercase font-bold tracking-tighter">
					Urgent Inquiry
				</Badge>
			);
		}
		return (
			<Badge className="text-[10px] bg-blue-600 hover:bg-blue-600 text-white dark:bg-blue-500/50 dark:border-blue-500 border-none px-1.5 uppercase font-bold tracking-tighter">
				{status}
			</Badge>
		);
	};

	const inquiries = useMemo(() => {
		return bookings.filter((b) => b.status === "INQUIRY");
	}, [bookings]);

	return (
		<Card className="h-full flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-none rounded-none lg:rounded-xl">
			<div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
				<div className="flex items-center gap-2 mb-1">
					<ListTodo className="size-5 text-violet-500 dark:text-violet-400" />
					<h3 className="text-base lg:text-lg font-bold">Booking Tasks</h3>
				</div>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					{inquiries.length} pending inquiry
					{inquiries.length !== 1 ? "s" : ""}
				</p>
			</div>

			<ScrollArea className="flex-1 overflow-auto">
				<div className="p-2 lg:p-4 flex flex-col gap-2 lg:gap-3 pb-safe">
					{loading ? (
						<div className="flex items-center justify-center p-10">
							<div className="size-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
						</div>
					) : inquiries.length === 0 ? (
						<div className="p-8 text-center">
							<CheckCircle2 className="size-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
							<p className="text-zinc-400 dark:text-zinc-400 font-medium">
								All caught up!
							</p>
						</div>
					) : (
						inquiries.map((task) => (
							<Card
								key={task.id}
								className={cn(
									"p-2.5 lg:p-3 transition-all hover:shadow-md border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10 border-zinc-200 dark:border-zinc-800 shadow-none font-sans"
								)}>
								<div className="flex items-start justify-between gap-2 mb-2">
									<div className="flex-1 min-w-0">
										<h4 className="text-sm font-bold mb-1 line-clamp-2 capitalize">
											{task.type.toLowerCase()} booking request
										</h4>
										<p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
											Booking ID: {task.id.slice(-8).toUpperCase()}
										</p>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="size-7 p-0 shrink-0">
												<MoreVertical className="size-3.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-sans">
											<DropdownMenuItem
												onClick={() => handleConfirm(task.id)}
												className="text-sm font-medium">
												<CheckCircle2 className="size-3.5 mr-2" />
												Confirm
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleCancel(task.id)}
												className="text-sm font-medium text-red-600">
												<AlertCircle className="size-3.5 mr-2" />
												Cancel Inq.
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="flex items-center gap-2 flex-wrap mb-2">
									{getPriorityBadge(task.status)}
									<Badge
										variant="outline"
										className="text-[10px] border-zinc-300 dark:border-zinc-700 uppercase font-semibold border-none bg-zinc-100 dark:bg-zinc-800">
										{task.currency} {parseFloat(task.totalAmount).toLocaleString()}
									</Badge>
								</div>

								<div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-tighter">
									<Clock className="size-3" />
									<span>Requested {new Date(task.createdAt).toLocaleDateString()}</span>
								</div>
							</Card>
						))
					)}
				</div>
			</ScrollArea>
		</Card>
	);
}
