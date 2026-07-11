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
import { useMaintenance } from "../hooks/use-maintenance";

type Props = {
	id: string;
	open: boolean;
};

function formatValue(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}

function formatDate(value: unknown) {
	if (!value) return "-";
	return new Date(String(value)).toLocaleDateString();
}

function formatLocation(loc: any) {
	if (!loc) return "-";
	const room = loc.classRoom;
	if (room) {
		const parts = [room.name, room.roomNo, room.building].filter(Boolean);
		return parts.join(" · ") || loc.name;
	}
	return loc.name || "-";
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
			{Array.from({ length: 2 }).map((_, index) => (
				<section key={index} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 6 }).map((__, i) => (
							<div key={i} className="space-y-2">
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

export function MaintenanceDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Inventory");
	const { data: response, isLoading } = useMaintenance(open ? id : null);
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
							<h3 className="text-sm font-normal">{t("maintenanceInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Issue Title" value={data.issueTitle} />
								<Pair label="Issue Description" value={data.issueDescription} />
								<Pair label="Status" value={data.status?.replace("_", " ")} />
								<Pair label="Priority" value={data.priority} />
								<Pair label="Service Provider" value={data.serviceProvider} />
								<Pair label="Cost" value={data.cost !== null ? `$${data.cost}` : "-"} />
								<Pair label="Notes" value={data.notes} />
							</div>
						</section>
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("relatedRecords")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Item" value={data.item?.name} />
								<Pair label="Item Code" value={data.item?.code} />
								<Pair label="Location" value={formatLocation(data.location)} />
								{data.stockBatchId && (
									<Pair label="Stock Batch" value={data.stockBatchId} />
								)}
								{data.assetId && (
									<Pair label="Asset ID" value={data.assetId} />
								)}
							</div>
						</section>
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("usageInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Record ID" value={data.id} />
								<Pair
									label="Reported Date"
									value={data.reportedAt ? formatDate(data.reportedAt) : null}
								/>
								<Pair
									label="Resolved Date"
									value={data.resolvedAt ? formatDate(data.resolvedAt) : null}
								/>
							</div>
						</section>
					</div>
				)}
			</ScrollArea>
		</SheetContent>
	);
}
