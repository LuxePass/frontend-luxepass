import { useState, useEffect } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";

export function AuditLogs() {
	const { getAuditLogs, logs, loading } = useAuditLogs();
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		getAuditLogs();
	}, [getAuditLogs]);

	const filteredLogs = logs.filter(
		(log) =>
			(log.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(log.entityType || "").toLowerCase().includes(searchQuery.toLowerCase())
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
								<th className="px-4 py-3 font-semibold">User</th>
								<th className="px-4 py-3 font-semibold">Action</th>
								<th className="px-4 py-3 font-semibold">Entity</th>
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
										className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
										<td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-500">
											{new Date(log.createdAt).toLocaleString()}
										</td>
										<td className="px-4 py-4 font-medium">{log.userName}</td>
										<td className="px-4 py-4">
											<Badge
												className={getActionColor(log.action)}
												variant="secondary">
												{log.action}
											</Badge>
										</td>
										<td className="px-4 py-4">
											<span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
												{log.entityType}
											</span>
										</td>
										<td className="px-4 py-4 max-w-xs">
											<p
												className="truncate text-xs text-zinc-500"
												title={JSON.stringify(log.newData)}>
												{JSON.stringify(log.newData)}
											</p>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}
