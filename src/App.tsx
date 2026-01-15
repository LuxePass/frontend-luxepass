import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { AuthFlow } from "./Page/Auth";
import { ClientDetails } from "./Page/ClientDetails";
import { Wallet } from "./Page/Wallet";
import { InAppBrowser } from "./Page/InAppBrowser";
import { TaskQueue } from "./Page/TaskQueue";
import { TransferOverrideForm } from "./Page/TransferOverrideForm";
import { ListingManagement } from "./Page/ListingManagement";
import { LiveChat } from "./Page/LiveChat";
import { ReferralProgram } from "./Page/ReferralProgram";
import { AuditLogs } from "./Page/AuditLogs";
import { PermissionManager } from "./Page/PermissionManager";
import { PAManager } from "./Page/PAManager";
import { Bookings } from "./Page/Bookings";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useLocation,
	useParams,
	useNavigate,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { DashboardHome } from "./Page/DashboardHome";
import { Clients } from "./Page/Clients";
import { Tools } from "./Page/Tools";

// Guards
function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, initialized } = useAuth();
	const location = useLocation();

	if (!initialized) {
		return (
			<div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
				<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!user) {
		return (
			<Navigate
				to="/login"
				state={{ from: location }}
				replace
			/>
		);
	}

	return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
	const { user, initialized } = useAuth();

	if (!initialized) return null;

	if (user) {
		return (
			<Navigate
				to="/dashboard"
				replace
			/>
		);
	}

	return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();

	if (
		user?.role !== "SUPER_ADMIN" &&
		user?.role !== "ADMIN" &&
		user?.role !== "SENIOR_PA" &&
		user?.role !== "PA"
	) {
		return (
			<Navigate
				to="/dashboard"
				replace
			/>
		);
	}

	return <>{children}</>;
}

function ClientDetailsPage() {
	const { clientId } = useParams();
	const navigate = useNavigate();

	// If no client ID, redirect back to clients list
	if (!clientId) {
		return (
			<Navigate
				to="/clients"
				replace
			/>
		);
	}

	return (
		<ClientDetails
			clientId={clientId}
			clientName=""
			onClose={() => navigate("/clients")}
		/>
	);
}

function App() {
	return (
		<ThemeProvider
			defaultTheme="system"
			storageKey="luxepass-theme">
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						{/* Public Routes */}
						<Route
							path="/login"
							element={
								<AuthGuard>
									<AuthFlow />
								</AuthGuard>
							}
						/>

						{/* Protected Routes */}
						<Route
							element={
								<ProtectedRoute>
									<DashboardLayout />
								</ProtectedRoute>
							}>
							<Route
								index
								element={
									<Navigate
										to="/dashboard"
										replace
									/>
								}
							/>
							<Route
								path="dashboard"
								element={<DashboardHome />}
							/>
							<Route
								path="clients"
								element={<Clients />}
							/>
							<Route
								path="clients/:clientId"
								element={<ClientDetailsPage />}
							/>
							<Route
								path="wallet/:userId?"
								element={<Wallet />}
							/>
							<Route
								path="browser"
								element={<InAppBrowser onClose={() => {}} />}
							/>
							<Route
								path="tools"
								element={<Tools />}
							/>
							<Route
								path="tasks"
								element={<TaskQueue selectedClient={null} />}
							/>
							<Route
								path="livechat"
								element={<LiveChat />}
							/>
							<Route
								path="transfer"
								element={<TransferOverrideForm />}
							/>
							<Route
								path="listings"
								element={<ListingManagement />}
							/>
							<Route
								path="referrals"
								element={<ReferralProgram />}
							/>
							<Route
								path="audit-logs"
								element={
									<AdminGuard>
										<AuditLogs />
									</AdminGuard>
								}
							/>
							<Route
								path="permissions"
								element={
									<AdminGuard>
										<PermissionManager />
									</AdminGuard>
								}
							/>
							<Route
								path="pa-management"
								element={
									<AdminGuard>
										<PAManager />
									</AdminGuard>
								}
							/>
							<Route
								path="bookings"
								element={
									<AdminGuard>
										<Bookings />
									</AdminGuard>
								}
							/>
						</Route>

						{/* Fallback */}
						<Route
							path="*"
							element={
								<Navigate
									to="/dashboard"
									replace
								/>
							}
						/>
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
