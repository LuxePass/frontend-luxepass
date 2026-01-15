import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { ScrollArea } from "../components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import useTheme from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { customToast } from "./CustomToast";
import {
	Bell,
	Download,
	Globe,
	Key,
	LogOut,
	Mail,
	Moon,
	Phone,
	Save,
	Settings,
	Shield,
	Sun,
	User,
	Zap,
	Lock,
} from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../components/ui/alert-dialog";

// ... imports

interface AdminProfileProps {
	onLogout?: () => void;
	variant?: "modal" | "page";
}

export function AdminProfile({
	onLogout,
	variant = "modal",
}: AdminProfileProps = {}) {
	const { theme, setTheme } = useTheme();
	const { user, changePassword } = useAuth();
	const { updatePA } = useUsers();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
	const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState("English");

	const [profile, setProfile] = useState({
		name: user?.name || "Admin User",
		email: user?.email || "admin@luxepass.com",
		phone: user?.phone || "",
		role: user?.role || "Senior PA Manager",
		uniqueId: user?.uniqueId || "",
		tier: user?.tier || "",
		status: user?.status || "",
		phoneVerified: user?.phoneVerified || false,
		kycStatus: user?.kycStatus || "",
		createdAt: user?.createdAt || "",
	});

	// Update local state when user data changes (e.g. on mount)
	useEffect(() => {
		if (user) {
			setProfile({
				name: user.name,
				email: user.email,
				phone: user.phone || "",
				role: user.role,
				uniqueId: user.uniqueId || "",
				tier: user.tier || "",
				status: user.status,
				phoneVerified: user.phoneVerified || false,
				kycStatus: user.kycStatus || "",
				createdAt: user.createdAt || "",
			});
		}
	}, [user]);

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [settings, setSettings] = useState({
		emailNotifications: true,
		pushNotifications: true,
		taskAlerts: true,
		weeklyReports: true,
		twoFactorAuth: true,
		autoLogout: false,
	});

	const handleSaveProfile = async () => {
		try {
			// If the user is a PA or Admin, we try to update their profile
			// Note: updatePA might only work if we have the right endpoint permissions
			if (user?.id) {
				await updatePA(user.id, {
					name: profile.name,
					email: profile.email,
					phone: profile.phone,
				});
				customToast.success({
					title: "Profile Updated",
					description: "Your profile has been successfully updated",
				});
				setSettingsOpen(false);
			} else {
				customToast.error("Could not find user ID to update");
			}
		} catch (error) {
			console.error("Failed to update profile", error);
			customToast.error("Failed to update profile. Please try again.");
		}
	};

	const handleLogout = () => {
		customToast.info("Logging out...");
		if (onLogout) {
			onLogout();
		}
	};

	const handlePasswordChange = async () => {
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			customToast.error({
				title: "Password Mismatch",
				description: "New password and confirm password do not match",
			});
			return;
		}
		if (!passwordForm.currentPassword || !passwordForm.newPassword) {
			customToast.error({
				title: "Missing Information",
				description: "Please fill in all password fields",
			});
			return;
		}

		try {
			// Using the newly implemented changePassword from AuthContext
			// This calls /auth/pa/change-password endpoint
			if (changePassword) {
				await changePassword(
					passwordForm.currentPassword,
					passwordForm.newPassword
				);
				customToast.success({
					title: "Password Changed",
					description: "Your password has been successfully changed",
				});
				setPasswordForm({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setPasswordDialogOpen(false);
			} else {
				throw new Error("Password change function not available");
			}
		} catch (error) {
			console.error("Failed to change password", error);
			customToast.error(
				"Failed to change password. Please check your current password."
			);
		}
	};

	const handleLanguageChange = () => {
		customToast.success({
			title: "Language Changed",
			description: `Your language has been changed to ${selectedLanguage}`,
		});
		setLanguageDialogOpen(false);
	};

	const handlePhotoChange = () => {
		// Simulate file input click
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = (e: Event) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				customToast.success({
					title: "Photo Updated",
					description: `Profile photo changed to ${file.name}`,
				});
			}
		};
		input.click();
	};

	const handleExportData = () => {
		customToast.success({
			title: "Exporting Data",
			description: "Your data export will be ready in a few moments",
		});
		// Simulate data export
		setTimeout(() => {
			customToast.success({
				title: "Export Complete",
				description: "Your data has been exported successfully",
			});
		}, 2000);
	};

	const mainContent = (
		<div className="p-6 pt-0 space-y-6">
			{/* Profile Section */}
			<Card className="p-4 lg:p-6 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
				<div className="flex items-center gap-4 mb-6">
					<Avatar className="size-20 border-4 border-violet-600">
						<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-2xl">
							{profile.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-lg mb-1">{profile.name}</p>
						<p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
							{profile.role}
						</p>
						<Button
							variant="outline"
							size="sm"
							className="text-xs border-zinc-300 dark:border-zinc-700"
							onClick={handlePhotoChange}>
							Change Photo
						</Button>
					</div>
				</div>

				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								value={profile.name}
								onChange={(e) => setProfile({ ...profile, name: e.target.value })}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Input
								id="role"
								value={profile.role}
								readOnly
								className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="flex items-center gap-2">
								<Mail className="size-4" />
								Email Address
							</Label>
							<Input
								id="email"
								type="email"
								value={profile.email}
								onChange={(e) => setProfile({ ...profile, email: e.target.value })}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="phone"
								className="flex items-center gap-2">
								<Phone className="size-4" />
								Phone Number
							</Label>
							<Input
								id="phone"
								type="tel"
								value={profile.phone}
								onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>
					</div>

					{/* Read-only Backend Fields */}
					<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
						<h5 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">
							Account Details
						</h5>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
							<div>
								<span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
									Account ID
								</span>
								<code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs select-all">
									{profile.uniqueId || "N/A"}
								</code>
							</div>
							<div>
								<span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
									Tier
								</span>
								<span className="font-medium">{profile.tier || "Standard"}</span>
							</div>
							<div>
								<span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
									Status
								</span>
								<span className="font-medium capitalize">
									{profile.status || "Active"}
								</span>
							</div>
							<div>
								<span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
									KYC Status
								</span>
								<span className="font-medium capitalize">
									{profile.kycStatus || "Not Verified"}
								</span>
							</div>
							<div>
								<span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
									Phone Verified
								</span>
								<span
									className={
										profile.phoneVerified ? "text-green-600" : "text-amber-600"
									}>
									{profile.phoneVerified ? "Yes" : "No"}
								</span>
							</div>
							<div>
								<span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
									Member Since
								</span>
								<span className="font-medium">
									{profile.createdAt
										? new Date(profile.createdAt).toLocaleDateString()
										: "N/A"}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Appearance */}
			<div className="space-y-3">
				<h4 className="flex items-center gap-2 text-sm">
					<Moon className="size-4 text-violet-600 dark:text-violet-400" />
					Appearance
				</h4>
				<Card className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm mb-1">Theme Mode</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Current: {theme === "dark" ? "Dark" : "Light"} mode
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant={theme === "light" ? "default" : "outline"}
								size="sm"
								onClick={() => setTheme("light")}
								className={
									theme === "light"
										? "bg-violet-600 hover:bg-violet-700"
										: "border-zinc-300 dark:border-zinc-700"
								}>
								<Sun className="size-4" />
							</Button>
							<Button
								variant={theme === "dark" ? "default" : "outline"}
								size="sm"
								onClick={() => setTheme("dark")}
								className={
									theme === "dark"
										? "bg-violet-600 hover:bg-violet-700"
										: "border-zinc-300 dark:border-zinc-700"
								}>
								<Moon className="size-4" />
							</Button>
						</div>
					</div>
				</Card>
			</div>

			{/* Notifications */}
			<div className="space-y-3">
				<h4 className="flex items-center gap-2 text-sm">
					<Bell className="size-4 text-violet-600 dark:text-violet-400" />
					Notifications
				</h4>
				<Card className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm mb-1">Email Notifications</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Receive updates via email
							</p>
						</div>
						<Switch
							checked={settings.emailNotifications}
							onCheckedChange={(checked) =>
								setSettings({ ...settings, emailNotifications: checked })
							}
						/>
					</div>

					<Separator className="bg-zinc-200 dark:bg-zinc-800" />

					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm mb-1">Push Notifications</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Browser push notifications
							</p>
						</div>
						<Switch
							checked={settings.pushNotifications}
							onCheckedChange={(checked) =>
								setSettings({ ...settings, pushNotifications: checked })
							}
						/>
					</div>

					<Separator className="bg-zinc-200 dark:bg-zinc-800" />

					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm mb-1">Task Alerts</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Urgent task notifications
							</p>
						</div>
						<Switch
							checked={settings.taskAlerts}
							onCheckedChange={(checked) =>
								setSettings({ ...settings, taskAlerts: checked })
							}
						/>
					</div>

					<Separator className="bg-zinc-200 dark:bg-zinc-800" />

					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm mb-1">Weekly Reports</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Performance summaries
							</p>
						</div>
						<Switch
							checked={settings.weeklyReports}
							onCheckedChange={(checked) =>
								setSettings({ ...settings, weeklyReports: checked })
							}
						/>
					</div>
				</Card>
			</div>

			{/* Security */}
			<div className="space-y-3">
				<h4 className="flex items-center gap-2 text-sm">
					<Shield className="size-4 text-violet-600 dark:text-violet-400" />
					Security
				</h4>
				<Card className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm mb-1 flex items-center gap-2">
								<Lock className="size-4" />
								Two-Factor Authentication
							</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Extra layer of security
							</p>
						</div>
						<Switch
							checked={settings.twoFactorAuth}
							onCheckedChange={(checked) =>
								setSettings({ ...settings, twoFactorAuth: checked })
							}
						/>
					</div>

					<Separator className="bg-zinc-200 dark:bg-zinc-800" />

					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm mb-1">Auto Logout</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								After 30 minutes of inactivity
							</p>
						</div>
						<Switch
							checked={settings.autoLogout}
							onCheckedChange={(checked) =>
								setSettings({ ...settings, autoLogout: checked })
							}
						/>
					</div>

					<Separator className="bg-zinc-200 dark:bg-zinc-800" />

					<Button
						variant="outline"
						className="w-full border-zinc-300 dark:border-zinc-700"
						onClick={() => setPasswordDialogOpen(true)}>
						<Key className="size-4 mr-2" />
						Change Password
					</Button>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="space-y-3">
				<h4 className="flex items-center gap-2 text-sm">
					<Zap className="size-4 text-violet-600 dark:text-violet-400" />
					Quick Actions
				</h4>
				<div className="grid grid-cols-2 gap-3">
					<Button
						variant="outline"
						className="border-zinc-300 dark:border-zinc-700"
						onClick={() => setLanguageDialogOpen(true)}>
						<Globe className="size-4 mr-2" />
						Language
					</Button>
					<Button
						variant="outline"
						className="border-zinc-300 dark:border-zinc-700"
						onClick={handleExportData}>
						<Download className="size-4 mr-2" />
						Export Data
					</Button>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="space-y-3 pt-3">
				<div className="flex flex-col sm:flex-row gap-3">
					<Button
						onClick={handleSaveProfile}
						className="flex-1 bg-violet-600 hover:bg-violet-700">
						<Save className="size-4 mr-2" />
						Save Changes
					</Button>
					<Button
						variant="outline"
						onClick={() => setLogoutDialogOpen(true)}
						className="flex-1 border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
						<LogOut className="size-4 mr-2" />
						Logout
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{variant === "modal" ? (
				<Dialog
					open={settingsOpen}
					onOpenChange={setSettingsOpen}>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							className="flex items-center gap-3 w-full justify-start hover:bg-zinc-100 dark:hover:bg-zinc-800 p-3 rounded-lg">
							<Avatar className="size-10 border-2 border-violet-600">
								<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white">
									{profile.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 text-left min-w-0">
								<p className="text-sm truncate">{profile.name}</p>
								<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
									{profile.role}
								</p>
							</div>
							<Settings className="size-4 text-zinc-400 shrink-0" />
						</Button>
					</DialogTrigger>

					<DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
						<DialogHeader className="p-6 pb-4">
							<DialogTitle className="flex items-center gap-2">
								<User className="size-5 text-violet-600 dark:text-violet-400" />
								Admin Profile & Settings
							</DialogTitle>
							<DialogDescription>
								Manage your profile information and application preferences
							</DialogDescription>
						</DialogHeader>

						<ScrollArea className="max-h-[calc(90vh-140px)] overflow-auto">
							{mainContent}
						</ScrollArea>
					</DialogContent>
				</Dialog>
			) : (
				<>
					{/* Page View: directly render content */}
					{/* We need to ensure logic like dialogs (password, logout etc) are still rendered */}
					{/* The page view will omit the main Dialog trigger and wrapper */}
					{mainContent}
				</>
			)}

			{/* Logout Confirmation Dialog */}
			<AlertDialog
				open={logoutDialogOpen}
				onOpenChange={setLogoutDialogOpen}>
				<AlertDialogContent className="sm:max-w-[400px] max-h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<AlertDialogHeader className="p-6 pb-4">
						<AlertDialogTitle className="flex items-center gap-2">
							<LogOut className="size-5 text-red-600 dark:text-red-400" />
							Logout Confirmation
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to logout? This will end your current session.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
						<AlertDialogCancel className="flex-1 border-zinc-300 dark:border-zinc-700">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleLogout}
							className="flex-1 bg-red-600 hover:bg-red-700">
							<LogOut className="size-4 mr-2" />
							Logout
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Password Change Dialog */}
			<AlertDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}>
				<AlertDialogContent className="sm:max-w-[400px] max-h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<AlertDialogHeader className="p-6 pb-4">
						<AlertDialogTitle className="flex items-center gap-2">
							<Key className="size-5 text-violet-600 dark:text-violet-400" />
							Change Password
						</AlertDialogTitle>
						<AlertDialogDescription>
							Enter your current password and a new password to update your account.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="p-6 pt-0 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="currentPassword">Current Password</Label>
							<Input
								id="currentPassword"
								type="password"
								value={passwordForm.currentPassword}
								onChange={(e) =>
									setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
								}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="newPassword">New Password</Label>
							<Input
								id="newPassword"
								type="password"
								value={passwordForm.newPassword}
								onChange={(e) =>
									setPasswordForm({ ...passwordForm, newPassword: e.target.value })
								}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={passwordForm.confirmPassword}
								onChange={(e) =>
									setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
								}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>
					</div>

					<AlertDialogFooter className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
						<AlertDialogCancel className="flex-1 border-zinc-300 dark:border-zinc-700">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handlePasswordChange}
							className="flex-1 bg-violet-600 hover:bg-violet-700">
							<Key className="size-4 mr-2" />
							Change Password
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Language Change Dialog */}
			<AlertDialog
				open={languageDialogOpen}
				onOpenChange={setLanguageDialogOpen}>
				<AlertDialogContent className="sm:max-w-[400px] max-h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<AlertDialogHeader className="p-6 pb-4">
						<AlertDialogTitle className="flex items-center gap-2">
							<Globe className="size-5 text-violet-600 dark:text-violet-400" />
							Change Language
						</AlertDialogTitle>
						<AlertDialogDescription>
							Select your preferred language for the application.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="p-6 pt-0 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="language">Language</Label>
							<select
								id="language"
								value={selectedLanguage}
								onChange={(e) => setSelectedLanguage(e.target.value)}
								className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 p-2 rounded-lg">
								<option value="English">English</option>
								<option value="Spanish">Spanish</option>
								<option value="French">French</option>
								<option value="German">German</option>
								<option value="Chinese">Chinese</option>
								<option value="Japanese">Japanese</option>
								<option value="Russian">Russian</option>
							</select>
						</div>
					</div>

					<AlertDialogFooter className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
						<AlertDialogCancel className="flex-1 border-zinc-300 dark:border-zinc-700">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleLanguageChange}
							className="flex-1 bg-violet-600 hover:bg-violet-700">
							<Globe className="size-4 mr-2" />
							Change Language
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// Mobile version - simplified for bottom sheet
export function AdminProfileMobile() {
	const { theme, setTheme } = useTheme();
	const [profile] = useState({
		name: "Admin User",
		role: "Senior PA Manager",
	});

	return (
		<div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
			<Avatar className="size-12 border-2 border-violet-600">
				<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white">
					{profile.name
						.split(" ")
						.map((n) => n[0])
						.join("")}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<p className="text-sm truncate">{profile.name}</p>
				<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
					{profile.role}
				</p>
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				className="shrink-0">
				{theme === "dark" ? (
					<Sun className="size-4" />
				) : (
					<Moon className="size-4" />
				)}
			</Button>
		</div>
	);
}
