import { useState, useEffect } from "react";
import { useUsers, type User } from "../hooks/useUsers";
import { usePermissions, type PAPermission } from "../hooks/usePermissions";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	Shield,
	Save,
	Plus,
	Trash2,
	UserPlus,
	Edit2,
	Trash,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { customToast } from "./CustomToast";

const PREDEFINED_PERMISSIONS = [
	{
		key: "conversations:read:assigned",
		description: "View conversations assigned to the PA",
	},
	{
		key: "conversations:write:assigned",
		description: "Send messages in assigned conversations",
	},
	{
		key: "users:read:assigned",
		description: "View user profiles for assigned conversations",
	},
	{
		key: "users:write:assigned",
		description: "Update user profiles for assigned conversations",
	},
	{ key: "personal_assistants:read:own", description: "View own PA profile" },
	{ key: "personal_assistants:write:own", description: "Update own PA profile" },
	{
		key: "transfers:read:assigned",
		description: "View transfers for assigned conversations",
	},
	{
		key: "transfers:execute:specific",
		description: "Execute specific transfers with valid permission token",
	},
	{
		key: "bookings:read:assigned",
		description: "View bookings for assigned conversations",
	},
	{
		key: "bookings:write:assigned",
		description: "Create/update bookings for assigned conversations",
	},
	{
		key: "referrals:read:assigned",
		description: "View referrals for assigned conversations",
	},
	{ key: "audit_logs:read:own", description: "View own audit logs" },
	{ key: "analytics:read:own", description: "View own performance analytics" },
];

