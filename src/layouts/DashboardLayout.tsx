import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../Page/Sidebar";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Menu, Search, Sparkles } from "lucide-react";
import { Input } from "../components/ui/input";
import { ThemeToggle } from "../Page/ThemeToggle";
import { NotificationBell } from "../Page/NotificationBell";
import { useAuth } from "../hooks/useAuth";
import { Toaster } from "../components/ui/sonner";
import { AIAssistantModal } from "../Page/AIAssistantModal";

export default function DashboardLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [aiModalOpen, setAiModalOpen] = useState(false);

	// We can't really "select" a client globally easily without context,
	// but for now let's keep the layout structure.
	// If Sidebar needs selectedClient, we might need a Global/UI Context or pass it down if it was lifted.
	// For now, I'll pass dummy or manage minimal state here if needed for UI purity,
	// but strictly routing means state should be in URL or Page components.
	// However, Sidebar "selectedClient" prop suggests it highlights the active client.
	// We might need to parse it from URL e.g. /clients/:id

	const handleClientSelect = (clientId: string) => {
		navigate(`/clients/${clientId}`);
		setSidebarOpen(false);
	};

	const handleNavigation = (tab: string) => {
		// Map tabs to routes
		switch (tab) {
			case "dashboard":
				navigate("/dashboard");
				break;
			case "clients":
				navigate("/clients");
				break;
			case "wallet":
				navigate("/wallet");
				break;
			case "browser":
				navigate("/browser");
				break;
			case "tools":
				navigate("/tools");
				break;
			case "tasks":
				navigate("/tasks");
				break;
			case "livechat":
				navigate("/livechat");
				break;
			case "transfer":
				navigate("/transfer");
				break;
			case "listings":
				navigate("/listings");
				break;
			case "referrals":
				navigate("/referrals");
				break;
			case "audit-logs":
				navigate("/audit-logs");
				break;
			case "permissions":
				navigate("/permissions");
				break;
			case "bookings":
				navigate("/bookings");
				break;
			case "pa-management":
				navigate("/pa-management");
				break;
			case "clientdetails":
				navigate("/clients");
				break; // Fallback
			default:
				navigate("/dashboard");
		}
		setSidebarOpen(false);
	};

	// Determine active tab from path
	const getActiveTab = () => {
		const path = location.pathname.split("/")[1];
		return path || "dashboard";
	};

	return (
		<div className="h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
			{/* Desktop Sidebar */}
			<div
				className={`hidden lg:block transition-all duration-300 ${
					desktopSidebarOpen ? "w-64" : "w-0"
				} overflow-hidden`}>
				{desktopSidebarOpen && (
					<Sidebar
						selectedClient={null} // We will handle this logic later
						onSelectClient={handleClientSelect}
						searchQuery={searchQuery}
						onClose={() => setDesktopSidebarOpen(false)}
						onLogout={logout}
						onNavigate={handleNavigation}
						activeTab={getActiveTab()}
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
						selectedClient={null}
						onSelectClient={handleClientSelect}
						searchQuery={searchQuery}
						isMobile
						onLogout={logout}
						onNavigate={handleNavigation}
						activeTab={getActiveTab()}
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

				{/* Content Outlet */}
				<div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
					<Outlet />
				</div>

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
		</div>
	);
}
