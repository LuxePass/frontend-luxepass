import { useState, useEffect } from "react";
import { useBookings } from "../hooks/useBookings";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ScrollArea } from "../components/ui/scroll-area";
import {
	MoreHorizontal,
	CheckCircle2,
	XCircle,
	Clock,
	Search,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { customToast } from "./CustomToast";
import { useUsers } from "../hooks/useUsers";
import { useListings } from "../hooks/useListings";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import { Plus } from "lucide-react";
import api from "../services/api";

export function Bookings() {
	const { bookings, loading, getBookings, updateBookingStatus, confirmBooking } =
		useBookings();
	const { users, getAssignedUsers } = useUsers();
	const { listings, getListings } = useListings();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter] = useState("all");
	const [createOpen, setCreateOpen] = useState(false);
	const [newBooking, setNewBooking] = useState({
		userId: "",
		propertyId: "",
		checkIn: "",
		checkOut: "",
	});

	useEffect(() => {
		getBookings();
		getAssignedUsers();
		getListings();
	}, [getBookings, getAssignedUsers, getListings]);

	const handleCreateBooking = async () => {
		if (
			!newBooking.userId ||
			!newBooking.propertyId ||
			!newBooking.checkIn ||
			!newBooking.checkOut
		) {
			customToast.error("Please fill all fields");
			return;
		}

		try {
			// Simulate Payment first
			customToast.success("Payment Successful (Simulated)");

			// Create Booking using PA-specific endpoint that bypasses security verification
			await api.post("/bookings/pa-create", {
				...newBooking,
				type: "SHORTLET", // defaulting
			});
			customToast.success("Booking created successfully");
			setCreateOpen(false);
			getBookings();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			const msg = err.response?.data?.error?.message || "Failed to create booking";
			customToast.error(msg);
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			if (status === "CONFIRMED") {
				await confirmBooking(id);
			} else {
				await updateBookingStatus(id, status);
			}
			customToast.success(`Booking status updated to ${status}`);
			getBookings();
		} catch {
			customToast.error("Failed to update booking status");
		}
	};

	const filteredBookings = bookings.filter((booking) => {
		// Safe access to unknown property 'user' if it exists in response but not in interface,
		// or just filter by ID/Type/Amount
		const searchTarget =
			`${booking.id} ${booking.type} ${booking.totalAmount}`.toLowerCase();
		const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || booking.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "CONFIRMED":
			case "COMPLETED":
				return (
					<Badge className="bg-green-100 text-green-700 border-none">{status}</Badge>
				);
			case "CANCELLED":
				return (
					<Badge className="bg-red-100 text-red-700 border-none">{status}</Badge>
				);
			default:
				return (
					<Badge className="bg-orange-100 text-orange-700 border-none">
						{status}
					</Badge>
				);
		}
	};

	return (
		<div className="h-full flex flex-col space-y-4 px-4 lg:px-6 py-6">
			<Card className="flex-1 flex flex-col bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-none rounded-xl">
				<div className="p-4 lg:p-6 border-b border-zinc-200 dark:border-zinc-800">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-bold">Bookings Management</h3>
						<Dialog
							open={createOpen}
							onOpenChange={setCreateOpen}>
							<DialogTrigger asChild>
								<Button className="bg-violet-600 hover:bg-violet-700">
									<Plus className="size-4 mr-2" />
									Create Booking
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
								<DialogHeader>
									<DialogTitle>Create New Booking</DialogTitle>
									<DialogDescription>
										Select user and property to create a booking.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="user">User</Label>
										<Select
											value={newBooking.userId}
											onValueChange={(val) =>
												setNewBooking({ ...newBooking, userId: val })
											}>
											<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
												<SelectValue placeholder="Select User" />
											</SelectTrigger>
											<SelectContent className="max-h-[200px]">
												{users.map((u) => (
													<SelectItem
														key={u.id}
														value={u.id}>
														{u.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="property">Property</Label>
										<Select
											value={newBooking.propertyId}
											onValueChange={(val) =>
												setNewBooking({ ...newBooking, propertyId: val })
											}>
											<SelectTrigger className="bg-zinc-50 dark:bg-zinc-950">
												<SelectValue placeholder="Select Property" />
											</SelectTrigger>
											<SelectContent className="max-h-[200px]">
												{listings.map((l) => (
													<SelectItem
														key={l.id}
														value={l.id}>
														{l.name} - {l.pricePerNight} {l.currency}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label htmlFor="checkin">Check In</Label>
											<Input
												id="checkin"
												type="date"
												value={newBooking.checkIn}
												onChange={(e) =>
													setNewBooking({
														...newBooking,
														checkIn: e.target.value,
													})
												}
												className="bg-zinc-50 dark:bg-zinc-950"
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="checkout">Check Out</Label>
											<Input
												id="checkout"
												type="date"
												value={newBooking.checkOut}
												onChange={(e) =>
													setNewBooking({
														...newBooking,
														checkOut: e.target.value,
													})
												}
												className="bg-zinc-50 dark:bg-zinc-950"
											/>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button
										onClick={handleCreateBooking}
										className="bg-violet-600 hover:bg-violet-700 text-white w-full">
										Proceed to Payment & Book
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					<div className="flex gap-4 mb-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
							<Input
								placeholder="Search bookings..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-4">
						{loading ? (
							<div className="flex justify-center p-8">Loading...</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Date</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredBookings.map((booking) => (
										<TableRow key={booking.id}>
											<TableCell className="font-mono text-xs">
												{booking.id.substring(0, 8)}...
											</TableCell>
											<TableCell>{booking.type}</TableCell>
											<TableCell>
												{booking.currency}{" "}
												{parseFloat(booking.totalAmount).toLocaleString()}
											</TableCell>
											<TableCell>{getStatusBadge(booking.status)}</TableCell>
											<TableCell>
												{new Date(booking.createdAt).toLocaleDateString()}
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
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => handleStatusChange(booking.id, "CONFIRMED")}>
															<CheckCircle2 className="size-4 mr-2" /> Confirm
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleStatusChange(booking.id, "CANCELLED")}>
															<XCircle className="size-4 mr-2" /> Cancel
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleStatusChange(booking.id, "COMPLETED")}>
															<Clock className="size-4 mr-2" /> Complete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>
				</ScrollArea>
			</Card>
		</div>
	);
}
