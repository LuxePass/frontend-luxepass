import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUsers, type User } from "../hooks/useUsers";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Users, Search } from "lucide-react";

function getInitials(name: string) {
	if (!name) return "U";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

export function Clients() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { getClientsForNav } = useUsers();
	const [clients, setClients] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		setLoading(true);
		getClientsForNav({ limit: 100, search: search || undefined }, user?.role)
			.then((res) => {
				setClients(res?.data ?? []);
			})
			.catch(() => setClients([]))
			.finally(() => setLoading(false));
	}, [getClientsForNav, user?.role, search]);

	return (
		<div className="h-full flex flex-col space-y-4 px-4 lg:px-6 py-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Clients</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						{user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" ?
							"All clients"
						:	"Clients assigned to you"}
					</p>
				</div>
				<div className="relative w-full sm:w-64">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
					<Input
						placeholder="Search clients..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
					/>
				</div>
			</div>

			<Card className="flex-1 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none flex flex-col">
				{loading ?
					<div className="flex-1 flex items-center justify-center p-8">
						<div className="size-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
					</div>
				: clients.length === 0 ?
					<div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
						<Users className="size-16 mb-4 text-zinc-300 dark:text-zinc-700" />
						<h3 className="text-xl mb-2 text-zinc-600 dark:text-zinc-400">
							No clients found
						</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-500">
							{user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" ?
								"No users in the system yet."
							:	"No clients are assigned to you."}
						</p>
					</div>
				:	<div className="overflow-auto p-4">
						<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{clients.map((client) => (
								<button
									key={client.id}
									type="button"
									onClick={() => navigate(`/clients/${client.id}`)}
									className="flex items-center gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left w-full">
									<Avatar className="size-10 border border-zinc-200 dark:border-zinc-700 shrink-0">
										<AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-sm">
											{getInitials(client.name)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{client.name}</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
											{client.uniqueId}
										</p>
										<div className="flex items-center gap-1.5 mt-1">
											<Badge
												variant="secondary"
												className="text-[10px] font-normal">
												{client.tier}
											</Badge>
											<Badge
												variant="outline"
												className="text-[10px] font-normal border-zinc-300 dark:border-zinc-700">
												{client.status}
											</Badge>
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				}
			</Card>
		</div>
	);
}
