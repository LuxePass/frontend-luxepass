import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransfers, type Transfer } from "../hooks/useTransfers";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { ShieldAlert, Loader2, PlusCircle, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "PENDING", label: "Pending" },
	{ value: "SUCCESS", label: "Success" },
	{ value: "FAILED", label: "Failed" },
] as const;

export function TransferRequests() {
	const navigate = useNavigate();
	const { transfers, getTransfers, loading } = useTransfers();
	const [statusFilter, setStatusFilter] = useState<string>("all");

	useEffect(() => {
		getTransfers();
	}, [getTransfers]);

	const filtered = useMemo(() => {
		if (statusFilter === "all") return transfers;
		return transfers.filter((t) => t.status === statusFilter);
	}, [transfers, statusFilter]);

	const statusBadge = (status: Transfer["status"]) => {
		const map = {
			PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700",
			SUCCESS: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300 dark:border-green-700",
			FAILED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300 dark:border-red-700",
		};
		return (
			<Badge variant="outline" className={map[status] || ""}>
				{status}
			</Badge>
		);
	};

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
								View and manage all transfer requests
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => getTransfers()}
							disabled={loading}>
							{loading ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<RefreshCw className="size-4" />
							)}
							<span className="ml-2">Refresh</span>
						</Button>
						<Button
							size="sm"
							className="bg-orange-600 hover:bg-orange-700"
							onClick={() => navigate("/transfer")}>
							<PlusCircle className="size-4 mr-2" />
							Transfer override
						</Button>
					</div>
				</div>
				<div className="flex flex-wrap gap-2 mt-4">
					{STATUS_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							onClick={() => setStatusFilter(opt.value)}
							className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
								statusFilter === opt.value
									? "bg-orange-600 text-white"
									: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
							}`}>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-3 lg:p-6">
					{loading && transfers.length === 0 ? (
						<div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
							<Loader2 className="size-5 animate-spin" />
							<span>Loading transfers…</span>
						</div>
					) : filtered.length === 0 ? (
						<Card className="p-8 text-center text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
							<ShieldAlert className="size-10 mx-auto mb-3 opacity-50" />
							<p className="font-medium">No transfer requests found</p>
							<p className="text-sm mt-1">
								{statusFilter !== "all"
									? `No ${statusFilter.toLowerCase()} transfers.`
									: "Submit an override from the Transfer override page."}
							</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => navigate("/transfer")}>
								Go to Transfer override
							</Button>
						</Card>
					) : (
						<div className="space-y-3">
							{filtered.map((t) => (
								<Card
									key={t.id}
									className="p-4 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2 mb-1">
												<span className="font-mono text-sm font-medium">
													{t.reference}
												</span>
												{statusBadge(t.status)}
											</div>
											<p className="text-sm text-zinc-600 dark:text-zinc-400">
												{t.narration || "—"}
											</p>
											<p className="text-xs text-zinc-500 mt-1">
												{new Date(t.createdAt).toLocaleString()}
												{t.userId ? ` · User: ${t.userId}` : ""}
											</p>
										</div>
										<div className="shrink-0 font-semibold">
											{t.currency} {parseFloat(t.amount).toLocaleString()}
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
