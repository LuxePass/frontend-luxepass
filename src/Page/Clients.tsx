import { Users } from "lucide-react";

export function Clients() {
	return (
		<div className="flex-1 overflow-hidden flex items-center justify-center p-8">
			<div className="text-center">
				<Users className="size-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
				<h3 className="text-xl mb-2 text-zinc-600 dark:text-zinc-400">
					Select a Client
				</h3>
				<p className="text-sm text-zinc-500 dark:text-zinc-500">
					Choose a client from the sidebar to view their details
				</p>
			</div>
		</div>
	);
}
