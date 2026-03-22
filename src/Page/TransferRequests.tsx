import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
	useTransfers,
	type PendingTransfer,
	type TransferDetail,
} from "../hooks/useTransfers";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { ShieldAlert, Loader2, RefreshCw, CheckCircle2, XCircle, Info } from "lucide-react";

function TransferRow({
	transfer,
	onDetails,
	onExecute,
	onReject,
	actionLoading,
}: {
	transfer: PendingTransfer;
	onDetails: () => void;
	onExecute: () => void;
	onReject: () => void;
	actionLoading: boolean;
}) {
	const expired =
		transfer.expiresAt && new Date(transfer.expiresAt) < new Date();
	const isPending = transfer.status === "PENDING";

	const getStatusBadge = () => {
		switch (transfer.status) {
			case "SUCCESS":
				return <Badge className="bg-green-100 text-green-800 border-green-200">Successful</Badge>;
			case "REJECTED":
				return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
			case "FAILED":
				return <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200">Failed</Badge>;
			default:
				return expired ? (
					<Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300">
						Expired
					</Badge>
				) : (
					<Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
				);
		}
	};

	return (
		<Card className="p-4 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2 mb-1">
						<span className="font-mono text-sm font-medium">{transfer.reference}</span>
						{getStatusBadge()}
					</div>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						{transfer.userName ?? transfer.userUniqueId ?? transfer.userId ?? "—"}
					</p>
					<p className="text-sm text-zinc-500 mt-0.5">
						{transfer.recipientBankName} · {transfer.recipientAccountNumber} · {transfer.recipientName}
					</p>
					<p className="text-xs text-zinc-500 mt-1">
						{transfer.narration || "—"} · Initiated{" "}
						{new Date(transfer.createdAt).toLocaleString()}
					</p>
				</div>
				<div className="shrink-0 font-semibold">
					{transfer.currency} {parseFloat(transfer.amount).toLocaleString()}
				</div>
				<div className="shrink-0 flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onDetails}>
						<Info className="size-4 mr-1" />
						Details
					</Button>
					{isPending && !expired && (
						<>
							<Button
								size="sm"
								className="bg-green-600 hover:bg-green-700"
								onClick={onExecute}
								disabled={actionLoading}>
								{actionLoading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<CheckCircle2 className="size-4 mr-1" />
								)}
								Execute
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={onReject}
								disabled={actionLoading}>
								<XCircle className="size-4 mr-1" />
								Reject
							</Button>
						</>
					)}
				</div>
			</div>
		</Card>
	);
}

