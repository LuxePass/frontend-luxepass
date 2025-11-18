import { useState } from "react";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthFlow } from "./Page/Auth";
import { Toaster } from "./components/ui/sonner";
import { Sidebar } from "./components/Sidebar";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import {
	Building2,
	ListTodo,
	Menu,
	MessageCircle,
	Search,
	ShieldAlert,
	Sparkles,
	Users,
} from "lucide-react";
import { Input } from "./components/ui/input";
import { ThemeToggle } from "./components/ThemeToggle";
import { NotificationBell } from "./components/NotificationBell";
import { MetricsCards } from "./components/MetricsCards";
import { QuickViews } from "./components/QuickViews";
import { ClientDetails } from "./components/ClientDetails";
import { Wallet } from "./components/Wallet";
import { InAppBrowser } from "./components/InAppBrowser";
import { TaskQueue } from "./components/TaskQueue";
import { TransferOverrideForm } from "./components/TransferOverrideForm";
import { ListingManagement } from "./components/ListingManagement";
import { LiveChat } from "./components/LiveChat";
import { ReferralProgram } from "./components/ReferralProgram";
import { AIAssistantModal } from "./components/AIAssistantModal";

function App() {
	// Authentication state
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [userName, setUserName] = useState("");

	const [selectedClient, setSelectedClient] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
	const [activeTab, setActiveTab] = useState("dashboard");
	const [aiModalOpen, setAiModalOpen] = useState(false);

	// Mobile sheet states
	const [tasksSheetOpen, setTasksSheetOpen] = useState(false);
	const [liveChatSheetOpen, setLiveChatSheetOpen] = useState(false);
	const [transferSheetOpen, setTransferSheetOpen] = useState(false);
	const [listingsSheetOpen, setListingsSheetOpen] = useState(false);
	const [referralsSheetOpen, setReferralsSheetOpen] = useState(false);
	const [clientDetailsSheetOpen, setClientDetailsSheetOpen] = useState(false);

	// Authentication handlers
	const handleLogin = (email: string, name: string) => {
		setUserName(name);
		setIsAuthenticated(true);
	};

	const handleLogout = () => {
		setIsAuthenticated(false);
		setUserName("");
		setSelectedClient(null);
		setSearchQuery("");
	};

	// Close client details handler
	const handleCloseClientDetails = () => {
		setSelectedClient(null);
		setActiveTab("dashboard");
	};

	// Switch to clientdetails tab when a client is selected
	const handleClientSelect = (clientId: string) => {
		setSelectedClient(clientId);
		setActiveTab("clientdetails");
	};

	// Handle navigation from sidebar
	const handleNavigation = (tab: string) => {
		// On mobile, certain tabs should open sheets instead
		const isMobile = window.innerWidth < 1024; // lg breakpoint

		if (isMobile && tab === "referrals") {
			setReferralsSheetOpen(true);
			return;
		}

		setActiveTab(tab);
		if (tab !== "clientdetails" && tab !== "clients") {
			// Clear client selection when navigating away
			// except for clients section
		}
	};

	// Mobile client select handler
	const handleMobileClientSelect = (clientId: string) => {
		setSelectedClient(clientId);
		setSidebarOpen(false);
		setClientDetailsSheetOpen(true);
	};
	return (
		<ThemeProvider
			defaultTheme="system"
			storageKey="luxepass-theme">
			{!isAuthenticated ? (
				// Show Auth Flow when not authenticated
				<div className="min-h-screen">
					<AuthFlow onLogin={handleLogin} />
					<Toaster position="top-right" />
				</div>
			) : (
				// Show Dashboard when authenticated
				<div className="h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
					{/* Desktop Sidebar */}
					<div
						className={`hidden lg:block transition-all duration-300 ${
							desktopSidebarOpen ? "w-64" : "w-0"
						} overflow-hidden`}>
						{desktopSidebarOpen && (
							<Sidebar
								selectedClient={selectedClient}
								onSelectClient={handleClientSelect}
								searchQuery={searchQuery}
								onClose={() => setDesktopSidebarOpen(false)}
								onLogout={handleLogout}
								onNavigate={handleNavigation}
								activeTab={activeTab}
								isDesktop
							/>
						)}
					</div>

					{/* Mobile Sidebar */}
					<Sheet
						open={sidebarOpen}
						onOpenChange={setSidebarOpen}>
						<SheetContent
							side="left"
							className="w-80 p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 lg:hidden">
							<SheetHeader className="sr-only">
								<SheetTitle>Navigation Menu</SheetTitle>
								<SheetDescription>Navigate the dashboard</SheetDescription>
							</SheetHeader>
							<Sidebar
								selectedClient={selectedClient}
								onSelectClient={handleMobileClientSelect}
								searchQuery={searchQuery}
								isMobile
								onLogout={handleLogout}
								onNavigate={handleNavigation}
								activeTab={activeTab}
								onClose={() => setSidebarOpen(false)}
							/>
						</SheetContent>
					</Sheet>

					{/* Main Content Area */}
					<div className="flex-1 flex flex-col overflow-hidden min-w-0">
						{/* Top Bar */}
						<div className="h-14 lg:h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 lg:px-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur shrink-0">
							<div className="flex items-center gap-2 lg:gap-3 flex-1 max-w-xl min-w-0">
								{/* Menu Buttons */}
								<Button
									variant="ghost"
									size="sm"
									className="lg:hidden shrink-0 size-9 p-0"
									onClick={() => setSidebarOpen(true)}>
									<Menu className="size-5" />
								</Button>

								{!desktopSidebarOpen && (
									<Button
										variant="ghost"
										size="sm"
										className="hidden lg:flex shrink-0 size-9 p-0"
										onClick={() => setDesktopSidebarOpen(true)}>
										<Menu className="size-5" />
									</Button>
								)}

								{/* Search */}
								<div className="relative flex-1 min-w-0">
									<Search className="absolute left-2.5 lg:left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-400" />
									<Input
										placeholder="Search..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8 lg:pl-10 h-9 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 text-sm"
									/>
								</div>
							</div>

							{/* Notification Bell and Theme Toggle */}
							<div className="flex items-center gap-1">
								<ThemeToggle />
								<NotificationBell />
							</div>
						</div>

						{/* Metrics */}
						<div className="px-3 lg:px-6 pt-3 lg:pt-4 shrink-0">
							{activeTab === "dashboard" && <MetricsCards />}
						</div>

						{/* Content Area with Task Queue and Main View */}
						<div className="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 lg:p-6 overflow-hidden min-h-0">
							{/* Central Unified View */}
							<div className="flex-1 flex flex-col overflow-hidden min-w-0">
								{/* Desktop - Direct content based on activeTab */}
								<div className="hidden lg:flex flex-1 flex-col overflow-hidden min-h-0">
									{activeTab === "dashboard" && (
										<div className="flex-1 overflow-hidden">
											<QuickViews
												onTasksClick={() => setActiveTab("tasks")}
												onChatClick={() => setActiveTab("livechat")}
												onTransferClick={() => setActiveTab("transfer")}
												onListingsClick={() => setActiveTab("listings")}
												onReferralsClick={() => setActiveTab("referrals")}
											/>
										</div>
									)}

									{activeTab === "clients" && (
										<div className="flex-1 overflow-hidden flex items-center justify-center p-8">
											<div className="text-center">
												<Users className="size-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
												<h3 className="text-xl mb-2 text-zinc-600 dark:text-zinc-400">
													Select a Client
												</h3>
												<p className="text-sm text-zinc-500 dark:text-zinc-500">
													Choose a client from the sidebar to view their details
												</p>
											</div>
										</div>
									)}

									{activeTab === "clientdetails" && selectedClient && (
										<div className="flex-1 overflow-hidden">
											<ClientDetails
												clientId={selectedClient}
												clientName={""}
												onClose={handleCloseClientDetails}
											/>
										</div>
									)}

									{activeTab === "wallet" && (
										<div className="flex-1 overflow-hidden">
											<Wallet />
										</div>
									)}

									{activeTab === "browser" && (
										<InAppBrowser onClose={() => setActiveTab("dashboard")} />
									)}

									{activeTab === "tools" && (
										<div className="flex-1 overflow-auto p-4">
											<h2 className="text-xl mb-4">Tools</h2>
											<div className="grid grid-cols-2 gap-3">
												<button
													onClick={() => setTasksSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<ListTodo className="size-8 text-violet-600 dark:text-violet-400" />
													<span className="text-sm">Tasks</span>
												</button>
												<button
													onClick={() => setLiveChatSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<MessageCircle className="size-8 text-green-600 dark:text-green-400" />
													<span className="text-sm">Live Chat</span>
												</button>
												<button
													onClick={() => setTransferSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<ShieldAlert className="size-8 text-orange-600 dark:text-orange-400" />
													<span className="text-sm">Transfer</span>
												</button>
												<button
													onClick={() => setListingsSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<Building2 className="size-8 text-blue-600 dark:text-blue-400" />
													<span className="text-sm">Listings</span>
												</button>
												<button
													onClick={() => setReferralsSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<Users className="size-8 text-indigo-600 dark:text-indigo-400" />
													<span className="text-sm">Referrals</span>
												</button>
											</div>
										</div>
									)}

									{activeTab === "tasks" && (
										<div className="flex-1 overflow-hidden">
											<TaskQueue selectedClient={selectedClient} />
										</div>
									)}

									{activeTab === "transfer" && (
										<div className="flex-1 overflow-hidden">
											<TransferOverrideForm />
										</div>
									)}

									{activeTab === "listings" && (
										<div className="flex-1 overflow-hidden">
											<ListingManagement />
										</div>
									)}

									{activeTab === "livechat" && (
										<div className="flex-1 overflow-hidden">
											<LiveChat />
										</div>
									)}

									{activeTab === "referrals" && (
										<div className="flex-1 overflow-hidden">
											<ReferralProgram />
										</div>
									)}
								</div>

								{/* Mobile - Default view (placeholder or dashboard) */}
								<div className="lg:hidden flex-1 overflow-hidden">
									{activeTab === "dashboard" && (
										<QuickViews
											onTasksClick={() => setTasksSheetOpen(true)}
											onChatClick={() => setLiveChatSheetOpen(true)}
											onTransferClick={() => setTransferSheetOpen(true)}
											onListingsClick={() => setListingsSheetOpen(true)}
											onReferralsClick={() => setReferralsSheetOpen(true)}
										/>
									)}

									{activeTab === "clients" && (
										<div className="flex-1 overflow-auto p-4">
											<h2 className="text-xl mb-4">Clients</h2>
											<div className="space-y-2">
												{[
													{
														id: "1",
														name: "Chidinma Okonkwo",
														unread: 3,
													},
													{
														id: "2",
														name: "Emeka Adeleke",
														unread: 0,
													},
													{
														id: "3",
														name: "Amara Nwosu",
														unread: 1,
													},
													{
														id: "4",
														name: "Chukwudi Okafor",
														unread: 0,
													},
													{
														id: "5",
														name: "Ngozi Adekunle",
														unread: 2,
													},
												].map((client) => (
													<button
														key={client.id}
														onClick={() => handleMobileClientSelect(client.id)}
														className="w-full p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors text-left flex items-center justify-between">
														<span>{client.name}</span>
														{client.unread > 0 && (
															<span className="bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
																{client.unread}
															</span>
														)}
													</button>
												))}
											</div>
										</div>
									)}

									{activeTab === "wallet" && (
										<div className="flex-1 overflow-hidden">
											<Wallet />
										</div>
									)}

									{activeTab === "browser" && (
										<InAppBrowser onClose={() => setActiveTab("dashboard")} />
									)}

									{activeTab === "tools" && (
										<div className="flex-1 overflow-auto p-4">
											<h2 className="text-xl mb-4">Tools</h2>
											<div className="grid grid-cols-2 gap-3">
												<button
													onClick={() => setTasksSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<ListTodo className="size-8 text-violet-600 dark:text-violet-400" />
													<span className="text-sm">Tasks</span>
												</button>
												<button
													onClick={() => setLiveChatSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<MessageCircle className="size-8 text-green-600 dark:text-green-400" />
													<span className="text-sm">Live Chat</span>
												</button>
												<button
													onClick={() => setTransferSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<ShieldAlert className="size-8 text-orange-600 dark:text-orange-400" />
													<span className="text-sm">Transfer</span>
												</button>
												<button
													onClick={() => setListingsSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<Building2 className="size-8 text-blue-600 dark:text-blue-400" />
													<span className="text-sm">Listings</span>
												</button>
												<button
													onClick={() => setReferralsSheetOpen(true)}
													className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
													<Users className="size-8 text-indigo-600 dark:text-indigo-400" />
													<span className="text-sm">Referrals</span>
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Mobile Bottom Navigation */}
						<div className="lg:hidden shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pb-safe">
							<div className="grid grid-cols-5 gap-1 p-2">
								<button
									onClick={() => setTasksSheetOpen(true)}
									className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
									<ListTodo className="size-5 text-violet-600 dark:text-violet-400" />
									<span className="text-xs">Tasks</span>
								</button>

								<button
									onClick={() => setLiveChatSheetOpen(true)}
									className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
									<MessageCircle className="size-5 text-green-600 dark:text-green-400" />
									<span className="text-xs">Chat</span>
								</button>

								<button
									onClick={() => setTransferSheetOpen(true)}
									className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
									<ShieldAlert className="size-5 text-orange-600 dark:text-orange-400" />
									<span className="text-xs">Transfer</span>
								</button>

								<button
									onClick={() => setListingsSheetOpen(true)}
									className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
									<Building2 className="size-5 text-blue-600 dark:text-blue-400" />
									<span className="text-xs">Listings</span>
								</button>

								<button
									onClick={() => setReferralsSheetOpen(true)}
									className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
									<Users className="size-5 text-indigo-600 dark:text-indigo-400" />
									<span className="text-xs">Referrals</span>
								</button>
							</div>
						</div>
					</div>

					{/* Mobile Sheets */}

					{/* Tasks Sheet */}
					<Sheet
						open={tasksSheetOpen}
						onOpenChange={setTasksSheetOpen}>
						<SheetContent
							side="bottom"
							className="h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
								<SheetTitle>Task Queue</SheetTitle>
								<SheetDescription>View and manage your urgent tasks</SheetDescription>
							</SheetHeader>
							<div className="h-[calc(90vh-80px)] overflow-hidden">
								<TaskQueue selectedClient={selectedClient} />
							</div>
						</SheetContent>
					</Sheet>

					{/* Live Chat Sheet */}
					<Sheet
						open={liveChatSheetOpen}
						onOpenChange={setLiveChatSheetOpen}>
						<SheetContent
							side="bottom"
							className="h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
								<SheetTitle>WhatsApp Live Chat</SheetTitle>
								<SheetDescription>Real-time client conversations</SheetDescription>
							</SheetHeader>
							<div className="h-[calc(90vh-80px)] overflow-hidden">
								<LiveChat />
							</div>
						</SheetContent>
					</Sheet>

					{/* Transfer Sheet */}
					<Sheet
						open={transferSheetOpen}
						onOpenChange={setTransferSheetOpen}>
						<SheetContent
							side="bottom"
							className="h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
								<SheetTitle>Transfer Override</SheetTitle>
								<SheetDescription>Submit secure transfer requests</SheetDescription>
							</SheetHeader>
							<div className="h-[calc(90vh-80px)] overflow-hidden">
								<TransferOverrideForm />
							</div>
						</SheetContent>
					</Sheet>

					{/* Listings Sheet */}
					<Sheet
						open={listingsSheetOpen}
						onOpenChange={setListingsSheetOpen}>
						<SheetContent
							side="bottom"
							className="h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
								<SheetTitle>Listing Management</SheetTitle>
								<SheetDescription>
									Manage property listings and vet status
								</SheetDescription>
							</SheetHeader>
							<div className="h-[calc(90vh-80px)] overflow-hidden">
								<ListingManagement />
							</div>
						</SheetContent>
					</Sheet>

					{/* Referrals Sheet */}
					<Sheet
						open={referralsSheetOpen}
						onOpenChange={setReferralsSheetOpen}>
						<SheetContent
							side="bottom"
							className="h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
								<SheetTitle>Referral Program</SheetTitle>
								<SheetDescription>Track client referrals and rewards</SheetDescription>
							</SheetHeader>
							<div className="h-[calc(90vh-80px)] overflow-hidden">
								<ReferralProgram />
							</div>
						</SheetContent>
					</Sheet>

					{/* Client Details Sheet */}
					<Sheet
						open={clientDetailsSheetOpen}
						onOpenChange={setClientDetailsSheetOpen}>
						<SheetContent
							side="bottom"
							className="h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
								<SheetTitle>Client Details & Metrics</SheetTitle>
								<SheetDescription>
									View comprehensive client information and performance metrics
								</SheetDescription>
							</SheetHeader>
							<div className="h-[calc(90vh-80px)] overflow-hidden">
								{selectedClient && (
									<ClientDetails
										clientId={selectedClient}
										clientName={""}
									/>
								)}
							</div>
						</SheetContent>
					</Sheet>

					{/* Floating AI Assistant Button */}
					<Button
						onClick={() => setAiModalOpen(true)}
						className="fixed bottom-20 lg:bottom-6 right-6 size-14 lg:size-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all p-0 z-50">
						<Sparkles className="size-6 lg:size-7 text-white" />
					</Button>

					{/* AI Assistant Modal */}
					<AIAssistantModal
						open={aiModalOpen}
						onOpenChange={setAiModalOpen}
					/>

					<Toaster position="top-right" />
				</div>
			)}
		</ThemeProvider>
	);
}

export default App;
