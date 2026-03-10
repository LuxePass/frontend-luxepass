import { useState, useEffect, useCallback } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const ACTOR_TYPES = ["USER", "PA", "SYSTEM"];
const RESOURCE_TYPES = ["property", "booking", "transfer", "user", "audit"];

export function AuditLogs() {
	const { getAuditLogs, logs, meta, loading } = useAuditLogs();
	const [actionFilter, setActionFilter] = useState("");
	const [actorTypeFilter, setActorTypeFilter] = useState<string>("all");
	const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
	const [page, setPage] = useState(1);
	const limit = 20;

	const fetchLogs = useCallback(() => {
		const params: Record<string, number | string> = { page, limit };
		if (actionFilter.trim()) params.action = actionFilter.trim();
		if (actorTypeFilter !== "all") params.actorType = actorTypeFilter;
		if (resourceTypeFilter !== "all") params.resourceType = resourceTypeFilter;
		getAuditLogs(params);
	}, [getAuditLogs, page, limit, actionFilter, actorTypeFilter, resourceTypeFilter]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const getActionColor = (action: string) => {
		const a = action.toUpperCase();
		if (a.includes("CREATE") || a.includes("CREATED")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
		if (a.includes("UPDATE") || a.includes("CONFIRM")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
		if (a.includes("DELETE") || a.includes("CANCEL")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
		return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
	};

	const formatActor = (log: { actorType: string; actorId?: string }) => {
		const t = log.actorType || "SYSTEM";
		return log.actorId ? `${t} (${log.actorId.slice(0, 8)}…)` : t;
	};

	const totalPages = meta?.totalPages ?? 1;
	const hasPrev = (meta?.hasPreviousPage ?? false) || page > 1;
	const hasNext = (meta?.hasNextPage ?? false) || page < totalPages;

	return (
		<div className="h-full flex flex-col space-y-4 px-4 lg:px-6 py-6">
			<div className="flex flex-col gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Track system activities and changes
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative flex-1 min-w-[200px] max-w-xs">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
						<Input
							placeholder="Filter by action..."
							value={actionFilter}
							onChange={(e) => setActionFilter(e.target.value)}
							className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
						/>
					</div>
					<Select value={actorTypeFilter} onValueChange={setActorTypeFilter}>
						<SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900">
							<SelectValue placeholder="Actor" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All actors</SelectItem>
							{ACTOR_TYPES.map((t) => (
								<SelectItem key={t} value={t}>{t}</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
						<SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900">
							<SelectValue placeholder="Resource" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All resources</SelectItem>
							{RESOURCE_TYPES.map((t) => (
								<SelectItem key={t} value={t}>{t}</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button variant="outline" size="sm" onClick={() => fetchLogs()}>Apply</Button>
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
								<th className="px-4 py-3 font-semibold">Affected resource</th>
								<th className="px-4 py-3 font-semibold">Status</th>
								<th className="px-4 py-3 font-semibold">Details</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
							{loading && logs.length === 0 ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={6} className="px-4 py-4">
											<div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
										</td>
									</tr>
								))
							) : logs.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
										No audit logs found
									</td>
								</tr>
							) : (
								logs.map((log) => (
									<tr
										key={log.id}
										className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
									>
										<td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-500">
											{new Date(log.createdAt).toLocaleString()}
										</td>
										<td className="px-4 py-4 font-medium">{formatActor(log)}</td>
										<td className="px-4 py-4">
											<Badge className={getActionColor(log.action)} variant="secondary">
												{log.action}
											</Badge>
										</td>
										<td className="px-4 py-4">
											<span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
												{log.resourceType}{log.resourceId ? ` · ${log.resourceId.slice(0, 8)}…` : ""}
											</span>
										</td>
										<td className="px-4 py-4">
											<Badge variant="outline" className="text-green-600 dark:text-green-400">
												{log.status || "success"}
											</Badge>
										</td>
										<td className="px-4 py-4 max-w-xs">
											<p
												className="truncate text-xs text-zinc-500"
												title={JSON.stringify(log.newValue ?? log.oldValue)}
											>
												{JSON.stringify(log.newValue ?? log.oldValue ?? {})}
											</p>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{meta && (meta.totalItems > 0 || totalPages > 1) && (
					<div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
						<p className="text-xs text-zinc-500">
							Page {meta.page} of {totalPages} · {meta.totalItems} total
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={!hasPrev || loading}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							>
								<ChevronLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={!hasNext || loading}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							>
								<ChevronRight className="size-4" />
							</Button>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
