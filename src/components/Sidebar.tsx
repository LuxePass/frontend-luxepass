import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AdminProfile } from "./AdminProfile";
import {
	Users,
	LayoutDashboard,
	Wallet,
	Wrench,
	MessageCircle,
	ListTodo,
	ShieldAlert,
	Building2,
	Network,
	ChevronRight,
	ChevronDown,
	User,
	Globe,
} from "lucide-react";
import { cn } from "../utils";

interface Client {
	id: string;
	name: string;
	lastInteraction: string;
	unreadCount: number;
	status: "active" | "pending" | "archived";
	interactions: {
		date: string;
		type: string;
		summary: string;
	}[];
}

const mockClients: Client[] = [
	{
		id: "1",
		name: "Chidinma Okonkwo",
		lastInteraction: "2 min ago",
		unreadCount: 3,
		status: "active",
		interactions: [
			{
				date: "2025-10-19 14:30",
				type: "Email",
				summary: "Restaurant reservation at Nok by Alara",
			},
			{
				date: "2025-10-19 09:15",
				type: "Phone",
				summary: "Travel itinerary to Banana Island",
			},
			{
				date: "2025-10-18 16:45",
				type: "Message",
				summary: "Gift delivery to Ikoyi",
			},
		],
	},
	{
		id: "2",
		name: "Emeka Adeleke",
		lastInteraction: "1 hour ago",
		unreadCount: 0,
		status: "active",
		interactions: [
			{
				date: "2025-10-19 13:00",
				type: "Email",
				summary: "Property viewing in Lekki Phase 1",
			},
			{
				date: "2025-10-18 11:20",
				type: "Message",
				summary: "Event planning at Eko Hotel",
			},
		],
	},
	{
		id: "3",
		name: "Amara Nwosu",
		lastInteraction: "3 hours ago",
		unreadCount: 1,
		status: "pending",
		interactions: [
			{
				date: "2025-10-19 11:30",
				type: "Message",
				summary: "Private jet booking inquiry",
			},
			{
				date: "2025-10-17 14:00",
				type: "Phone",
				summary: "Membership tier upgrade",
			},
		],
	},
	{
		id: "4",
		name: "Chukwudi Okafor",
		lastInteraction: "Yesterday",
		unreadCount: 0,
		status: "active",
		interactions: [
			{
				date: "2025-10-18 18:30",
				type: "Email",
				summary: "Wine collection delivery to Victoria Island",
			},
			{
				date: "2025-10-17 10:00",
				type: "Message",
				summary: "Personal shopping at The Palms",
			},
		],
	},
	{
		id: "5",
		name: "Ngozi Adekunle",
		lastInteraction: "Yesterday",
		unreadCount: 2,
		status: "active",
		interactions: [
			{
				date: "2025-10-18 15:00",
				type: "Phone",
				summary: "Art gallery access at Nike Art Centre",
			},
			{
				date: "2025-10-16 12:30",
				type: "Email",
				summary: "Yacht charter pricing for Lagos Lagoon",
			},
		],
	},
];

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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isMobile,
	isDesktop,
	onLogout,
	onNavigate,
	activeTab,
}: SidebarProps) {
	const [clientsExpanded, setClientsExpanded] = useState(false);
	const [toolsExpanded, setToolsExpanded] = useState(false);

	const filteredClients = mockClients.filter((client) =>
		client.name.toLowerCase().includes(searchQuery?.toLowerCase() || "")
	);

	const getInitials = (name: string) => {
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
				badge: filteredClients.length,
				expandable: true,
			},
			{ id: "wallet", label: "Wallet", icon: Wallet },
			{ id: "browser", label: "Browser", icon: Globe },
			{
				id: "tools",
				label: "Tools",
				icon: Wrench,
				expandable: true,
			},
			{ id: "referrals", label: "Referrals", icon: Network },
		];

		return (
			<div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full">
				{/* Header */}
				<div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
					<div className="flex items-center gap-2">
						<div
							className="p-2 rounded-lg" /*className="bg-gradient-to-br from-violet-600 to-purple-600"*/
						>
							<img
								src="/vite.svg"
								alt="Luxepass Logo"
								className="w-6 h-6 object-contain"
							/>
						</div>
						<h2 className="text-sm">Luxepass PA</h2>
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
												className="bg-zinc-200 dark:bg-zinc-700 text-xs">
												{item.badge}
											</Badge>
										)}
										{isClientsSection && (
											<div className="flex items-center gap-1">
												<Badge
													variant="secondary"
													className="bg-zinc-200 dark:bg-zinc-700 text-xs">
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
											{filteredClients.map((client) => (
												<button
													key={client.id}
													onClick={() => {
														onSelectClient(client.id);
														onNavigate?.("clientdetails");
													}}
													className={cn(
														"w-full p-2.5 rounded-lg text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
														selectedClient === client.id &&
															"bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
													)}>
													<div className="flex items-center gap-2">
														<Avatar className="size-8 border border-zinc-300 dark:border-zinc-700">
															<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-xs">
																{getInitials(client.name)}
															</AvatarFallback>
														</Avatar>

														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between mb-0.5">
																<p className="text-xs truncate">{client.name}</p>
																{client.unreadCount > 0 && (
																	<Badge className="bg-violet-600 text-white text-[10px] h-4 px-1.5 ml-1">
																		{client.unreadCount}
																	</Badge>
																)}
															</div>
															<p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
																{client.lastInteraction}
															</p>
														</div>
													</div>
												</button>
											))}
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
																"bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
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
			badge: filteredClients.length,
		},
		{ id: "wallet", label: "Wallet", icon: Wallet },
		{ id: "browser", label: "Browser", icon: Globe },
		{ id: "referrals", label: "Referrals", icon: Network },
	];

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-900">
			{/* Header */}
			<div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
						<User className="size-4 text-white" />
					</div>
					<h2>Menu</h2>
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
										className="bg-zinc-200 dark:bg-zinc-700">
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