export function TransferRequests() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const {
		pendingTransfers,
		pendingLoading,
		getPendingTransfers,
		getPaTransfers,
		executeEmergencyTransfer,
		rejectTransfer,
		getTransferById,
		transferDetail,
		transferDetailLoading,
	} = useTransfers();
	const [detailId, setDetailId] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [status, setStatus] = useState<string>("PENDING");

	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	useEffect(() => {
		if (status === "PENDING") {
			getPendingTransfers();
		} else {
			getPaTransfers({ status });
		}
	}, [status, getPendingTransfers, getPaTransfers]);

	useEffect(() => {
		if (detailId) getTransferById(detailId);
	}, [detailId, getTransferById]);

	const openDetail = (id: string) => setDetailId(id);
	const closeDetail = () => setDetailId(null);

	const handleExecute = async (id: string) => {
		setActionLoading(id);
		try {
			await executeEmergencyTransfer(id);
			closeDetail();
			if (status === "PENDING") getPendingTransfers();
			else getPaTransfers({ status });
		} finally {
			setActionLoading(null);
		}
	};

	const handleReject = async (id: string, reason?: string) => {
		setActionLoading(id);
		try {
			await rejectTransfer(id, reason);
			closeDetail();
			if (status === "PENDING") getPendingTransfers();
			else getPaTransfers({ status });
		} finally {
			setActionLoading(null);
		}
	};

	const statuses = [
		{ id: "PENDING", label: "Pending" },
		{ id: "SUCCESS", label: "Successful" },
		{ id: "REJECTED", label: "Rejected" },
		{ id: "FAILED", label: "Failed" },
	];

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			<div className="px-3 lg:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shrink-0">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-950/50">
							<ShieldAlert className="size-6 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<h1 className="text-lg font-semibold">Transfer Requests</h1>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{status === "PENDING" ? "Pending emergency transfers" : `${status.toLowerCase()} transfers`}
								{isSuperAdmin ? " (all)" : " assigned to you"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => status === "PENDING" ? getPendingTransfers() : getPaTransfers({ status })}
							disabled={pendingLoading}>
							{pendingLoading ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<RefreshCw className="size-4" />
							)}
							<span className="ml-2">Refresh</span>
						</Button>
						{isSuperAdmin && (
							<Button
								size="sm"
								className="bg-orange-600 hover:bg-orange-700"
								onClick={() => navigate("/transfer")}>
								Transfer override
							</Button>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar">
					{statuses.map((s) => (
						<button
							key={s.id}
							onClick={() => setStatus(s.id)}
							className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
								status === s.id
									? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
									: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
							}`}>
							{s.label}
						</button>
					))}
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-3 lg:p-6">
					{pendingLoading && pendingTransfers.length === 0 ? (
						<div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
							<Loader2 className="size-5 animate-spin" />
							<span>Loading transfers…</span>
						</div>
					) : pendingTransfers.length === 0 ? (
						<Card className="p-8 text-center text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
							<ShieldAlert className="size-10 mx-auto mb-3 opacity-50" />
							<p className="font-medium">No {status.toLowerCase()} transfers found</p>
							<p className="text-sm mt-1">
								Transfers matching this status {isSuperAdmin ? "" : "assigned to you"} will appear here.
							</p>
						</Card>
					) : (
						<div className="space-y-3">
							{pendingTransfers.map((t: PendingTransfer) => (
								<TransferRow
									key={t.id}
									transfer={t}
									onDetails={() => openDetail(t.id)}
									onExecute={() => handleExecute(t.id)}
									onReject={() => handleReject(t.id)}
									actionLoading={actionLoading === t.id}
								/>
							))}
						</div>
					)}
				</div>
			</ScrollArea>

			<TransferDetailModal
				open={!!detailId}
				onClose={closeDetail}
				transfer={transferDetail}
				loading={transferDetailLoading}
				onExecute={detailId ? () => handleExecute(detailId) : undefined}
				onReject={
					detailId ? (reason?: string) => handleReject(detailId, reason) : undefined
				}
				actionLoading={detailId ? actionLoading === detailId : false}
			/>
		</div>
	);
}


function TransferDetailModal({
	open,
	onClose,
	transfer,
	loading,
	onExecute,
	onReject,
	actionLoading,
}: {
	open: boolean;
	onClose: () => void;
	transfer: TransferDetail | null;
	loading: boolean;
	onExecute?: () => void;
	onReject?: (reason?: string) => void;
	actionLoading: boolean;
}) {
	const [rejectReason, setRejectReason] = useState("");
	const expired =
		transfer?.expiresAt && new Date(transfer.expiresAt) < new Date();
	const isPending = transfer?.status === "PENDING";

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Transfer details</DialogTitle>
				</DialogHeader>
				{loading ? (
					<div className="flex items-center justify-center py-8 gap-2 text-zinc-500">
						<Loader2 className="size-5 animate-spin" />
						<span>Loading…</span>
					</div>
				) : transfer ? (
					<div className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-zinc-500">Reference</span>
							<span className="font-mono">{transfer.reference}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-zinc-500">User</span>
							<span>
								{transfer.user?.name ?? transfer.user?.uniqueId ?? transfer.userId ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-zinc-500">Amount</span>
							<span className="font-semibold">
								{transfer.currency} {parseFloat(transfer.amount).toLocaleString()}
							</span>
						</div>
						{transfer.recipientBankName && (
							<div className="flex justify-between">
								<span className="text-zinc-500">Bank</span>
								<span>{transfer.recipientBankName}</span>
							</div>
						)}
						{transfer.recipientAccountNumber && (
							<div className="flex justify-between">
								<span className="text-zinc-500">Account</span>
								<span className="font-mono">{transfer.recipientAccountNumber}</span>
							</div>
						)}
						{transfer.recipientName && (
							<div className="flex justify-between">
								<span className="text-zinc-500">Recipient</span>
								<span>{transfer.recipientName}</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-zinc-500">Narration</span>
							<span>{transfer.narration || "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-zinc-500">Status</span>
							<Badge
								variant="outline"
								className={
									transfer.status === "SUCCESS"
										? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
										: transfer.status === "FAILED" || transfer.rejectedAt
										? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
										: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
								}>
								{transfer.status}
								{transfer.rejectedAt ? " (Rejected)" : ""}
							</Badge>
						</div>
						{transfer.expiresAt && (
							<div className="flex justify-between">
								<span className="text-zinc-500">Expires</span>
								<span>{new Date(transfer.expiresAt).toLocaleString()}</span>
							</div>
						)}
						{transfer.rejectedAt && (
							<>
								<div className="flex justify-between">
									<span className="text-zinc-500">Rejected at</span>
									<span>{new Date(transfer.rejectedAt).toLocaleString()}</span>
								</div>
								{transfer.rejectionReason && (
									<div>
										<span className="text-zinc-500">Reason</span>
										<p className="mt-1 text-zinc-800 dark:text-zinc-200">
											{transfer.rejectionReason}
										</p>
									</div>
								)}
							</>
						)}
						{isPending && !expired && (onExecute || onReject) && (
							<div className="pt-4 flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-700">
								{onReject && (
									<div>
										<label className="text-xs text-zinc-500">Rejection reason (optional)</label>
										<input
											type="text"
											value={rejectReason}
											onChange={(e) => setRejectReason(e.target.value)}
											className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm"
											placeholder="Reason for rejection"
										/>
									</div>
								)}
								<div className="flex gap-2">
									{onExecute && (
										<Button
											size="sm"
											className="bg-green-600 hover:bg-green-700"
											onClick={onExecute}
											disabled={actionLoading}>
											{actionLoading ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<CheckCircle2 className="size-4 mr-1" />
											)}
											Execute
										</Button>
									)}
									{onReject && (
										<Button
											variant="destructive"
											size="sm"
											onClick={() => onReject(rejectReason)}
											disabled={actionLoading}>
											<XCircle className="size-4 mr-1" />
											Reject
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				) : (
					<p className="text-sm text-zinc-500">Transfer not found.</p>
				)}
			</DialogContent>
		</Dialog>
	);
}
