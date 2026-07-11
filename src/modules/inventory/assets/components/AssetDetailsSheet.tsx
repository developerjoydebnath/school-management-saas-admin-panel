"use client";

import { ZoomableImage } from "@/shared/components/media/ZoomableImage";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useAsset } from "../hooks/use-asset";

type Props = {
	id: string;
	open: boolean;
};

function formatValue(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}

function Pair({ label, value }: { label: string; value: unknown }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<p className="mt-0.5 truncate text-sm leading-5">{formatValue(value)}</p>
		</div>
	);
}

function getMediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("data:")) return url;
	return url;
}

function DetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 4 }).map((_, index) => (
				<section key={index} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

export function AssetDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Inventory");
	const { data: response, isLoading } = useAsset(open ? id : null);
	const data = response?.data || response;

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				{isLoading || !data ? (
					<DetailsSkeleton />
				) : (
					<div className="space-y-4 p-4">
						{data.imageUrl ? (
							<div className="space-y-1">
								<p className="text-muted-foreground text-[11px] leading-4">
									Asset Image
								</p>
								<ZoomableImage
									src={getMediaUrl(data.imageUrl)}
									placeholderBase64={data.imagePlaceholder}
									alt="Asset image"
									className="w-full aspect-video rounded-md border bg-background"
									imageClassName="object-contain"
								/>
							</div>
						) : null}
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("assetInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Asset Tag" value={data.assetTag} />
								<Pair label="Serial Number" value={data.serialNo} />
								<Pair label="MAC Address" value={data.macAddress} />
								<Pair label="Status" value={data.status} />
								<Pair label="Condition" value={data.condition} />
								<Pair label="Item Name" value={data.item?.name} />
								<Pair label="Location Name" value={data.location?.name} />
								<Pair label="Assigned User" value={data.assignedName || data.assignedToUser?.email || "-"} />
							</div>
						</section>
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("purchaseInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair
									label="Purchase Date"
									value={data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString() : null}
								/>
								<Pair label="Purchase Price" value={data.purchasePrice} />
								<Pair label="Supplier" value={data.supplier} />
								<Pair label="Invoice Number" value={data.invoiceNo} />
							</div>
						</section>
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("warrantyInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Has Warranty" value={data.hasWarranty} />
								<Pair label="Warranty Period" value={data.warrantyPeriod ? `${data.warrantyPeriod} ${data.warrantyPeriodUnit}` : null} />
								<Pair
									label="Warranty Expires"
									value={data.warrantyExpires ? new Date(data.warrantyExpires).toLocaleDateString() : null}
								/>
							</div>
						</section>
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("otherInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Notes" value={data.notes} />
								<Pair
									label="Created Date"
									value={data.createdAt ? new Date(data.createdAt).toLocaleDateString() : null}
								/>
								<Pair
									label="Updated Date"
									value={data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : null}
								/>
							</div>
						</section>
					</div>
				)}
			</ScrollArea>
		</SheetContent>
	);
}
