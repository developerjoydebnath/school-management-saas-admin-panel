"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useItem } from "../hooks/use-item";

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

function DetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 3 }).map((_, index) => (
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

export function ItemDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Inventory");
	const { data: response, isLoading } = useItem(open ? id : null);
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
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("basicInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Item Name" value={data.name} />
								<Pair label="Item Code" value={data.code} />
								<Pair label="Category" value={data.category?.name || "-"} />
								<Pair label="Tracking Type" value={data.trackingType} />
								<Pair label="Unit" value={data.unit} />
								<Pair label="Brand" value={data.brand} />
								<Pair label="Model" value={data.model} />
								<Pair label="Material" value={data.material} />
								<Pair label="Status" value={data.isActive ? "Active" : "Inactive"} />
							</div>
						</section>

						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("measurementInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-3">
								<Pair label="Dimensions" value={data.length || data.width || data.height ? `${data.length || 0} x ${data.width || 0} x ${data.height || 0} ${data.dimensionUnit || ''}` : null} />
								<Pair label="Weight" value={data.weight ? `${data.weight} ${data.weightUnit || ''}` : null} />
								<Pair label="Seating Item" value={data.isSeatingItem} />
								{data.isSeatingItem && <Pair label="Seating Capacity" value={data.seatingCapacity} />}
							</div>
						</section>

						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("usageInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Depreciable" value={data.isDepreciable} />
								{data.isDepreciable && <Pair label="Depreciation Rate" value={`${data.depreciationRate}%`} />}
								<Pair label="Minimum Stock" value={data.minimumStock} />
								<Pair label="Current Stock" value={data.currentStock ?? data.quantityTotal} />
								<Pair label="Batches" value={data._count?.stockBatches} />
								<Pair label="Assets" value={data._count?.assets} />
								<Pair label="Movements" value={data._count?.movements} />
								<Pair
									label="Created Date"
									value={
										data.createdAt
											? new Date(data.createdAt).toLocaleDateString()
											: null
									}
								/>
							</div>
						</section>
					</div>
				)}
			</ScrollArea>
		</SheetContent>
	);
}
