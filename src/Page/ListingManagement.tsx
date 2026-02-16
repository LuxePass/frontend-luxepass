/* eslint-disable @typescript-eslint/no-unused-vars */

import { customToast } from "./CustomToast";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { useState, useEffect, useMemo } from "react";
import {
	useListings,
	type PropertyListing,
	type ListingMedia,
} from "../hooks/useListings";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ScrollArea } from "../components/ui/scroll-area";
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
	Image as ImageIcon,
	Upload,
	Trash2,
	Plus,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

export function ListingManagement() {
	const { user } = useAuth();
	const {
		listings,
		loading,
		getListings,
		createListing,
		updateVettingStatus,
		deleteListing,
		getMedia,
		addMedia,
		deleteMedia,
		updateLocalListing,
		addLocalListing,
		removeLocalListing,
	} = useListings();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [vetFilter, setVetFilter] = useState<string>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(
		null
	);

	useEffect(() => {
		getListings();
	}, [getListings]);

	const handleDeleteListing = async (id: string) => {
		try {
			await deleteListing(id);
			removeLocalListing(id); // Optimistic update
			customToast.success({
				title: "Listing Deleted",
				description: "The listing has been removed successfully",
			});
			// getListings(); // No longer needed
		} catch (err) {
			customToast.error("Failed to delete listing");
		}
	};

	const handleApprove = async (id: string) => {
		try {
			const updated = await updateVettingStatus(id, "APPROVED");
			if (updated) {
				updateLocalListing(updated);
			}
			customToast.success({
				title: "Listing Approved",
				description: "The listing has been approved successfully",
			});
			// getListings(); // No longer needed for immediate update, but can keep for consistency if desired
		} catch (err) {
			customToast.error("Failed to approve listing");
		}
	};

	const handleReject = async (id: string) => {
		try {
			const updated = await updateVettingStatus(id, "REJECTED");
			if (updated) {
				updateLocalListing(updated);
			}
			customToast.error({
				title: "Listing Rejected",
				description: "The listing has been rejected",
			});
			// getListings();
		} catch (err) {
			customToast.error("Failed to reject listing");
		}
	};

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [newListing, setNewListing] = useState<Partial<PropertyListing>>({
		name: "",
		description: "",
		pricePerNight: "",
		currency: "USD",
		address: "",
		city: "",
		state: "",
		country: "",
		propertyType: "APARTMENT",
		bedrooms: 1,
		bathrooms: 1,
		maxGuests: 2,
		amenities: ["Wifi"],
	});

	const handleCreateListing = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreating(true);
		try {
			const createdListing = await createListing(newListing);
			if (createdListing) {
				addLocalListing(createdListing);
			}
			customToast.success("Listing created successfully");
			setCreateDialogOpen(false);
			setNewListing({
				name: "",
				description: "",
				pricePerNight: "",
				currency: "USD",
				address: "",
				city: "",
				state: "",
				country: "",
				propertyType: "APARTMENT",
				bedrooms: 1,
				bathrooms: 1,
				maxGuests: 2,
				amenities: ["Wifi"],
			});
			// getListings(); // Background refresh if needed, but UI is updated
		} catch (err) {
			customToast.error("Failed to create listing");
		} finally {
			setCreating(false);
		}
	};

	const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
	const [listingImages, setListingImages] = useState<ListingMedia[]>([]);
	const [uploading, setUploading] = useState(false);

	const handleManageMedia = async (listing: PropertyListing) => {
		setSelectedListing(listing);
		setImagesDialogOpen(true);
		try {
			const media = await getMedia(listing.id);
			setListingImages(media);
		} catch (err) {
			customToast.error("Failed to fetch media");
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!selectedListing || !e.target.files?.[0]) return;
		setUploading(true);
		try {
			await addMedia(selectedListing.id, e.target.files[0]);
			const updatedMedia = await getMedia(selectedListing.id);
			setListingImages(updatedMedia);
			customToast.success("Image uploaded successfully");
		} catch (err) {
			customToast.error("Failed to upload image");
		} finally {
			setUploading(false);
		}
	};

	const handleDeleteImage = async (mediaId: string) => {
		if (!selectedListing) return;
		try {
			await deleteMedia(selectedListing.id, mediaId);
			setListingImages((prev) => prev.filter((img) => img.id !== mediaId));
			customToast.success("Image deleted");
		} catch (err) {
			customToast.error("Failed to delete image");
		}
	};

	const getStatusBadge = (listing: PropertyListing) => {
		if (listing.isActive) {
			return (
				<Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900 border-none">
					Active
				</Badge>
			);
		}
		return (
			<Badge className="bg-zinc-200 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-400 border-zinc-400 dark:border-zinc-600 border-none">
				Inactive
			</Badge>
		);
	};

	const getVetBadge = (vetStatus: string) => {
		switch (vetStatus) {
			case "APPROVED":
				return (
					<Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900 border-none">
						Approved
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900 border-none">
						Rejected
					</Badge>
				);
			case "PENDING":
				return (
					<Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900 border-none">
						Pending
					</Badge>
				);
			default:
				return null;
		}
	};

	const filteredListings = useMemo(() => {
		return listings.filter((listing) => {
			const matchesSearch =
				listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.propertyType.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "active" ? listing.isActive : !listing.isActive);
			const matchesVet =
				vetFilter === "all" || listing.vettingStatus === vetFilter;
			const matchesCategory =
				categoryFilter === "all" || listing.propertyType === categoryFilter;

			return matchesSearch && matchesStatus && matchesVet && matchesCategory;
		});
	}, [listings, searchQuery, statusFilter, vetFilter, categoryFilter]);

	return (
		<div className="h-full flex flex-col px-4 lg:px-6 py-6">
			<Card className="flex-1 flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-none rounded-xl">
				{/* Header */}
				<div className="p-4 lg:p-6 border-b border-zinc-200 dark:border-zinc-800">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
						<div>
							<h3 className="mb-1 font-bold">Listing Management</h3>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{filteredListings.length} property listing
								{filteredListings.length !== 1 ? "s" : ""}
							</p>
						</div>
						<div className="flex gap-2 w-full sm:w-auto">
							<Dialog
								open={createDialogOpen}
								onOpenChange={setCreateDialogOpen}>
								<DialogTrigger asChild>
									<Button className="bg-violet-600 hover:bg-violet-700 flex-1 sm:flex-none">
										<Plus className="size-4 mr-2" />
										Create Listing
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[600px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
									<form onSubmit={handleCreateListing}>
										<DialogHeader>
											<DialogTitle>Create New Listing</DialogTitle>
											<DialogDescription>
												Add a new property to the system.
											</DialogDescription>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="name">Property Name</Label>
												<Input
													id="name"
													required
													value={newListing.name}
													onChange={(e) =>
														setNewListing({ ...newListing, name: e.target.value })
													}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="grid gap-2">
													<Label htmlFor="type">Property Type</Label>
													<Select
														value={newListing.propertyType}
														onValueChange={(val) =>
															setNewListing({ ...newListing, propertyType: val })
														}>
														<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
															<SelectValue />
														</SelectTrigger>
														<SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
															<SelectItem value="APARTMENT">Apartment</SelectItem>
															<SelectItem value="HOUSE">House</SelectItem>
															<SelectItem value="VILLA">Villa</SelectItem>
															<SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
															<SelectItem value="CONDO">Condo</SelectItem>
															<SelectItem value="OFFICE">Office</SelectItem>
															<SelectItem value="OTHER">Other</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="price">Price Per Night</Label>
													<Input
														id="price"
														required
														type="number"
														value={newListing.pricePerNight}
														onChange={(e) =>
															setNewListing({ ...newListing, pricePerNight: e.target.value })
														}
														className="bg-zinc-50 dark:bg-zinc-950"
													/>
												</div>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="address">Address</Label>
												<Input
													id="address"
													required
													value={newListing.address}
													onChange={(e) =>
														setNewListing({ ...newListing, address: e.target.value })
													}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="grid gap-2">
													<Label htmlFor="city">City</Label>
													<Input
														id="city"
														required
														value={newListing.city}
														onChange={(e) =>
															setNewListing({ ...newListing, city: e.target.value })
														}
														className="bg-zinc-50 dark:bg-zinc-950"
													/>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="state">State</Label>
													<Input
														id="state"
														required
														value={newListing.state}
														onChange={(e) =>
															setNewListing({ ...newListing, state: e.target.value })
														}
														className="bg-zinc-50 dark:bg-zinc-950"
													/>
												</div>
											</div>
											<div className="grid grid-cols-3 gap-4">
												<div className="grid gap-2">
													<Label htmlFor="bedrooms">Bedrooms</Label>
													<Input
														id="bedrooms"
														type="number"
														min="1"
														value={newListing.bedrooms}
														onChange={(e) =>
															setNewListing({
																...newListing,
																bedrooms: parseInt(e.target.value),
															})
														}
														className="bg-zinc-50 dark:bg-zinc-900"
													/>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="bathrooms">Bathrooms</Label>
													<Input
														id="bathrooms"
														type="number"
														min="1"
														value={newListing.bathrooms}
														onChange={(e) =>
															setNewListing({
																...newListing,
																bathrooms: parseInt(e.target.value),
															})
														}
														className="bg-zinc-50 dark:bg-zinc-900"
													/>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="guests">Max Guests</Label>
													<Input
														id="guests"
														type="number"
														min="1"
														value={newListing.maxGuests}
														onChange={(e) =>
															setNewListing({
																...newListing,
																maxGuests: parseInt(e.target.value),
															})
														}
														className="bg-zinc-50 dark:bg-zinc-900"
													/>
												</div>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="amenities">Amenities (Comma separated)</Label>
												<Input
													id="amenities"
													placeholder="Wifi, Pool, Parking"
													value={
														Array.isArray(newListing.amenities)
															? newListing.amenities.join(", ")
															: ""
													}
													onChange={(e) =>
														setNewListing({
															...newListing,
															amenities: e.target.value
																.split(",")
																.map((s) => s.trim())
																.filter(Boolean),
														})
													}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="desc">Description</Label>
												<Input
													id="desc"
													value={newListing.description}
													onChange={(e) =>
														setNewListing({ ...newListing, description: e.target.value })
													}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button
												type="submit"
												disabled={creating}
												className="bg-violet-600 hover:bg-violet-700 text-white w-full">
												{creating ? "Creating..." : "Create Listing"}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
							<Button
								variant="outline"
								className="hidden sm:flex">
								<Download className="size-4 mr-2" />
								Export
							</Button>
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
							<Input
								placeholder="Search properties..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-sans"
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
									<DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
										Inactive
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
									<DropdownMenuItem onClick={() => setCategoryFilter("APARTMENT")}>
										Apartment
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("VILLA")}>
										Villa
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("HOTEL")}>
										Hotel
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>

				{/* Desktop Table */}
				<ScrollArea className="flex-1 overflow-auto">
					<div className="py-3 pb-safe">
						{loading ? (
							<div className="flex items-center justify-center p-20">
								<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
							</div>
						) : (
							<>
								<div className="hidden lg:block font-sans">
									<Table>
										<TableHeader>
											<TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
												<TableHead className="text-zinc-600 dark:text-zinc-400">
													Property Name
												</TableHead>
												<TableHead className="text-zinc-600 dark:text-zinc-400">
													Location
												</TableHead>
												<TableHead className="text-zinc-600 dark:text-zinc-400">
													Price/Night
												</TableHead>
												<TableHead className="text-zinc-600 dark:text-zinc-400">
													Status
												</TableHead>
												<TableHead className="text-zinc-600 dark:text-zinc-400">
													Vetting
												</TableHead>
												<TableHead className="text-zinc-600 dark:text-zinc-400">
													Created At
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
															<p className="text-sm font-medium mb-0.5">{listing.name}</p>
															<p className="text-xs text-zinc-500 dark:text-zinc-400">
																{listing.propertyType}
															</p>
														</div>
													</TableCell>
													<TableCell className="text-sm text-zinc-600 dark:text-zinc-300">
														{listing.city}, {listing.state}
													</TableCell>
													<TableCell className="text-sm text-zinc-600 dark:text-zinc-300">
														{listing.currency}{" "}
														{parseFloat(listing.pricePerNight).toLocaleString()}
													</TableCell>
													<TableCell>{getStatusBadge(listing)}</TableCell>
													<TableCell>{getVetBadge(listing.vettingStatus)}</TableCell>
													<TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
														{new Date(listing.createdAt).toLocaleDateString()}
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
																{(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
																	<>
																		<DropdownMenuItem onClick={() => handleApprove(listing.id)}>
																			<CheckCircle2 className="size-3.5 mr-2" />
																			Approve
																		</DropdownMenuItem>
																		<DropdownMenuItem onClick={() => handleReject(listing.id)}>
																			<XCircle className="size-3.5 mr-2" />
																			Reject
																		</DropdownMenuItem>
																	</>
																)}
																<DropdownMenuItem onClick={() => handleManageMedia(listing)}>
																	<ImageIcon className="size-3.5 mr-2" />
																	Manage Media
																</DropdownMenuItem>
																{(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
																	<DropdownMenuItem
																		onClick={() => handleDeleteListing(listing.id)}>
																		<Archive className="size-3.5 mr-2" />
																		Delete
																	</DropdownMenuItem>
																)}
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								<div className="lg:hidden space-y-3 font-sans">
									{filteredListings.map((listing) => (
										<Card
											key={listing.id}
											className="p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
											<div className="space-y-3">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-bold mb-1 truncate">
															{listing.name}
														</h4>
														<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
															{listing.city}, {listing.state}
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
															<DropdownMenuItem onClick={() => handleApprove(listing.id)}>
																<CheckCircle2 className="size-3.5 mr-2" />
																Approve
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleReject(listing.id)}>
																<XCircle className="size-3.5 mr-2" />
																Reject
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleManageMedia(listing)}>
																<ImageIcon className="size-3.5 mr-2" />
																Manage Media
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>

												<div className="flex items-center gap-2 flex-wrap">
													<Badge
														variant="outline"
														className="capitalize border-zinc-300 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300">
														{listing.propertyType}
													</Badge>
													<span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
														{listing.currency}{" "}
														{parseFloat(listing.pricePerNight).toLocaleString()}
													</span>
												</div>

												<div className="flex items-center gap-2 flex-wrap">
													{getStatusBadge(listing)}
													{getVetBadge(listing.vettingStatus)}
												</div>

												<div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
													<p className="text-xs text-zinc-500 dark:text-zinc-400">
														Added: {new Date(listing.createdAt).toLocaleDateString()}
													</p>
												</div>
											</div>
										</Card>
									))}
								</div>
							</>
						)}
					</div>
				</ScrollArea>
			</Card>

			{/* Media Management Dialog */}
			<Dialog
				open={imagesDialogOpen}
				onOpenChange={setImagesDialogOpen}>
				<DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<DialogHeader>
						<DialogTitle>Listing Media - {selectedListing?.name}</DialogTitle>
						<DialogDescription>
							Manage property photos and media assets
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-auto py-6">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{listingImages.map((image) => (
								<div
									key={image.id}
									className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
									<img
										src={image.url}
										alt={image.fileName}
										className="size-full object-cover"
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteImage(image.id)}
											className="h-8">
											<Trash2 className="size-4 mr-2" />
											Delete
										</Button>
									</div>
									{image.isPrimary && (
										<Badge className="absolute top-2 left-2 bg-violet-600 text-white border-none">
											Primary
										</Badge>
									)}
								</div>
							))}

							{/* Upload Placeholder */}
							<label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-500 cursor-pointer transition-colors bg-zinc-50 dark:bg-zinc-900/50">
								<div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
									{uploading ? (
										<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
									) : (
										<>
											<Upload className="size-8" />
											<span className="text-sm font-medium">Upload Image</span>
										</>
									)}
								</div>
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleFileUpload}
									disabled={uploading}
								/>
							</label>
						</div>
					</div>

					<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
						<Button
							variant="outline"
							onClick={() => setImagesDialogOpen(false)}>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
