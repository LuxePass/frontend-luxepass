import { useState, useEffect } from "react";
import { useUsers, type User } from "../hooks/useUsers";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
	UserPlus,
	Edit2,
	Trash2,
	Activity,
	Mail,
	Phone,
	Shield,
	RefreshCw,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { customToast } from "./CustomToast";
import { ScrollArea } from "../components/ui/scroll-area";

const STATUS_CONFIG = {
	ONLINE: {
		label: "Online",
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	OFFLINE: {
		label: "Offline",
		color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
	},
	BUSY: {
		label: "Busy",
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	AWAY: {
		label: "Away",
		color:
			"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	},
};

const ROLES = [
	{ value: "PA", label: "Personal Assistant" },
	{ value: "SENIOR_PA", label: "Senior PA" },
	{ value: "ADMIN", label: "Admin" },
	{ value: "SUPER_ADMIN", label: "Super Admin" },
];

export function PAManager() {
	const { getAllPAs, createPA, updatePA, deletePA } = useUsers();
	const [pas, setPas] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [selectedPa, setSelectedPa] = useState<User | null>(null);
	const [processing, setProcessing] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		role: "PA",
		status: "OFFLINE",
	});

	const fetchPas = async () => {
		setLoading(true);
		try {
			const data = await getAllPAs();
			setPas(data || []);
		} catch (err) {
			console.error("Failed to fetch PAs:", err);
			customToast.error("Failed to fetch PAs");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPas();
	}, []);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setProcessing(true);
		try {
			await createPA(formData);
			customToast.success("PA created successfully");
			setCreateOpen(false);
			fetchPas();
			setFormData({
				name: "",
				email: "",
				phone: "",
				role: "PA",
				status: "OFFLINE",
			});
		} catch (err) {
			customToast.error("Failed to create PA");
		} finally {
			setProcessing(false);
		}
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedPa) return;
		setProcessing(true);
		try {
			await updatePA(selectedPa.id, formData);
			customToast.success("PA updated successfully");
			setEditOpen(false);
			fetchPas();
		} catch (err) {
			customToast.error("Failed to update PA");
		} finally {
			setProcessing(false);
		}
	};

	const handleDelete = async (id: string) => {
		setProcessing(true);
		try {
			await deletePA(id);
			customToast.success("PA deleted successfully");
			fetchPas();
		} catch (err) {
			customToast.error("Failed to delete PA");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="h-full flex flex-col space-y-6 px-4 lg:px-6 py-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Personal Assistants</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Manage PA accounts, roles, and real-time status
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={fetchPas}
						disabled={loading}>
						<RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
					</Button>
					<Dialog
						open={createOpen}
						onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button className="bg-violet-600 hover:bg-violet-700 text-white">
								<UserPlus className="size-4 mr-2" />
								Add New PA
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
							<form onSubmit={handleCreate}>
								<DialogHeader>
									<DialogTitle>Register New PA</DialogTitle>
									<DialogDescription>
										Create a new PA account. Credentials will be sent via email.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											required
											className="bg-zinc-50 dark:bg-zinc-950"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="email">Email Address</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											required
											className="bg-zinc-50 dark:bg-zinc-950"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="phone">Phone Number</Label>
										<Input
											id="phone"
											value={formData.phone}
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
											className="bg-zinc-50 dark:bg-zinc-950"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label>Role</Label>
											<Select
												value={formData.role}
												onValueChange={(val) => setFormData({ ...formData, role: val })}>
												<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{ROLES.map((role) => (
														<SelectItem
															key={role.value}
															value={role.value}>
															{role.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="grid gap-2">
											<Label>Initial Status</Label>
											<Select
												value={formData.status}
												onValueChange={(val) => setFormData({ ...formData, status: val })}>
												<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
														<SelectItem
															key={key}
															value={key}>
															{cfg.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="submit"
										disabled={processing}
										className="w-full bg-violet-600 hover:bg-violet-700 text-white">
										{processing ? "Creating..." : "Register PA"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{loading ? (
						Array.from({ length: 6 }).map((_, i) => (
							<Card
								key={i}
								className="p-6 animate-pulse">
								<div className="flex items-center gap-4 mb-4">
									<div className="size-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
										<div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
									</div>
								</div>
								<div className="space-y-3">
									<div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
									<div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
								</div>
							</Card>
						))
					) : pas.length === 0 ? (
						<div className="col-span-full py-20 text-center text-zinc-500 italic">
							No Personal Assistants found.
						</div>
					) : (
						pas.map((pa) => (
							<Card
								key={pa.id}
								className="group p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 transition-all shadow-none">
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-4">
										<div className="size-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-500/20">
											{pa.name[0]}
										</div>
										<div>
											<h3 className="font-bold text-zinc-900 dark:text-zinc-100">
												{pa.name}
											</h3>
											<Badge
												variant="secondary"
												className="mt-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none font-medium">
												<Shield className="size-3 mr-1" />
												{pa.role}
											</Badge>
										</div>
									</div>
									<Badge
										className={
											STATUS_CONFIG[pa.status as keyof typeof STATUS_CONFIG]?.color ||
											STATUS_CONFIG.OFFLINE.color
										}>
										<Activity className="size-3 mr-1" />
										{STATUS_CONFIG[pa.status as keyof typeof STATUS_CONFIG]?.label ||
											pa.status}
									</Badge>
								</div>

								<div className="space-y-2 mb-6">
									<div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
										<Mail className="size-4" />
										<span className="truncate">{pa.email}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
										<Phone className="size-4" />
										<span>{pa.phone || "No phone set"}</span>
									</div>
								</div>

								<div className="flex gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => {
											setSelectedPa(pa);
											setFormData({
												name: pa.name,
												email: pa.email,
												phone: pa.phone || "",
												role: pa.role || "PA",
												status: pa.status || "OFFLINE",
											});
											setEditOpen(true);
										}}>
										<Edit2 className="size-4 mr-2" />
										Edit
									</Button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50">
												<Trash2 className="size-4" />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
											<AlertDialogHeader>
												<AlertDialogTitle>Delete PA Account?</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to delete {pa.name}'s account? This will
													revoke all access and cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="bg-zinc-100 dark:bg-zinc-800">
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													className="bg-red-600 hover:bg-red-700 text-white"
													onClick={() => handleDelete(pa.id)}>
													Delete Permanently
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</Card>
						))
					)}
				</div>
			</ScrollArea>

			<Dialog
				open={editOpen}
				onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<form onSubmit={handleUpdate}>
						<DialogHeader>
							<DialogTitle>Edit PA Details</DialogTitle>
							<DialogDescription>
								Update information and status for this account.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="edit-name">Full Name</Label>
								<Input
									id="edit-name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
									className="bg-zinc-50 dark:bg-zinc-950"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-phone">Phone Number</Label>
								<Input
									id="edit-phone"
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									className="bg-zinc-50 dark:bg-zinc-950"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Role</Label>
									<Select
										value={formData.role}
										onValueChange={(val) => setFormData({ ...formData, role: val })}>
										<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{ROLES.map((role) => (
												<SelectItem
													key={role.value}
													value={role.value}>
													{role.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label>Current Status</Label>
									<Select
										value={formData.status}
										onValueChange={(val) => setFormData({ ...formData, status: val })}>
										<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
												<SelectItem
													key={key}
													value={key}>
													{cfg.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="submit"
								disabled={processing}
								className="w-full bg-violet-600 hover:bg-violet-700 text-white">
								{processing ? "Updating..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
