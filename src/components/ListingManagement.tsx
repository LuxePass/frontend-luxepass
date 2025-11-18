/* eslint-disable @typescript-eslint/no-unused-vars */

import { customToast } from "./CustomToast";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import {
	Search,
	Filter,
	MoreVertical,
	Edit,
	CheckCircle2,
	XCircle,
	Clock,
	Download,
	MoreHorizontal,
	Archive,
} from "lucide-react";

interface Listing {
	id: string;
	title: string;
	client: string;
	category: string;
	price: string;
	status: "active" | "pending" | "vetted" | "rejected" | "archived";
	vetStatus: "approved" | "pending" | "rejected" | "needs-review";
	taskStatus?: "not-started" | "in-progress" | "completed" | "on-hold";
	assignedTo?: string;
	addedDate: string;
	lastUpdated: string;
}

const mockListings: Listing[] = [
	{
		id: "1",
		title: "Luxury Penthouse - Banana Island",
		client: "Chidinma Okonkwo",
		category: "Real Estate",
		price: "₦450,000,000",
		status: "active",
		vetStatus: "approved",
		addedDate: "2025-10-15",
		lastUpdated: "2025-10-19 14:30",
	},
	{
		id: "2",
		title: "Private Yacht Charter - Lagos Lagoon",
		client: "Emeka Adeleke",
		category: "Travel",
		price: "₦15,000,000/week",
		status: "active",
		vetStatus: "approved",
		addedDate: "2025-10-18",
		lastUpdated: "2025-10-19 11:20",
	},
	{
		id: "3",
		title: "Premium Wine Collection - France",
		client: "Chukwudi Okafor",
		category: "Shopping",
		price: "₦8,500,000",
		status: "pending",
		vetStatus: "pending",
		addedDate: "2025-10-19",
		lastUpdated: "2025-10-19 09:15",
	},
	{
		id: "4",
		title: "Private Art Gallery Event at Nike Art Centre",
		client: "Ngozi Adekunle",
		category: "Events",
		price: "₦5,000,000",
		status: "active",
		vetStatus: "needs-review",
		addedDate: "2025-10-17",
		lastUpdated: "2025-10-18 16:45",
	},
	{
		id: "5",
		title: "Luxury Villa Rental - Lekki Peninsula",
		client: "Amara Nwosu",
		category: "Real Estate",
		price: "₦4,500,000/week",
		status: "vetted",
		vetStatus: "approved",
		addedDate: "2025-10-16",
		lastUpdated: "2025-10-19 08:00",
	},
	{
		id: "6",
		title: "Personal Shopping Service at The Palms",
		client: "Chidinma Okonkwo",
		category: "Shopping",
		price: "₦2,500,000",
		status: "rejected",
		vetStatus: "rejected",
		addedDate: "2025-10-14",
		lastUpdated: "2025-10-15 10:30",
	},
];

