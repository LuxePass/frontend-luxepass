import { AdminProfile } from "./AdminProfile";

export function Settings() {
	return (
		<div className="h-full flex flex-col overflow-hidden font-sans bg-white dark:bg-zinc-900">
			<div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 md:px-6 shrink-0">
				<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
					Settings
				</h2>
			</div>

			<div className="flex-1 overflow-auto p-4 md:p-6 pb-safe">
				<div className="max-w-4xl mx-auto w-full">
					{/* Reusing AdminProfile content but as a flat page */}
					<AdminProfile variant="page" />
				</div>
			</div>
		</div>
	);
}
