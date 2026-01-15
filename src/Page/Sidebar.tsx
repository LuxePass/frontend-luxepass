import { useState, useEffect } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { AdminProfile } from "./AdminProfile";
import { useUsers } from "../hooks/useUsers";
import {
	Users,
	Wrench,
	MessageCircle,
	ListTodo,
	ShieldAlert,
	Building2,
	Network,
	ChevronRight,
	ChevronDown,
	Globe,
	ShieldCheck,
	Activity,
	User,
	LayoutDashboard,
	Wallet,
	Calendar,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils";

const toolItems = [
	{ id: "tasks", label: "Tasks", icon: ListTodo },
	{ id: "livechat", label: "Live Chat", icon: MessageCircle },
	{ id: "transfer", label: "Transfer", icon: ShieldAlert },
	{ id: "listings", label: "Listings", icon: Building2 },
];

interface SidebarProps {
	selectedClient: string | null;
	onSelectClient: (clientId: string) => void;
	searchQuery?: string;
	isMobile?: boolean;
	isDesktop?: boolean;
	onClose?: () => void;
	onLogout?: () => void;
	onNavigate?: (tab: string) => void;
	activeTab?: string;
}

export function Sidebar({
	selectedClient,
	onSelectClient,
	searchQuery,
	onClose,
	isDesktop,
	onLogout,
	onNavigate,
	activeTab,
}: SidebarProps) {
	const { user } = useAuth();
	const { users, getAssignedUsers } = useUsers();
	const [clientsExpanded, setClientsExpanded] = useState(false);
	const [toolsExpanded, setToolsExpanded] = useState(false);

	useEffect(() => {
		getAssignedUsers({ search: searchQuery });
	}, [getAssignedUsers, searchQuery]);

	const getInitials = (name: string) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	// Desktop version with full navigation
	if (isDesktop) {
		const navigationItems = [
			{
				id: "dashboard",
				label: "Dashboard",
				icon: LayoutDashboard,
			},
			{
				id: "clients",
				label: "Clients",
				icon: Users,
				badge: users.length,
				expandable: true,
			},
			{ id: "browser", label: "Browser", icon: Globe },
			{
				id: "tools",
				label: "Tools",
				icon: Wrench,
				expandable: true,
			},
			{ id: "referrals", label: "Referrals", icon: Network },
		];

		if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
			navigationItems.push(
				{ id: "bookings", label: "Bookings", icon: Calendar },
				{ id: "audit-logs", label: "Audit Logs", icon: Activity },
				{ id: "permissions", label: "PA Permissions", icon: ShieldCheck },
				{ id: "pa-management", label: "PA Management", icon: Users }
			);
		}

		return (
			<div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full">
				{/* Header */}
				<div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-lg">
							<img
								src="/vite.svg"
								alt="Luxepass Logo"
								className="w-6 h-6 object-contain"
							/>
						</div>
						<h2 className="text-sm font-semibold">Luxepass PA</h2>
					</div>
				</div>

				{/* Navigation */}
				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="p-3 space-y-1">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeTab === item.id;
							const isClientsSection = item.id === "clients";
							const isToolsSection = item.id === "tools";

							return (
								<div key={item.id}>
									<button
										onClick={() => {
											if (isClientsSection) {
												setClientsExpanded(!clientsExpanded);
											} else if (isToolsSection) {
												setToolsExpanded(!toolsExpanded);
											} else {
												onNavigate?.(item.id);
											}
										}}
										className={cn(
											"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
											isActive
												? "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
												: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
										)}>
										<Icon className="size-5 shrink-0" />
										<span className="flex-1 text-left">{item.label}</span>
										{item.badge !== undefined && !isClientsSection && (
											<Badge
												variant="secondary"
												className="bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 border-none">
												{item.badge}
											</Badge>
										)}
										{isClientsSection && (
											<div className="flex items-center gap-1">
												<Badge
													variant="secondary"
													className="bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 border-none">
													{item.badge}
												</Badge>
												{clientsExpanded ? (
													<ChevronDown className="size-4" />
												) : (
													<ChevronRight className="size-4" />
												)}
											</div>
										)}
										{isToolsSection &&
											(toolsExpanded ? (
												<ChevronDown className="size-4" />
											) : (
												<ChevronRight className="size-4" />
											))}
									</button>

									{/* Client List (shown when Clients is expanded) */}
									{isClientsSection && clientsExpanded && (
										<div className="ml-4 mt-1 space-y-1">
											{users.map((client) => (
												<button
													key={client.id}
													onClick={() => {
														onSelectClient(client.id);
													}}
													className={cn(
														"w-full p-2.5 rounded-lg text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
														selectedClient === client.id &&
															"bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-medium"
													)}>
													<div className="flex items-center gap-2">
														<Avatar className="size-8 border border-zinc-200 dark:border-zinc-700">
															<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs">
																{getInitials(client.name)}
															</AvatarFallback>
														</Avatar>

														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between mb-0.5">
																<p className="text-xs truncate font-medium">{client.name}</p>
																{/* unreadCount placeholder */}
															</div>
															<p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate uppercase tracking-tighter">
																{client.tier} • {client.status}
															</p>
														</div>
													</div>
												</button>
											))}
											{users.length === 0 && (
												<p className="text-[10px] text-zinc-500 px-3 py-2 italic text-center">
													No users found
												</p>
											)}
										</div>
									)}

									{/* Tools List (shown when Tools is expanded) */}
									{isToolsSection && toolsExpanded && (
										<div className="ml-4 mt-1 space-y-1">
											{toolItems.map((tool) => {
												const ToolIcon = tool.icon;
												const isToolActive = activeTab === tool.id;

												return (
													<button
														key={tool.id}
														onClick={() => onNavigate?.(tool.id)}
														className={cn(
															"w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
															isToolActive &&
																"bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-medium"
														)}>
														<ToolIcon className="size-4 shrink-0" />
														<span className="flex-1 text-left">{tool.label}</span>
													</button>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</ScrollArea>

				{/* Admin Profile */}
				<div className="border-t border-zinc-200 dark:border-zinc-800 p-3 shrink-0">
					<AdminProfile onLogout={onLogout} />
				</div>
			</div>
		);
	}

	// Mobile version - simplified navigation
	const mobileNavigationItems = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: LayoutDashboard,
		},
		{
			id: "clients",
			label: "Clients",
			icon: Users,
			badge: users.length,
		},
		{ id: "browser", label: "Browser", icon: Globe },
		{ id: "referrals", label: "Referrals", icon: Network },
	];

	if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
		mobileNavigationItems.push(
			{ id: "audit-logs", label: "Audit Logs", icon: Activity },
			{ id: "permissions", label: "PA Permissions", icon: ShieldCheck }
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-900">
			{/* Header */}
			<div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
						<User className="size-4 text-white" />
					</div>
					<h2 className="font-semibold">Menu</h2>
				</div>
			</div>

			{/* Navigation */}
			<ScrollArea className="flex-1">
				<div className="p-4 space-y-2">
					{mobileNavigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;

						return (
							<button
								key={item.id}
								onClick={() => {
									onNavigate?.(item.id);
									onClose?.();
								}}
								className={cn(
									"w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
									isActive
										? "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
										: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
								)}>
								<Icon className="size-5 shrink-0" />
								<span className="flex-1 text-left">{item.label}</span>
								{item.badge !== undefined && (
									<Badge
										variant="secondary"
										className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-none">
										{item.badge}
									</Badge>
								)}
							</button>
						);
					})}
				</div>
			</ScrollArea>

			{/* Admin Profile */}
			<div className="border-t border-zinc-200 dark:border-zinc-800 p-4 shrink-0">
				<AdminProfile onLogout={onLogout} />
			</div>
		</div>
	);
}
