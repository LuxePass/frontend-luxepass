import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { toast as sonnerToast } from "sonner";

interface ToastOptions {
	title: string;
	description?: string;
}

export const customToast = {
	success: (options: string | ToastOptions) => {
		const { title, description } =
			typeof options === "string"
				? { title: options, description: undefined }
				: options;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		sonnerToast.custom((t: any) => (
			<div className="bg-white dark:bg-zinc-900 border border-green-500 dark:border-green-900 rounded-lg p-4 shadow-lg min-w-[300px]">
				<div className="flex gap-3">
					<div className="size-8 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-900 flex items-center justify-center shrink-0">
						<CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
						{description && (
							<p className="text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
						)}
					</div>
					<button
						onClick={() => sonnerToast.dismiss(t)}
						className="size-6 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0">
						<X className="size-3 text-zinc-500 dark:text-zinc-400" />
					</button>
				</div>
			</div>
		));
	},

	error: (options: string | ToastOptions) => {
		const { title, description } =
			typeof options === "string"
				? { title: options, description: undefined }
				: options;

		sonnerToast.custom((t) => (
			<div className="bg-white dark:bg-zinc-900 border border-red-500 dark:border-red-900 rounded-lg p-4 shadow-lg min-w-[300px]">
				<div className="flex gap-3">
					<div className="size-8 rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900 flex items-center justify-center shrink-0">
						<AlertCircle className="size-4 text-red-600 dark:text-red-400" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
						{description && (
							<p className="text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
						)}
					</div>
					<button
						onClick={() => sonnerToast.dismiss(t)}
						className="size-6 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0">
						<X className="size-3 text-zinc-500 dark:text-zinc-400" />
					</button>
				</div>
			</div>
		));
	},

	info: (options: string | ToastOptions) => {
		const { title, description } =
			typeof options === "string"
				? { title: options, description: undefined }
				: options;

		sonnerToast.custom((t) => (
			<div className="bg-white dark:bg-zinc-900 border border-blue-500 dark:border-blue-900 rounded-lg p-4 shadow-lg min-w-[300px]">
				<div className="flex gap-3">
					<div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-900 flex items-center justify-center shrink-0">
						<Info className="size-4 text-blue-600 dark:text-blue-400" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
						{description && (
							<p className="text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
						)}
					</div>
					<button
						onClick={() => sonnerToast.dismiss(t)}
						className="size-6 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0">
						<X className="size-3 text-zinc-500 dark:text-zinc-400" />
					</button>
				</div>
			</div>
		));
	},

	warning: (options: string | ToastOptions) => {
		const { title, description } =
			typeof options === "string"
				? { title: options, description: undefined }
				: options;

		sonnerToast.custom((t) => (
			<div className="bg-white dark:bg-zinc-900 border border-orange-500 dark:border-orange-900 rounded-lg p-4 shadow-lg min-w-[300px]">
				<div className="flex gap-3">
					<div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-900 flex items-center justify-center shrink-0">
						<AlertCircle className="size-4 text-orange-600 dark:text-orange-400" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
						{description && (
							<p className="text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
						)}
					</div>
					<button
						onClick={() => sonnerToast.dismiss(t)}
						className="size-6 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0">
						<X className="size-3 text-zinc-500 dark:text-zinc-400" />
					</button>
				</div>
			</div>
		));
	},
};
