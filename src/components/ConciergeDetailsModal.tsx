import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

export interface ConciergeDetailsItem {
	id: string;
	name: string;
	description?: string;
	price?: string | number;
	currency?: string;
	category?: string;
	mediaUrl?: string | null;
}

interface ConciergeDetailsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: ConciergeDetailsItem | null;
}

export function ConciergeDetailsModal({
	open,
	onOpenChange,
	item,
}: ConciergeDetailsModalProps) {
	if (!item) return null;

	const price =
		item.price != null
			? `${item.price} ${item.currency ?? ""}`.trim()
			: null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
				<DialogHeader>
					<DialogTitle className="pr-8">{item.name}</DialogTitle>
				</DialogHeader>
				<ScrollArea className="flex-1 -mx-6 px-6">
					<div className="space-y-4 pb-4">
						{item.mediaUrl && (
							<img
								src={item.mediaUrl}
								alt={item.name}
								className="w-full aspect-video rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
							/>
						)}
						{(item.category || price) && (
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{item.category ?? ""}
								{item.category && price ? " · " : ""}
								{price ?? ""}
							</p>
						)}
						{!item.category && price && (
							<p className="text-sm font-medium">{price}</p>
						)}
						{item.description && (
							<p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
								{item.description}
							</p>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
