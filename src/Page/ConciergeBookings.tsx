import { useState, useEffect } from "react";
import { useBookings, type Booking } from "../hooks/useBookings";
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
	ChevronsUpDown,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { customToast } from "./CustomToast";
import { useUsers } from "../hooks/useUsers";
import { Label } from "../components/ui/label";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../components/ui/command";

export function ConciergeBookings() {
	const {
		bookings,
		loading,
		getBookings,
		updateBookingStatus,
		confirmBooking,
		updateBookingInList,
	} = useBookings();
	const { users, getAssignedUsers } = useUsers();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter] = useState("all");
	const [selectedUserId, setSelectedUserId] = useState("");
	const [conciergeItems, setConciergeItems] = useState<
		{ id: string; name: string; price: string; currency: string }[]
	>([]);
	const [createOpen, setCreateOpen] = useState(false);
	const [newBookings, setNewBookings] = useState([
		{
			conciergeItemId: "",
			notes: "",
		},
	]);
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [userSearchQuery, setUserSearchQuery] = useState("");
	const [userPopoverOpen, setUserPopoverOpen] = useState(false);
	const [conciergePopoverOpenByIndex, setConciergePopoverOpenByIndex] = useState<
		Record<number, boolean>
	>({});
	const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState("");
	const [otpRequesting, setOtpRequesting] = useState(false);
	const [canRequestOtp, setCanRequestOtp] = useState(false);

	useEffect(() => {
		getBookings({ type: "CONCIERGE" });
		getAssignedUsers();

		// Fetch Concierge Items
		const fetchConciergeItems = async () => {
			try {
				const res = await api.get("/concierge");
				if (res.data?.success) {
					setConciergeItems(res.data.data.data || []);
				}
			} catch (e) {
				console.error(e);
			}
		};
		fetchConciergeItems();
	}, [getBookings, getAssignedUsers]);

	useEffect(() => {
		if (!createOpen) return;
		const t = setTimeout(() => {
			getAssignedUsers({ search: userSearchQuery || undefined, limit: 50 });
		}, 300);
		return () => clearTimeout(t);
	}, [createOpen, userSearchQuery, getAssignedUsers]);

	// Only allow OTP request when user is on live chat and assigned to current PA
	useEffect(() => {
		if (!selectedUserId) {
			setCanRequestOtp(false);
			return;
		}
		let cancelled = false;
		api
			.get("/pa-otp/can-request", { params: { userId: selectedUserId } })
			.then((res) => {
				if (!cancelled) {
					const allowed =
						res.data?.data?.allowed ?? res.data?.allowed ?? false;
					setCanRequestOtp(Boolean(allowed));
				}
			})
			.catch(() => {
				if (!cancelled) setCanRequestOtp(false);
			});
		return () => {
			cancelled = true;
		};
	}, [selectedUserId]);

	const handleAddBookingRow = () => {
		setNewBookings([...newBookings, { conciergeItemId: "", notes: "" }]);
	};

	const handleRemoveBookingRow = (index: number) => {
		const updated = [...newBookings];
		updated.splice(index, 1);
		setNewBookings(updated);
	};

	const handleUpdateBookingRow = (
		index: number,
		field: string,
		value: string,
	) => {
		const updated = [...newBookings];
		updated[index] = { ...updated[index], [field]: value };
		setNewBookings(updated);
	};

	const handleRequestOtp = async () => {
		if (!selectedUserId) {
			customToast.error("Please select a user first");
			return;
		}
		setOtpRequesting(true);
		try {
			const res = await api.post("/pa-otp/request", {
				userId: selectedUserId,
				action: "BOOKING_CREATE",
			});
			const expiresAt = res.data?.data?.expiresAt ?? res.data?.expiresAt;
			setOtpExpiresAt(expiresAt ?? null);
			customToast.success("OTP sent to client via WhatsApp. Ask them for the code.");
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { error?: { message?: string } } } })
					?.response?.data?.error?.message || "Failed to send OTP";
			customToast.error(msg);
		} finally {
			setOtpRequesting(false);
		}
	};

	const handleCreateBooking = async () => {
		if (!selectedUserId) {
			customToast.error("Please select a user");
			return;
		}
		if (!otpCode.trim()) {
			customToast.error("Please request an OTP and enter the code from the client");
			return;
		}

		// Validate all rows
		for (const booking of newBookings) {
			if (!booking.conciergeItemId) {
				customToast.error("Please select a concierge item for all rows");
				return;
			}
		}

		try {
			if (newBookings.length === 1) {
				const item = conciergeItems.find(
					(i) => i.id === newBookings[0].conciergeItemId,
				);
				const itemName = item ? item.name : newBookings[0].conciergeItemId;
				const amount = item ? Number(item.price) || 0 : 0;
				if (Number.isNaN(amount) || amount <= 0) {
					customToast.error("Selected concierge item has no valid price. Please fix the item in Concierge list.");
					return;
				}

				await api.post("/bookings/pa-create", {
					userId: selectedUserId,
					otpCode: otpCode.trim(),
					type: "CONCIERGE",
					totalAmount: amount,
					serviceFee: 0,
					specialRequests:
						`Concierge Item: ${itemName}. Notes: ${newBookings[0].notes}`.substring(
							0,
							950,
						),
				});
				customToast.success("Booking created successfully");
			} else {
				const mappedBookings = newBookings.map((b) => {
					const item = conciergeItems.find((i) => i.id === b.conciergeItemId);
					const itemName = item ? item.name : b.conciergeItemId;
					const amount = item ? Number(item.price) || 0 : 0;
					return {
						type: "CONCIERGE",
						totalAmount: amount,
						serviceFee: 0,
						specialRequests:
							`Concierge Item: ${itemName}. Notes: ${b.notes}`.substring(0, 950),
					};
				});
				const hasInvalidAmount = mappedBookings.some(
					(m) => Number.isNaN(Number(m.totalAmount)) || Number(m.totalAmount) <= 0,
				);
				if (hasInvalidAmount) {
					customToast.error("One or more concierge items have no valid price. Please fix in Concierge list.");
					return;
				}

				await api.post("/bookings/pa-create-bulk", {
					userId: selectedUserId,
					otpCode: otpCode.trim(),
					bookings: mappedBookings,
				});
				customToast.success(`Successfully created ${newBookings.length} bookings`);
			}

			setCreateOpen(false);
			await getBookings({ type: "CONCIERGE" });
			// Reset form
			setSelectedUserId("");
			setOtpCode("");
			setOtpExpiresAt(null);
			setNewBookings([{ conciergeItemId: "", notes: "" }]);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			const msg =
				err.response?.data?.error?.message || "Failed to create booking(s)";
			customToast.error(msg);
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			let updated;
			if (status === "CONFIRMED") {
				updated = await confirmBooking(id);
			} else {
				updated = await updateBookingStatus(id, status);
			}
			if (updated) {
				updateBookingInList(updated as Parameters<typeof updateBookingInList>[0]);
			}
			customToast.success(`Booking status updated to ${status}`);
			await getBookings();
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
						<h3 className="font-bold">Concierge Bookings</h3>
						<Dialog
							open={createOpen}
							onOpenChange={(open) => {
								setCreateOpen(open);
								if (!open) {
									setOtpCode("");
									setOtpExpiresAt(null);
								}
							}}>
							<DialogTrigger asChild>
								<Button className="bg-violet-600 hover:bg-violet-700">
									<Plus className="size-4 mr-2" />
									Create Booking
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[700px] max-w-[95vw] overflow-y-auto max-h-[90vh] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
								<DialogHeader>
									<DialogTitle>Create New Booking(s)</DialogTitle>
									<DialogDescription>
										Select user and add one or more concierge items to book for them.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label>Select User</Label>
										<Popover
											open={userPopoverOpen}
											onOpenChange={(open) => {
												setUserPopoverOpen(open);
												if (!open) setUserSearchQuery("");
											}}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={userPopoverOpen}
													className="w-full justify-between bg-zinc-50 dark:bg-zinc-950">
													{selectedUserId
														? users.find((u) => u.uniqueId === selectedUserId)?.name ||
															selectedUserId
														: "Search by Unique ID or name..."}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
												<Command>
													<CommandInput
														placeholder="Search by Unique ID or name..."
														value={userSearchQuery}
														onValueChange={setUserSearchQuery}
													/>
													<CommandList>
														<CommandEmpty>No user found.</CommandEmpty>
														<CommandGroup>
															{users.map((u) => (
																<CommandItem
																	key={u.uniqueId}
																	value={`${u.uniqueId} ${u.name}`}
																	onSelect={() => {
																		setSelectedUserId(u.uniqueId);
																		setUserPopoverOpen(false);
																	}}>
																	{u.name} ({u.uniqueId})
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</div>

									<div className="grid gap-2">
										<Label>OTP (required)</Label>
										<div className="flex gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={handleRequestOtp}
												disabled={!selectedUserId || otpRequesting || !canRequestOtp}
												className="shrink-0"
												title={!canRequestOtp && selectedUserId ? "User must be on live chat and assigned to you" : undefined}>
												{otpRequesting ? "Sending…" : "Send OTP to client"}
											</Button>
											{selectedUserId && !canRequestOtp && (
												<span className="text-xs text-amber-600 dark:text-amber-400">
													User must request live support first (on live chat, assigned to you).
												</span>
											)}
											<Input
												placeholder="Enter code from client"
												value={otpCode}
												onChange={(e) =>
													setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
												}
												className="max-w-[8rem] bg-zinc-50 dark:bg-zinc-950"
												maxLength={6}
											/>
										</div>
										{otpExpiresAt && (
											<p className="text-xs text-zinc-500">
												Code sent. Expires{" "}
												{new Date(otpExpiresAt).toLocaleTimeString()}.
											</p>
										)}
									</div>

									<div className="space-y-4 border rounded-xl p-4 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
										<div className="flex items-center justify-between">
											<Label className="text-base font-semibold">Bookings</Label>
											<Button
												variant="outline"
												size="sm"
												onClick={handleAddBookingRow}
												className="h-8 border-violet-200 hover:bg-violet-50 text-violet-600 dark:border-violet-900 dark:hover:bg-violet-900/20">
												<Plus className="size-3 mr-1" /> Add Another Item
											</Button>
										</div>

										{newBookings.map((booking, index) => (
											<div
												key={index}
												className="space-y-4 p-4 border rounded-lg bg-white dark:bg-zinc-950 relative">
												{newBookings.length > 1 && (
													<Button
														variant="ghost"
														size="icon"
														className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
														onClick={() => handleRemoveBookingRow(index)}>
														<XCircle className="size-4" />
													</Button>
												)}

												<div className="grid gap-2 pr-8">
													<Label>Concierge Item {index + 1}</Label>
													<Popover
														open={conciergePopoverOpenByIndex[index] ?? false}
														onOpenChange={(open) =>
															setConciergePopoverOpenByIndex((prev) => ({
																...prev,
																[index]: open,
															}))
														}>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																role="combobox"
																className="w-full justify-between bg-zinc-50 dark:bg-zinc-900">
																{booking.conciergeItemId
																	? (() => {
																			const item = conciergeItems.find(
																				(i) => i.id === booking.conciergeItemId,
																			);
																			return item
																				? `${item.name} — ${parseFloat(item.price).toLocaleString()} ${item.currency}`
																				: booking.conciergeItemId;
																		})()
																	: "Search concierge type or item..."}
																<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
															<Command>
																<CommandInput placeholder="Search by name or price..." />
																<CommandList>
																	<CommandEmpty>No item found.</CommandEmpty>
																	<CommandGroup>
																		{conciergeItems.map((item) => (
																			<CommandItem
																				key={item.id}
																				value={`${item.name} ${item.price} ${item.currency}`}
																				onSelect={() => {
																					handleUpdateBookingRow(index, "conciergeItemId", item.id);
																					setConciergePopoverOpenByIndex((prev) => ({
																						...prev,
																						[index]: false,
																					}));
																				}}>
																				{item.name} — {parseFloat(item.price).toLocaleString()}{" "}
																				{item.currency}
																			</CommandItem>
																		))}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
												</div>

												<div className="grid gap-2">
													<Label>Additional Notes (Optional)</Label>
													<Input
														placeholder="Optional requests for this item..."
														value={booking.notes}
														onChange={(e) =>
															handleUpdateBookingRow(index, "notes", e.target.value)
														}
														className="bg-zinc-50 dark:bg-zinc-900"
													/>
												</div>
											</div>
										))}
									</div>
								</div>
								<DialogFooter className="sticky bottom-0 bg-white dark:bg-zinc-900 pt-4 mt-2 mb-[-10px] pb-4">
									<Button
										onClick={handleCreateBooking}
										className="bg-violet-600 hover:bg-violet-700 text-white w-full">
										Proceed to Payment & Book{" "}
										{newBookings.length > 1 ? `(${newBookings.length} items)` : ""}
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
						{loading ?
							<div className="flex justify-center p-8">Loading...</div>
						:	<Table>
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
										<TableRow
											key={booking.id}
											className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
											onClick={() => setSelectedBooking(booking)}>
											<TableCell className="font-mono text-xs">
												{booking.id.substring(0, 8)}...
											</TableCell>
											<TableCell>{booking.type}</TableCell>
											<TableCell>
												{booking.currency}{" "}
												{Number(booking.totalAmount) != null &&
												!Number.isNaN(Number(booking.totalAmount))
													? Number(booking.totalAmount).toLocaleString()
													: "—"}
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
													<DropdownMenuContent
														align="end"
														onClick={(e) => e.stopPropagation()}>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																handleStatusChange(booking.id, "CONFIRMED");
															}}>
															<CheckCircle2 className="size-4 mr-2" /> Confirm
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																handleStatusChange(booking.id, "CANCELLED");
															}}>
															<XCircle className="size-4 mr-2" /> Cancel
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																handleStatusChange(booking.id, "COMPLETED");
															}}>
															<Clock className="size-4 mr-2" /> Complete
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

			{/* Booking Details Modal */}
			<Dialog
				open={!!selectedBooking}
				onOpenChange={(open) => !open && setSelectedBooking(null)}>
				<DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<DialogHeader>
						<DialogTitle>Booking Details</DialogTitle>
						<DialogDescription>
							Detailed information about this booking.
						</DialogDescription>
					</DialogHeader>
					{selectedBooking && (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-semibold text-zinc-500 mb-1">
										Booking ID
									</h4>
									<p className="font-mono text-sm">{selectedBooking.id}</p>
								</div>
								<div>
									<h4 className="text-sm font-semibold text-zinc-500 mb-1">Status</h4>
									{getStatusBadge(selectedBooking.status)}
								</div>
								<div>
									<h4 className="text-sm font-semibold text-zinc-500 mb-1">Type</h4>
									<p className="text-sm font-medium">{selectedBooking.type}</p>
								</div>
								<div>
									<h4 className="text-sm font-semibold text-zinc-500 mb-1">
										Total Amount
									</h4>
									<p className="text-sm font-medium">
										{selectedBooking.currency}{" "}
										{Number(selectedBooking.totalAmount) != null &&
										!Number.isNaN(Number(selectedBooking.totalAmount))
											? Number(selectedBooking.totalAmount).toLocaleString()
											: "—"}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-semibold text-zinc-500 mb-1">
										Created At
									</h4>
									<p className="text-sm">
										{new Date(selectedBooking.createdAt).toLocaleString()}
									</p>
								</div>
								{selectedBooking.checkIn && (
									<div>
										<h4 className="text-sm font-semibold text-zinc-500 mb-1">Check In</h4>
										<p className="text-sm">
											{new Date(selectedBooking.checkIn).toLocaleDateString()}
										</p>
									</div>
								)}
								{selectedBooking.checkOut && (
									<div>
										<h4 className="text-sm font-semibold text-zinc-500 mb-1">
											Check Out
										</h4>
										<p className="text-sm">
											{new Date(selectedBooking.checkOut).toLocaleDateString()}
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
