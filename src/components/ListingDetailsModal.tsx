import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

export interface ListingDetailsItem {
	id: string;
	name: string;
	description?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	propertyType?: string;
	bedrooms?: number;
	bathrooms?: number;
	maxGuests?: number;
	amenities?: string[];
	pricePerNight?: string | number;
	currency?: string;
	media?: { id?: string; url: string }[];
}

interface ListingDetailsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listing: ListingDetailsItem | null;
}

export function ListingDetailsModal({
	open,
	onOpenChange,
	listing,
}: ListingDetailsModalProps) {
	if (!listing) return null;

	const mediaList = listing.media ?? [];
	const price =
		listing.pricePerNight != null
			? `${listing.pricePerNight} ${listing.currency ?? ""}`.trim()
			: null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
				<DialogHeader>
					<DialogTitle className="pr-8">{listing.name}</DialogTitle>
				</DialogHeader>
				<ScrollArea className="flex-1 -mx-6 px-6">
					<div className="space-y-4 pb-4">
						{mediaList.length > 0 && (
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
								{mediaList.map((m, i) => (
									<img
										key={m.id ?? i}
										src={m.url}
										alt={`${listing.name} ${i + 1}`}
										className="w-full aspect-[4/3] rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
									/>
								))}
							</div>
						)}
						{listing.propertyType && (
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{listing.propertyType}
								{listing.bedrooms != null
									? ` · ${listing.bedrooms} bed${listing.bedrooms !== 1 ? "s" : ""}`
									: ""}
								{listing.bathrooms != null
									? ` · ${listing.bathrooms} bath`
									: ""}
								{price ? ` · ${price}` : ""}
							</p>
						)}
						{!listing.propertyType && price && (
							<p className="text-sm font-medium">{price}</p>
						)}
						{(listing.address || listing.city) && (
							<p className="text-sm text-zinc-600 dark:text-zinc-300">
								{[listing.address, listing.city, listing.state, listing.country]
									.filter(Boolean)
									.join(", ")}
							</p>
						)}
						{listing.description && (
							<p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
								{listing.description}
							</p>
						)}
						{listing.amenities && listing.amenities.length > 0 && (
							<div>
								<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
									Amenities
								</p>
								<p className="text-sm text-zinc-600 dark:text-zinc-300">
									{listing.amenities.join(", ")}
								</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
