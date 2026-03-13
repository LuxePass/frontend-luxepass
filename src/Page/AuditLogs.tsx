import { useState, useEffect } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import type { AuditLog } from "../hooks/useAuditLogs";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { Search } from "lucide-react";

export function AuditLogs() {
	const { getAuditLogs, getAuditLogById, logs, loading } = useAuditLogs();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
	const [detailLog, setDetailLog] = useState<AuditLog | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	useEffect(() => {
		if (!selectedLogId) {
			setDetailLog(null);
			return;
		}
		setDetailLoading(true);
		getAuditLogById(selectedLogId)
			.then(setDetailLog)
			.finally(() => setDetailLoading(false));
	}, [selectedLogId, getAuditLogById]);

	useEffect(() => {
		getAuditLogs();
	}, [getAuditLogs]);

	const filteredLogs = logs.filter(
		(log) =>
			(log.actorDisplayName || log.actorId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(log.resourceType || "").toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getActionColor = (action: string) => {
		switch (action.toUpperCase()) {
			case "CREATE":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			case "UPDATE":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
			case "DELETE":
				return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
			default:
				return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
		}
	};

	return (
		<div className="h-full flex flex-col space-y-4 px-4 lg:px-6 py-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Track system activities and changes
					</p>
				</div>
				<div className="relative w-full sm:w-64">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
					<Input
						placeholder="Search logs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
					/>
				</div>
			</div>

			<Card className="flex-1 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none flex flex-col">
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left">
						<thead className="text-xs uppercase bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
							<tr>
								<th className="px-4 py-3 font-semibold">Timestamp</th>
								<th className="px-4 py-3 font-semibold">Actor</th>
								<th className="px-4 py-3 font-semibold">Action</th>
								<th className="px-4 py-3 font-semibold">Target</th>
								<th className="px-4 py-3 font-semibold">Details</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
							{loading && filteredLogs.length === 0 ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr
										key={i}
										className="animate-pulse">
										<td
											colSpan={5}
											className="px-4 py-4">
											<div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
										</td>
									</tr>
								))
							) : filteredLogs.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="px-4 py-8 text-center text-zinc-500 italic">
										No audit logs found
									</td>
								</tr>
							) : (
								filteredLogs.map((log) => (
									<tr
										key={log.id}
										role="button"
										tabIndex={0}
										onClick={() => setSelectedLogId(log.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setSelectedLogId(log.id);
											}
										}}
										className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
										<td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-500">
											{new Date(log.createdAt).toLocaleString()}
										</td>
										<td className="px-4 py-4 font-medium">
											{log.actorDisplayName || log.actorId || "—"}
										</td>
										<td className="px-4 py-4">
											<Badge
												className={getActionColor(log.action)}
												variant="secondary">
												{log.action}
											</Badge>
										</td>
										<td className="px-4 py-4">
											<span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
												{log.resourceType}
												{log.resourceId ? ` · ${log.resourceId}` : ""}
											</span>
										</td>
										<td className="px-4 py-4 max-w-xs">
											<p
												className="truncate text-xs text-zinc-500"
												title={log.newValue ? JSON.stringify(log.newValue) : undefined}>
												{log.newValue ? JSON.stringify(log.newValue) : "—"}
											</p>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>

			<Dialog
				open={!!selectedLogId}
				onOpenChange={(open) => !open && setSelectedLogId(null)}>
				<DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
					<DialogHeader>
						<DialogTitle>Audit Log Details</DialogTitle>
					</DialogHeader>
					{detailLoading ? (
						<div className="py-8 flex justify-center">
							<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
						</div>
					) : detailLog ? (
						<div className="space-y-3 text-sm overflow-y-auto">
							<div>
								<span className="text-zinc-500 dark:text-zinc-400 font-medium">ID</span>
								<p className="font-mono text-xs mt-0.5 break-all">{detailLog.id}</p>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Actor type</span>
									<p className="mt-0.5">{detailLog.actorType}</p>
								</div>
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Actor ID</span>
									<p className="font-mono text-xs mt-0.5 break-all">{detailLog.actorId ?? "—"}</p>
								</div>
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Actor</span>
									<p className="mt-0.5">{detailLog.actorDisplayName ?? "—"}</p>
								</div>
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Action</span>
									<p className="mt-0.5">
										<Badge className={getActionColor(detailLog.action)} variant="secondary">
											{detailLog.action}
										</Badge>
									</p>
								</div>
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Resource type</span>
									<p className="mt-0.5">{detailLog.resourceType}</p>
								</div>
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Resource ID</span>
									<p className="font-mono text-xs mt-0.5 break-all">{detailLog.resourceId ?? "—"}</p>
								</div>
							</div>
							<div>
								<span className="text-zinc-500 dark:text-zinc-400 font-medium">Created at</span>
								<p className="mt-0.5">{new Date(detailLog.createdAt).toLocaleString()}</p>
							</div>
							{detailLog.ipAddress && (
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">IP address</span>
									<p className="font-mono text-xs mt-0.5">{detailLog.ipAddress}</p>
								</div>
							)}
							{detailLog.userAgent && (
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">User agent</span>
									<p className="text-xs mt-0.5 break-all">{detailLog.userAgent}</p>
								</div>
							)}
							{detailLog.oldValue != null && (
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Old value</span>
									<pre className="mt-0.5 p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-xs overflow-x-auto max-h-32 overflow-y-auto">
										{JSON.stringify(detailLog.oldValue, null, 2)}
									</pre>
								</div>
							)}
							{detailLog.newValue != null && (
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">New value</span>
									<pre className="mt-0.5 p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-xs overflow-x-auto max-h-32 overflow-y-auto">
										{JSON.stringify(detailLog.newValue, null, 2)}
									</pre>
								</div>
							)}
							{detailLog.metadata != null && Object.keys(detailLog.metadata).length > 0 && (
								<div>
									<span className="text-zinc-500 dark:text-zinc-400 font-medium">Metadata</span>
									<pre className="mt-0.5 p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-xs overflow-x-auto max-h-32 overflow-y-auto">
										{JSON.stringify(detailLog.metadata, null, 2)}
									</pre>
								</div>
							)}
						</div>
					) : selectedLogId ? (
						<p className="text-sm text-zinc-500 py-4">Failed to load log details.</p>
					) : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}
