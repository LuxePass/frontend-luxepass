/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
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

interface Task {
	id: string;
	title: string;
	clientName: string;
	priority: "urgent" | "high" | "normal";
	status: "pending" | "in-progress" | "review";
	assignedTo?: string;
	dueDate: string;
	category: string;
}

const mockTasks: Task[] = [
	{
		id: "1",
		title: "Finalize restaurant reservation at Nok by Alara",
		clientName: "Chidinma Okonkwo",
		priority: "urgent",
		status: "pending",
		dueDate: "Today, 5:00 PM",
		category: "Dining",
	},
	{
		id: "2",
		title: "Confirm private jet booking to Abuja",
		clientName: "Amara Nwosu",
		priority: "urgent",
		status: "in-progress",
		assignedTo: "You",
		dueDate: "Tomorrow, 2:00 PM",
		category: "Travel",
	},
	{
		id: "3",
		title: "Coordinate art gallery private viewing at Nike Art Centre",
		clientName: "Ngozi Adekunle",
		priority: "urgent",
		status: "pending",
		dueDate: "Oct 21, 6:00 PM",
		category: "Events",
	},
	{
		id: "4",
		title: "Process wine collection delivery to Victoria Island",
		clientName: "Chukwudi Okafor",
		priority: "normal",
		status: "review",
		assignedTo: "Folake A.",
		dueDate: "Oct 22",
		category: "Shopping",
	},
	{
		id: "5",
		title: "Update property viewing schedule in Lekki Phase 1",
		clientName: "Emeka Adeleke",
		priority: "normal",
		status: "in-progress",
		assignedTo: "You",
		dueDate: "Oct 23",
		category: "Real Estate",
	},
	{
		id: "6",
		title: "Arrange yacht charter for Lagos Lagoon cruise",
		clientName: "Chidinma Okonkwo",
		priority: "urgent",
		status: "pending",
		dueDate: "Today, 8:00 PM",
		category: "Travel",
	},
	{
		id: "7",
		title: "Secure VIP tickets for Lagos Fashion Week",
		clientName: "Ngozi Adekunle",
		priority: "urgent",
		status: "in-progress",
		assignedTo: "You",
		dueDate: "Tomorrow, 10:00 AM",
		category: "Events",
	},
	{
		id: "8",
		title: "Book private chef for anniversary dinner at Banana Island",
		clientName: "Emeka Adeleke",
		priority: "urgent",
		status: "pending",
		dueDate: "Oct 20, 3:00 PM",
		category: "Dining",
	},
	{
		id: "9",
		title: "Coordinate luxury car service for airport transfer to MMA2",
		clientName: "Amara Nwosu",
		priority: "urgent",
		status: "review",
		assignedTo: "Tunde K.",
		dueDate: "Oct 20, 6:00 AM",
		category: "Transportation",
	},
	{
		id: "10",
		title: "Arrange spa day at Eko Hotel & Suites",
		clientName: "Chidinma Okonkwo",
		priority: "high",
		status: "pending",
		dueDate: "Oct 21, 11:00 AM",
		category: "Wellness",
	},
	{
		id: "11",
		title: "Reserve VIP lounge for AfroBasket finals",
		clientName: "Chukwudi Okafor",
		priority: "urgent",
		status: "in-progress",
		assignedTo: "You",
		dueDate: "Oct 19, 7:00 PM",
		category: "Entertainment",
	},
	{
		id: "12",
		title: "Organize private tour at National Museum Lagos",
		clientName: "Ngozi Adekunle",
		priority: "urgent",
		status: "pending",
		dueDate: "Oct 22, 2:00 PM",
		category: "Culture",
	},
];

interface TaskQueueProps {
	selectedClient: string | null;
}

interface TeamMember {
	id: string;
	name: string;
	role: "Admin" | "PA";
	availability: "available" | "busy" | "offline";
	activeTasks: number;
}

const mockTeamMembers: TeamMember[] = [
	{
		id: "1",
		name: "Folake Adeyemi",
		role: "PA",
		availability: "available",
		activeTasks: 3,
	},
	{
		id: "2",
		name: "Tunde Okafor",
		role: "PA",
		availability: "busy",
		activeTasks: 7,
	},
	{
		id: "3",
		name: "Chioma Nwankwo",
		role: "Admin",
		availability: "available",
		activeTasks: 2,
	},
	{
		id: "4",
		name: "Ibrahim Yusuf",
		role: "PA",
		availability: "available",
		activeTasks: 4,
	},
	{
		id: "5",
		name: "Ngozi Eze",
		role: "Admin",
		availability: "offline",
		activeTasks: 0,
	},
	{
		id: "6",
		name: "Akin Adebayo",
		role: "PA",
		availability: "busy",
		activeTasks: 6,
	},
];