export function ListingManagement() {
	const [listings, setListings] = useState(mockListings);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [vetFilter, setVetFilter] = useState<string>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

	// Form state for editing
	const [editForm, setEditForm] = useState({
		title: "",
		client: "",
		category: "",
		price: "",
		status: "" as "active" | "pending" | "vetted" | "rejected" | "archived",
		vetStatus: "" as "approved" | "pending" | "rejected" | "needs-review",
	});

	const handleDelete = (id: string) => {
		setListings(listings.filter((l) => l.id !== id));
		customToast.success({
			title: "Listing Deleted",
			description: "The listing has been removed successfully",
		});
	};

	const handleEdit = (id: string) => {
		const listing = listings.find((l) => l.id === id);
		if (listing) {
			setSelectedListing(listing);
			setEditForm({
				title: listing.title,
				client: listing.client,
				category: listing.category,
				price: listing.price,
				status: listing.status,
				vetStatus: listing.vetStatus,
			});
			setEditDialogOpen(true);
		}
	};

	const handleView = (id: string) => {
		customToast.info("Opening listing details");
	};

	const handleApprove = (id: string) => {
		customToast.success({
			title: "Listing Approved",
			description: "The listing has been approved successfully",
		});
	};

	const handleReject = (id: string) => {
		customToast.error({
			title: "Listing Rejected",
			description: "The listing has been rejected",
		});
	};

	const handleArchive = (id: string) => {
		setListings(
			listings.map((listing) =>
				listing.id === id
					? {
							...listing,
							status: "archived" as const,
							lastUpdated: new Date().toLocaleString("en-US", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							}),
					  }
					: listing
			)
		);
		customToast.info({
			title: "Listing Archived",
			description: "The listing has been moved to archive",
		});
	};

	const handleUpdateTaskStatus = (
		id: string,
		taskStatus: "not-started" | "in-progress" | "completed" | "on-hold"
	) => {
		setListings(
			listings.map((listing) =>
				listing.id === id
					? {
							...listing,
							taskStatus,
							lastUpdated: new Date().toLocaleString("en-US", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							}),
					  }
					: listing
			)
		);
		customToast.success({
			title: "Task Status Updated",
			description: `Task status changed to ${taskStatus.replace("-", " ")}`,
		});
	};

	const handleSaveEdit = () => {
		if (!selectedListing) return;

		setListings(
			listings.map((listing) =>
				listing.id === selectedListing.id
					? {
							...listing,
							...editForm,
							lastUpdated: new Date().toLocaleString("en-US", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							}),
					  }
					: listing
			)
		);

		customToast.success({
			title: "Listing Updated",
			description: "The listing has been updated successfully",
		});

		setEditDialogOpen(false);
		setSelectedListing(null);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900">
						Active
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900">
						Pending
					</Badge>
				);
			case "vetted":
				return (
					<Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-900">
						Vetted
					</Badge>
				);
			case "rejected":
				return (
					<Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900">
						Rejected
					</Badge>
				);
			case "archived":
				return (
					<Badge className="bg-zinc-200 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-400 border-zinc-400 dark:border-zinc-600">
						Archived
					</Badge>
				);
			default:
				return null;
		}
	};

	const getVetStatusIcon = (vetStatus: string) => {
		switch (vetStatus) {
			case "approved":
				return (
					<CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
				);
			case "rejected":
				return <XCircle className="size-4 text-red-600 dark:text-red-400" />;
			case "pending":
				return <Clock className="size-4 text-orange-600 dark:text-orange-400" />;
			case "needs-review":
				return <Filter className="size-4 text-yellow-600 dark:text-yellow-400" />;
			default:
				return null;
		}
	};

	const getVetBadge = (vetStatus: string) => {
		switch (vetStatus) {
			case "approved":
				return (
					<Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900">
						Approved
					</Badge>
				);
			case "rejected":
				return (
					<Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900">
						Rejected
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900">
						Pending
					</Badge>
				);
			case "needs-review":
				return (
					<Badge className="bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-900">
						Needs Review
					</Badge>
				);
			default:
				return null;
		}
	};

	const getTaskStatusBadge = (taskStatus?: string) => {
		if (!taskStatus)
			return (
				<Badge
					variant="outline"
					className="text-xs border-zinc-300 dark:border-zinc-700">
					Not Set
				</Badge>
			);

		switch (taskStatus) {
			case "not-started":
				return (
					<Badge className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700">
						Not Started
					</Badge>
				);
			case "in-progress":
				return (
					<Badge className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-900">
						In Progress
					</Badge>
				);
			case "completed":
				return (
					<Badge className="text-xs bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900">
						Completed
					</Badge>
				);
			case "on-hold":
				return (
					<Badge className="text-xs bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900">
						On Hold
					</Badge>
				);
			default:
				return null;
		}
	};

	const filteredListings = listings.filter((listing) => {
		const matchesSearch =
			listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			listing.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
			listing.category.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || listing.status === statusFilter;
		const matchesVet = vetFilter === "all" || listing.vetStatus === vetFilter;
		const matchesCategory =
			categoryFilter === "all" || listing.category === categoryFilter;

		return matchesSearch && matchesStatus && matchesVet && matchesCategory;
	});

	return (
		<div className="h-full flex flex-col">
			<Card className="flex-1 flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden">
				{/* Header */}
				<div className="p-4 lg:p-6 border-b border-zinc-200 dark:border-zinc-800">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
						<div>
							<h3 className="mb-1">Listing Management</h3>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{filteredListings.length} listing
								{filteredListings.length !== 1 ? "s" : ""}
							</p>
						</div>
						<Button className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
							<Download className="size-4 mr-2" />
							Export Data
						</Button>
					</div>

					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
							<Input
								placeholder="Search listings..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
							/>
						</div>

						<div className="flex gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="border-zinc-300 dark:border-zinc-700 flex-1 sm:flex-none">
										<Filter className="size-4 mr-2" />
										<span className="truncate">
											Status: {statusFilter === "all" ? "All" : statusFilter}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
									<DropdownMenuItem onClick={() => setStatusFilter("all")}>
										All
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setStatusFilter("active")}>
										Active
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setStatusFilter("pending")}>
										Pending
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setStatusFilter("vetted")}>
										Vetted
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
										Rejected
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setStatusFilter("archived")}>
										Archived
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="border-zinc-300 dark:border-zinc-700 flex-1 sm:flex-none">
										<Filter className="size-4 mr-2" />
										<span className="truncate">
											Category: {categoryFilter === "all" ? "All" : categoryFilter}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
									<DropdownMenuItem onClick={() => setCategoryFilter("all")}>
										All
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("restaurant")}>
										Restaurant
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("hotel")}>
										Hotel
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("spa")}>
										Spa
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("entertainment")}>
										Entertainment
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("travel")}>
										Travel
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>

				{/* Desktop Table */}
				<ScrollArea className="flex-1 overflow-auto">
					<div className="px-4 lg:px-6 py-3 pb-safe">
						{/* Desktop Table View */}
						<div className="hidden lg:block">
							<Table>
								<TableHeader>
									<TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Name
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Category
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Price
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Status
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Vet Status
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Task Status
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400">
											Last Updated
										</TableHead>
										<TableHead className="text-zinc-600 dark:text-zinc-400 text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredListings.map((listing) => (
										<TableRow
											key={listing.id}
											className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
											<TableCell>
												<div>
													<p className="text-sm mb-0.5">{listing.title}</p>
													<p className="text-xs text-zinc-500 dark:text-zinc-400">
														{listing.client}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className="capitalize border-zinc-300 dark:border-zinc-700">
													{listing.category}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-zinc-600 dark:text-zinc-300">
												{listing.price}
											</TableCell>
											<TableCell>{getStatusBadge(listing.status)}</TableCell>
											<TableCell>{getVetBadge(listing.vetStatus)}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="h-auto p-0 hover:bg-transparent">
															{getTaskStatusBadge(listing.taskStatus)}
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="start"
														className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
														<DropdownMenuItem
															onClick={() =>
																handleUpdateTaskStatus(listing.id, "not-started")
															}>
															Not Started
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleUpdateTaskStatus(listing.id, "in-progress")
															}>
															In Progress
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleUpdateTaskStatus(listing.id, "completed")}>
															Completed
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleUpdateTaskStatus(listing.id, "on-hold")}>
															On Hold
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
											<TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
												{listing.lastUpdated}
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="size-8 p-0">
															<MoreHorizontal className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
														<DropdownMenuItem onClick={() => handleEdit(listing.id)}>
															<Edit className="size-3.5 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleApprove(listing.id)}>
															<CheckCircle2 className="size-3.5 mr-2" />
															Approve
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleReject(listing.id)}>
															<XCircle className="size-3.5 mr-2" />
															Reject
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleArchive(listing.id)}>
															<Archive className="size-3.5 mr-2" />
															Archive
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-3">
							{filteredListings.map((listing) => (
								<Card
									key={listing.id}
									className="p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
									<div className="space-y-3">
										{/* Header with Title and Actions */}
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<h4 className="text-sm mb-1 truncate">{listing.title}</h4>
												<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
													{listing.client}
												</p>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0 shrink-0">
														<MoreVertical className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
													<DropdownMenuItem onClick={() => handleEdit(listing.id)}>
														<Edit className="size-3.5 mr-2" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleApprove(listing.id)}>
														<CheckCircle2 className="size-3.5 mr-2" />
														Approve
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleReject(listing.id)}>
														<XCircle className="size-3.5 mr-2" />
														Reject
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleArchive(listing.id)}>
														<Archive className="size-3.5 mr-2" />
														Archive
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{/* Category and Price */}
										<div className="flex items-center gap-2 flex-wrap">
											<Badge
												variant="outline"
												className="capitalize border-zinc-300 dark:border-zinc-700 text-xs">
												{listing.category}
											</Badge>
											<span className="text-sm text-zinc-600 dark:text-zinc-300">
												{listing.price}
											</span>
										</div>

										{/* Status Badges */}
										<div className="flex items-center gap-2 flex-wrap">
											{getStatusBadge(listing.status)}
											{getVetBadge(listing.vetStatus)}
										</div>

										{/* Task Status */}
										<div className="space-y-2">
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												Task Status
											</p>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="h-auto p-0 hover:bg-transparent w-full justify-start">
														{getTaskStatusBadge(listing.taskStatus)}
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="start"
													className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
													<DropdownMenuItem
														onClick={() => handleUpdateTaskStatus(listing.id, "not-started")}>
														Not Started
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleUpdateTaskStatus(listing.id, "in-progress")}>
														In Progress
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleUpdateTaskStatus(listing.id, "completed")}>
														Completed
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleUpdateTaskStatus(listing.id, "on-hold")}>
														On Hold
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{/* Last Updated */}
										<div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												Last updated: {listing.lastUpdated}
											</p>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				</ScrollArea>
			</Card>

			{/* Edit Listing Dialog */}
			<Dialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Listing</DialogTitle>
						<DialogDescription>
							Update listing information and status
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="edit-title">Listing Title</Label>
							<Input
								id="edit-title"
								value={editForm.title}
								onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
								placeholder="Enter listing title"
							/>
						</div>

						{/* Client */}
						<div className="space-y-2">
							<Label htmlFor="edit-client">Client Name</Label>
							<Input
								id="edit-client"
								value={editForm.client}
								onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
								placeholder="Enter client name"
							/>
						</div>

						{/* Category and Price - Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-category">Category</Label>
								<Select
									value={editForm.category}
									onValueChange={(value) =>
										setEditForm({ ...editForm, category: value })
									}>
									<SelectTrigger id="edit-category">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Real Estate">Real Estate</SelectItem>
										<SelectItem value="Travel">Travel</SelectItem>
										<SelectItem value="Shopping">Shopping</SelectItem>
										<SelectItem value="Events">Events</SelectItem>
										<SelectItem value="Dining">Dining</SelectItem>
										<SelectItem value="Entertainment">Entertainment</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-price">Price</Label>
								<Input
									id="edit-price"
									value={editForm.price}
									onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
									placeholder="₦0"
								/>
							</div>
						</div>

						{/* Status and Vet Status - Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-status">Status</Label>
								<Select
									value={editForm.status}
									onValueChange={(value) =>
										setEditForm({
											...editForm,
											status: value as
												| "active"
												| "pending"
												| "vetted"
												| "rejected"
												| "archived",
										})
									}>
									<SelectTrigger id="edit-status">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="vetted">Vetted</SelectItem>
										<SelectItem value="rejected">Rejected</SelectItem>
										<SelectItem value="archived">Archived</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-vet-status">Vet Status</Label>
								<Select
									value={editForm.vetStatus}
									onValueChange={(value) =>
										setEditForm({
											...editForm,
											vetStatus: value as
												| "approved"
												| "pending"
												| "rejected"
												| "needs-review",
										})
									}>
									<SelectTrigger id="edit-vet-status">
										<SelectValue placeholder="Select vet status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="approved">Approved</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="rejected">Rejected</SelectItem>
										<SelectItem value="needs-review">Needs Review</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								onClick={() => setEditDialogOpen(false)}
								className="flex-1">
								Cancel
							</Button>
							<Button
								onClick={handleSaveEdit}
								className="flex-1 bg-violet-600 hover:bg-violet-700">
								Save Changes
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
