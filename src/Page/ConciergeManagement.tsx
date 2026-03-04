/* eslint-disable @typescript-eslint/no-unused-vars */
import { customToast } from "./CustomToast";
import api from "../services/api";
import { useState, useEffect, useMemo, useCallback } from "react";
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
	MoreHorizontal,
	Edit,
	CheckCircle2,
	XCircle,
	Archive,
	Trash2,
	Plus,
	Tag,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface ConciergeItem {
	id: string;
	name: string;
	description: string;
	price: string;
	currency: string;
	category: string;
	isActive: boolean;
	mediaUrl?: string;
	createdAt: string;
}

export function ConciergeManagement() {
	const { user } = useAuth();
	const [items, setItems] = useState<ConciergeItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [newItem, setNewItem] = useState<Partial<ConciergeItem>>({
		name: "",
		description: "",
		price: "",
		currency: "NGN",
		category: "TRANSPORT",
		isActive: true,
	});

	const fetchItems = useCallback(async () => {
		setLoading(true);
		try {
			const response = await api.get("/concierge");
			if (response.data.success) {
				setItems(response.data.data.data);
			}
		} catch (err) {
			customToast.error("Failed to fetch concierge items");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	const handleCreateItem = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const response = await api.post("/concierge", newItem);
			if (response.data.success) {
				customToast.success("Item created successfully");
				setCreateDialogOpen(false);
				setNewItem({
					name: "",
					description: "",
					price: "",
					currency: "NGN",
					category: "TRANSPORT",
					isActive: true,
				});
				fetchItems();
			}
		} catch (err) {
			customToast.error("Failed to create item");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteItem = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this item?")) return;
		try {
			const response = await api.delete(`/concierge/${id}`);
			if (response.data.success) {
				customToast.success("Item deleted successfully");
				fetchItems();
			}
		} catch (err) {
			customToast.error("Failed to delete item");
		}
	};

	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const matchesSearch =
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				categoryFilter === "all" || item.category === categoryFilter;
			return matchesSearch && matchesCategory;
		});
	}, [items, searchQuery, categoryFilter]);

	return (
		<div className="h-full flex flex-col px-4 lg:px-6 py-6">
			<Card className="flex-1 flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-none rounded-xl">
				<div className="p-4 lg:p-6 border-b border-zinc-200 dark:border-zinc-800">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
						<div>
							<h3 className="mb-1 font-bold">Concierge Management</h3>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{filteredItems.length} concierge item
								{filteredItems.length !== 1 ? "s" : ""}
							</p>
						</div>
						<div className="flex gap-2 w-full sm:w-auto">
							<Dialog
								open={createDialogOpen}
								onOpenChange={setCreateDialogOpen}>
								<DialogTrigger asChild>
									<Button className="bg-violet-600 hover:bg-violet-700 flex-1 sm:flex-none">
										<Plus className="size-4 mr-2" />
										Create Item
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
									<form onSubmit={handleCreateItem}>
										<DialogHeader>
											<DialogTitle>Create New Concierge Item</DialogTitle>
											<DialogDescription>
												Add a new service or deal to the concierge menu.
											</DialogDescription>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="name">Item Name</Label>
												<Input
													id="name"
													required
													value={newItem.name}
													onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="grid gap-2">
													<Label htmlFor="category">Category</Label>
													<Select
														value={newItem.category}
														onValueChange={(val) =>
															setNewItem({ ...newItem, category: val })
														}>
														<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
															<SelectValue />
														</SelectTrigger>
														<SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
															<SelectItem value="TRANSPORT">Transport</SelectItem>
															<SelectItem value="FLIGHT">Flight</SelectItem>
															<SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
															<SelectItem value="EMERGENCY_FUNDS">Emergency Funds</SelectItem>
															<SelectItem value="OTHER">Other</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="price">Price</Label>
													<Input
														id="price"
														required
														type="number"
														value={newItem.price}
														onChange={(e) =>
															setNewItem({ ...newItem, price: e.target.value })
														}
														className="bg-zinc-50 dark:bg-zinc-950"
													/>
												</div>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="desc">Description</Label>
												<Input
													id="desc"
													value={newItem.description}
													onChange={(e) =>
														setNewItem({ ...newItem, description: e.target.value })
													}
													className="bg-zinc-50 dark:bg-zinc-950"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button
												type="submit"
												disabled={submitting}
												className="bg-violet-600 hover:bg-violet-700 text-white w-full">
												{submitting ? "Creating..." : "Create Item"}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
							<Input
								placeholder="Search items..."
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
										className="border-zinc-300 dark:border-zinc-700">
										<Filter className="size-4 mr-2" />
										Category: {categoryFilter === "all" ? "All" : categoryFilter}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
									<DropdownMenuItem onClick={() => setCategoryFilter("all")}>
										All
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("TRANSPORT")}>
										Transport
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("FLIGHT")}>
										Flight
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("LIFESTYLE")}>
										Lifestyle
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setCategoryFilter("EMERGENCY_FUNDS")}>
										Emergency Funds
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>

				<ScrollArea className="flex-1 overflow-auto">
					<div className="py-3">
						{loading ?
							<div className="flex items-center justify-center p-20">
								<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
							</div>
						:	<Table>
								<TableHeader>
									<TableRow className="border-zinc-200 dark:border-zinc-800">
										<TableHead>Name</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredItems.map((item) => (
										<TableRow
											key={item.id}
											className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
											<TableCell>
												<div>
													<p className="text-sm font-medium">{item.name}</p>
													<p className="text-xs text-zinc-500">{item.description}</p>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className="text-[10px] font-bold">
													{item.category}
												</Badge>
											</TableCell>
											<TableCell className="text-sm">
												{item.currency} {parseFloat(item.price).toLocaleString()}
											</TableCell>
											<TableCell>
												{item.isActive ?
													<Badge className="bg-green-100 text-green-700 border-none">
														Active
													</Badge>
												:	<Badge className="bg-zinc-100 text-zinc-700 border-none">
														Inactive
													</Badge>
												}
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
														<DropdownMenuItem
															onClick={() => handleDeleteItem(item.id)}
															className="text-red-600">
															<Trash2 className="size-3.5 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						}
					</div>
				</ScrollArea>
			</Card>
		</div>
	);
}