export function PermissionManager() {
	const { getAllPAs, createPA, updatePA, deletePA } = useUsers();
	const { getPAPermissions, updatePAPermissions } = usePermissions();

	const [pas, setPas] = useState<User[]>([]);
	const [selectedPaId, setSelectedPaId] = useState<string>("");
	const [permissions, setPermissions] = useState<PAPermission[]>([]);
	const [loading, setLoading] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newPa, setNewPa] = useState({
		name: "",
		email: "",
		password: "",
		role: "PA",
	});
	const [creating, setCreating] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingPa, setEditingPa] = useState({ name: "", role: "PA" });
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const fetchPas = async () => {
			try {
				const response = await getAllPAs();
				setPas(response || []);
			} catch (err: unknown) {
				console.error("Failed to fetch PAs:", err);
				customToast.error("Failed to fetch PAs");
			}
		};
		fetchPas();
	}, [getAllPAs]);

	const handlePaChange = async (paId: string) => {
		setSelectedPaId(paId);
		setLoading(true);
		try {
			const perms = await getPAPermissions(paId);
			setPermissions(perms || []);
		} catch (err: unknown) {
			console.error("Failed to fetch permissions:", err);
			customToast.error("Failed to fetch permissions");
			setPermissions([]);
		} finally {
			setLoading(false);
		}
	};

	const handleCreatePA = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreating(true);
		try {
			await createPA(newPa);
			customToast.success("PA created successfully");
			setCreateDialogOpen(false);
			setNewPa({ name: "", email: "", password: "", role: "PA" });
			// Refresh list
			const response = await getAllPAs();
			setPas(response || []);
		} catch (err: unknown) {
			console.error("Failed to create PA:", err);
			customToast.error("Failed to create PA");
		} finally {
			setCreating(false);
		}
	};

	const handleUpdatePA = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedPaId) return;
		setUpdating(true);
		try {
			await updatePA(selectedPaId, editingPa);
			customToast.success("PA updated successfully");
			setEditDialogOpen(false);
			// Refresh list
			const response = await getAllPAs();
			setPas(response || []);
		} catch (err: unknown) {
			console.error("Failed to update PA:", err);
			customToast.error("Failed to update PA");
		} finally {
			setUpdating(false);
		}
	};

	const handleDeletePA = async () => {
		if (!selectedPaId) return;
		setDeleting(true);
		try {
			await deletePA(selectedPaId);
			customToast.success("PA deleted successfully");
			setSelectedPaId("");
			setPermissions([]);
			// Refresh list
			const response = await getAllPAs();
			setPas(response || []);
		} catch (err: unknown) {
			console.error("Failed to delete PA:", err);
			customToast.error("Failed to delete PA");
		} finally {
			setDeleting(false);
		}
	};

	const handleAddPermission = () => {
		setPermissions([
			...permissions,
			{
				key: "",
				granted: true,
				source: "explicit",
				description: "New Permission",
			},
		]);
	};

	const handleRemovePermission = (index: number) => {
		setPermissions(permissions.filter((_, i) => i !== index));
	};

	const handleUpdatePermission = (
		index: number,
		field: string,
		value: string
	) => {
		const newPerms = [...permissions];
		(newPerms[index] as unknown as Record<string, unknown>)[field] = value;
		setPermissions(newPerms);
	};

	const handleSave = async () => {
		if (!selectedPaId) return;
		setLoading(true);
		try {
			await updatePAPermissions(selectedPaId, permissions);
			customToast.success("Permissions updated successfully");
		} catch (err: unknown) {
			console.error("Failed to update permissions:", err);
			customToast.error("Failed to update permissions");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="h-full flex flex-col space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Permission Management</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Manage granular access control for Personal Assistants
				</p>
			</div>

			<Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none">
				<div className="flex flex-col sm:flex-row items-end gap-4">
					<div className="flex-1 space-y-2">
						<label className="text-sm font-medium">Select Personal Assistant</label>
						<div className="flex gap-2">
							<Select
								onValueChange={handlePaChange}
								value={selectedPaId}>
								<SelectTrigger className="flex-1 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
									<SelectValue placeholder="Choose a PA to manage..." />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
									{pas.map((pa) => (
										<SelectItem
											key={pa.id}
											value={pa.id}>
											{pa.name} ({pa.email}) — {pa.role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{selectedPaId && (
								<div className="flex gap-2">
									<Dialog
										open={editDialogOpen}
										onOpenChange={(open) => {
											setEditDialogOpen(open);
											if (open) {
												const pa = pas.find((p) => p.id === selectedPaId);
												if (pa) setEditingPa({ name: pa.name, role: pa.role || "PA" });
											}
										}}>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												className="shrink-0">
												<Edit2 className="size-4 text-zinc-500" />
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
											<form onSubmit={handleUpdatePA}>
												<DialogHeader>
													<DialogTitle>Edit PA Account</DialogTitle>
													<DialogDescription>
														Update account information for this Personal Assistant.
													</DialogDescription>
												</DialogHeader>
												<div className="grid gap-4 py-4">
													<div className="grid gap-2">
														<Label htmlFor="edit-name">Full Name</Label>
														<Input
															id="edit-name"
															required
															value={editingPa.name}
															onChange={(e) =>
																setEditingPa({ ...editingPa, name: e.target.value })
															}
															className="bg-zinc-50 dark:bg-zinc-950"
														/>
													</div>
													<div className="grid gap-2">
														<Label htmlFor="edit-role">Role</Label>
														<Select
															value={editingPa.role}
															onValueChange={(val) =>
																setEditingPa({ ...editingPa, role: val })
															}>
															<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
																<SelectValue />
															</SelectTrigger>
															<SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
																<SelectItem value="PA">Personal Assistant</SelectItem>
																<SelectItem value="SENIOR_PA">Senior PA</SelectItem>
																<SelectItem value="ADMIN">Admin</SelectItem>
																<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</div>
												<DialogFooter>
													<Button
														type="submit"
														disabled={updating}
														className="bg-violet-600 hover:bg-violet-700 text-white w-full">
														{updating ? "Updating..." : "Save Changes"}
													</Button>
												</DialogFooter>
											</form>
										</DialogContent>
									</Dialog>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												className="shrink-0 hover:bg-red-50 dark:hover:bg-red-950/30">
												<Trash className="size-4 text-red-500" />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
											<AlertDialogHeader>
												<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be undone. This will permanently delete the PA
													account and remove their access to the system.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="bg-zinc-100 dark:bg-zinc-800">
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleDeletePA}
													className="bg-red-600 hover:bg-red-700 text-white"
													disabled={deleting}>
													{deleting ? "Deleting..." : "Delete Account"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							)}

							<Dialog
								open={createDialogOpen}
								onOpenChange={setCreateDialogOpen}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										className="shrink-0 border-violet-200 dark:border-violet-900 hover:bg-violet-50 dark:hover:bg-violet-950">
										<UserPlus className="size-4 mr-2 text-violet-600" />
										Register New PA
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
									<form onSubmit={handleCreatePA}>
										<DialogHeader>
											<DialogTitle>Register New PA</DialogTitle>
											<DialogDescription>
												Create a new Personal Assistant account. They will be able to log in
												with these credentials.
											</DialogDescription>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="name">Full Name</Label>
												<Input
													id="name"
													required
													value={newPa.name}
													onChange={(e) => setNewPa({ ...newPa, name: e.target.value })}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="email">Email Address</Label>
												<Input
													id="email"
													type="email"
													required
													value={newPa.email}
													onChange={(e) => setNewPa({ ...newPa, email: e.target.value })}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="password">Password</Label>
												<Input
													id="password"
													type="password"
													required
													value={newPa.password}
													onChange={(e) => setNewPa({ ...newPa, password: e.target.value })}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="role">Role</Label>
												<Select
													value={newPa.role}
													onValueChange={(val) => setNewPa({ ...newPa, role: val })}>
													<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
														<SelectItem value="PA">Personal Assistant</SelectItem>
														<SelectItem value="SENIOR_PA">Senior PA</SelectItem>
														<SelectItem value="ADMIN">Admin</SelectItem>
														<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<DialogFooter>
											<Button
												type="submit"
												disabled={creating}
												className="bg-violet-600 hover:bg-violet-700 text-white w-full">
												{creating ? "Creating..." : "Create Account"}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</div>
					<Button
						onClick={handleSave}
						disabled={!selectedPaId || loading}
						className="bg-violet-600 hover:bg-violet-700 text-white font-sans">
						<Save className="size-4 mr-2" />
						Save Changes
					</Button>
				</div>
			</Card>

			{selectedPaId && (
				<Card className="flex-1 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none flex flex-col">
					<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Shield className="size-4 text-violet-600" />
							<h3 className="font-semibold font-sans text-sm">Active Rules</h3>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={handleAddPermission}
							className="font-sans text-xs">
							<Plus className="size-3 mr-2" />
							Add Permission
						</Button>
					</div>

					<div className="flex-1 overflow-auto p-4 space-y-3">
						{permissions.length === 0 ? (
							<div className="h-32 flex items-center justify-center text-zinc-500 italic font-sans text-sm">
								No permissions defined for this PA
							</div>
						) : (
							permissions.map((perm, index) => (
								<div
									key={index}
									className="flex flex-col gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<label className="text-[10px] uppercase font-bold text-zinc-500 font-sans">
													Permission Key
												</label>
												{perm.source === "role" && (
													<span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
														Role Inherited
													</span>
												)}
											</div>
											{perm.source === "role" ? (
												<Input
													value={perm.key}
													disabled
													className="font-mono text-sm h-9 bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
												/>
											) : (
												<Select
													value={perm.key}
													onValueChange={(val) => {
														const selected = PREDEFINED_PERMISSIONS.find(
															(p) => p.key === val
														);
														const newPerms = [...permissions];
														newPerms[index] = {
															...newPerms[index],
															key: val,
															description: selected?.description || "",
														};
														setPermissions(newPerms);
													}}>
													<SelectTrigger className="h-9 font-mono text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
														<SelectValue placeholder="Select permission..." />
													</SelectTrigger>
													<SelectContent className="max-h-[300px]">
														{PREDEFINED_PERMISSIONS.map((p) => (
															<SelectItem
																key={p.key}
																value={p.key}
																className="font-mono text-xs">
																<div className="flex flex-col gap-0.5">
																	<span>{p.key}</span>
																	<span className="text-[10px] text-zinc-400 font-sans">
																		{p.description}
																	</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleRemovePermission(index)}
											className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 mt-6">
											<Trash2 className="size-4" />
										</Button>
									</div>

									{perm.description && (
										<div className="text-xs text-zinc-500">{perm.description}</div>
									)}
								</div>
							))
						)}
					</div>
				</Card>
			)}
		</div>
	);
}
