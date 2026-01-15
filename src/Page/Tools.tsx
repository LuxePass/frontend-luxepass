import { useNavigate } from "react-router-dom";
import {
	ListTodo,
	MessageCircle,
	ShieldAlert,
	Building2,
	Users,
} from "lucide-react";

export function Tools() {
	const navigate = useNavigate();

	return (
		<div className="flex-1 overflow-auto p-4">
			<h2 className="text-xl mb-4">Tools</h2>
			<div className="grid grid-cols-2 gap-3">
				<button
					onClick={() => navigate("/tasks")}
					className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
					<ListTodo className="size-8 text-violet-600 dark:text-violet-400" />
					<span className="text-sm">Tasks</span>
				</button>
				<button
					onClick={() => navigate("/livechat")}
					className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
					<MessageCircle className="size-8 text-green-600 dark:text-green-400" />
					<span className="text-sm">Live Chat</span>
				</button>
				<button
					onClick={() => navigate("/transfer")}
					className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
					<ShieldAlert className="size-8 text-orange-600 dark:text-orange-400" />
					<span className="text-sm">Transfer</span>
				</button>
				<button
					onClick={() => navigate("/listings")}
					className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
					<Building2 className="size-8 text-blue-600 dark:text-blue-400" />
					<span className="text-sm">Listings</span>
				</button>
				<button
					onClick={() => navigate("/referrals")}
					className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col items-center gap-2">
					<Users className="size-8 text-indigo-600 dark:text-indigo-400" />
					<span className="text-sm">Referrals</span>
				</button>
			</div>
		</div>
	);
}