export function TaskQueue({ selectedClient }: TaskQueueProps) {
	const [tasks, setTasks] = useState(mockTasks);
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

	const handleAssignClick = (taskId: string) => {
		setSelectedTaskId(taskId);
		setAssignDialogOpen(true);
	};

	const handleAssignToMember = (memberId: string, memberName: string) => {
		if (selectedTaskId) {
			setTasks(
				tasks.map((task) =>
					task.id === selectedTaskId
						? { ...task, assignedTo: memberName, status: "in-progress" }
						: task
				)
			);
			customToast.success({
				title: "Task Assigned",
				description: `Task has been assigned to ${memberName}`,
			});
			setAssignDialogOpen(false);
			setSelectedTaskId(null);
		}
	};

	const handleHandOff = (taskId: string) => {
		customToast.info({
			title: "Hand-off Initiated",
			description: "Select a team member to hand off this task",
		});
	};

	const handleComplete = (taskId: string) => {
		setTasks(tasks.filter((t) => t.id !== taskId));
		customToast.success({
			title: "Task Completed",
			description: "Task has been marked as complete",
		});
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900";
			case "high":
				return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900";
			default:
				return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <AlertCircle className="size-4" />;
			case "in-progress":
				return <Clock className="size-4" />;
			case "review":
				return <CheckCircle2 className="size-4" />;
			default:
				return null;
		}
	};

	const getPriorityBadge = (priority: string) => {
		switch (priority) {
			case "urgent":
				return (
					<Badge className="text-xs bg-red-600 hover:bg-red-600 text-white dark:bg-red-500/50 dark:border-red-500">
						Urgent
					</Badge>
				);
			case "high":
				return (
					<Badge className="text-xs bg-orange-600 hover:bg-orange-600 text-white dark:bg-orange-500/50 dark:border-orange-500">
						High
					</Badge>
				);
			default:
				return (
					<Badge className="text-xs bg-blue-600 hover:bg-blue-600 text-white dark:bg-blue-500/50 dark:border-blue-500">
						Normal
					</Badge>
				);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge className="text-xs bg-red-600 hover:bg-red-600 text-white dark:bg-red-500/50 dark:border-red-500">
						Pending
					</Badge>
				);
			case "in-progress":
				return (
					<Badge className="text-xs bg-orange-600 hover:bg-orange-600 text-white dark:bg-orange-500/50 dark:border-orange-500">
						In Progress
					</Badge>
				);
			case "review":
				return (
					<Badge className="text-xs bg-green-600 hover:bg-green-600 text-white dark:bg-green-500/50 dark:border-green-500">
						Review
					</Badge>
				);
			default:
				return null;
		}
	};

	const filteredTasks = tasks.filter((task) => task.priority === "urgent");

	return (
		<Card className="h-full flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden">
			<div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
				<div className="flex items-center gap-2 mb-1">
					<ListTodo className="size-5 text-violet-500 dark:text-violet-400" />
					<h3 className="text-base lg:text-lg">Task Queue</h3>
				</div>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					{tasks.filter((t) => t.priority === "urgent").length} urgent task
					{tasks.filter((t) => t.priority === "urgent").length !== 1 ? "s" : ""}
				</p>
			</div>

			<ScrollArea className="flex-1 overflow-auto">
				<div className="p-2 lg:p-4 flex flex-col gap-2 lg:gap-3 pb-safe">
					{filteredTasks.length === 0 ? (
						<div className="p-8 text-center">
							<ListTodo className="size-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
							<p className="text-zinc-400 dark:text-zinc-400">No tasks found</p>
						</div>
					) : (
						filteredTasks.map((task) => (
							<Card
								key={task.id}
								className={cn(
									"p-2.5 lg:p-3 transition-all hover:shadow-md border-l-4",
									task.priority === "urgent" &&
										"border-l-red-500 bg-red-50/50 dark:bg-red-950/10 border-zinc-200 dark:border-zinc-800",
									task.priority === "high" &&
										"border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10 border-zinc-200 dark:border-zinc-800",
									task.priority === "normal" &&
										"border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10 border-zinc-200 dark:border-zinc-800"
								)}>
								<div className="flex items-start justify-between gap-2 mb-2">
									<div className="flex-1 min-w-0">
										<h4 className="text-sm mb-1 line-clamp-2">{task.title}</h4>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											{task.clientName}
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
											className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
											<DropdownMenuItem
												onClick={() => handleAssignClick(task.id)}
												className="text-sm">
												<UserPlus className="size-3.5 mr-2" />
												Assign
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleComplete(task.id)}
												className="text-sm">
												<CheckCircle2 className="size-3.5 mr-2" />
												Complete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="flex items-center gap-2 flex-wrap mb-2">
									{getPriorityBadge(task.priority)}
									{getStatusBadge(task.status)}
									{task.assignedTo && (
										<Badge
											variant="outline"
											className="text-xs border-zinc-300 dark:border-zinc-700">
											{task.assignedTo}
										</Badge>
									)}
								</div>

								<div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
									<Clock className="size-3" />
									<span>{task.dueDate}</span>
									<span className="mx-1">•</span>
									<span>{task.category}</span>
								</div>
							</Card>
						))
					)}
				</div>
			</ScrollArea>

			<Dialog
				open={assignDialogOpen}
				onOpenChange={setAssignDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Assign Task</DialogTitle>
						<DialogDescription>
							Select a PA or Admin to assign this task
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="max-h-[60vh]">
						<div className="flex flex-col gap-2 pr-4">
							{mockTeamMembers.map((member) => {
								const getInitials = (name: string) => {
									return name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase();
								};

								const getAvailabilityBadge = (availability: string) => {
									switch (availability) {
										case "available":
											return (
												<Badge className="text-xs bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-0">
													Available
												</Badge>
											);
										case "busy":
											return (
												<Badge className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-0">
													Busy
												</Badge>
											);
										case "offline":
											return (
												<Badge className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-0">
													Offline
												</Badge>
											);
										default:
											return null;
									}
								};

								return (
									<button
										key={member.id}
										onClick={() => handleAssignToMember(member.id, member.name)}
										className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
										disabled={member.availability === "offline"}>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<Avatar className="size-10 shrink-0">
												<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-sm">
													{getInitials(member.name)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<p className="text-sm truncate">{member.name}</p>
													<Badge
														variant="secondary"
														className="text-xs shrink-0">
														{member.role}
													</Badge>
												</div>
												<p className="text-xs text-zinc-500 dark:text-zinc-400">
													{member.activeTasks} active task
													{member.activeTasks !== 1 ? "s" : ""}
												</p>
											</div>
										</div>
										<div className="shrink-0 ml-2">
											{getAvailabilityBadge(member.availability)}
										</div>
									</button>
								);
							})}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
