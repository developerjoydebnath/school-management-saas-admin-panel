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
import { InventoryResource, useInventoryDetails } from "../hooks/use-inventory";

type Props = {
	id: string;
	resource: Exclude<InventoryResource, "audit-logs">;
	open: boolean;
};

type DetailSection = {
	title: string;
	pairs: [string, unknown][];
};

const formatValue = (value: unknown) => {
	if (value === null || value === undefined || value === "") return "-";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (value instanceof Date) return value.toLocaleDateString();
	if (typeof value === "object") return "-";
	return String(value);
};

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
			{Array.from({ length: 3 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="rounded-md border bg-muted/20 p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 6 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function InventoryDetailsSheet({ id, resource, open }: Props) {
	const t = useTranslations("Inventory");
	const { data: response, isLoading } = useInventoryDetails(resource, open ? id : null);
	const data = response?.data || response;

	const content = (() => {
		if (isLoading || !data) return <DetailsSkeleton />;

		const sectionsByResource: Record<Exclude<InventoryResource, "audit-logs">, DetailSection[]> = {
			categories: [
				{
					title: t("categoryInformation"),
					pairs: [
						["Name", data.name],
						["Bangla Name", data.nameBn],
						["Slug", data.slug],
						["Icon", data.iconName],
						["Color", data.colorCode],
						["Status", data.isActive ? "Active" : "Inactive"],
					],
				},
				{
					title: t("usageInformation"),
					pairs: [
						["System Category", data.isSystem],
						["Items", data._count?.items],
						["Created Date", data.createdAt ? new Date(data.createdAt).toLocaleDateString() : null],
					],
				},
			],
			items: [
				{
					title: t("itemInformation"),
					pairs: [
						["Name", data.name],
						["Code", data.code],
						["Category", data.category?.name],
						["Tracking Type", data.trackingType],
						["Unit", data.unit],
						["Status", data.isActive ? "Active" : "Inactive"],
					],
				},
				{
					title: t("measurementInformation"),
					pairs: [
						["Material", data.material],
						["Seating Capacity", data.seatingCapacity],
						["Length", data.length],
						["Width", data.width],
						["Height", data.height],
						["Dimension Unit", data.dimensionUnit],
						["Minimum Stock", data.minimumStock],
					],
				},
			],
			locations: [
				{
					title: t("locationInformation"),
					pairs: [
						["Name", data.name],
						["Code", data.code],
						["Type", data.locationType],
						["Status", data.status],
						["Class Room", data.classRoom?.name],
						["Room No", data.classRoom?.roomNo || data.roomNo],
						["Building", data.classRoom?.building || data.building],
						["Floor", data.classRoom?.floor || data.floor],
					],
				},
				{
					title: t("usageInformation"),
					pairs: [
						["Stock Batches", data._count?.stockBatches],
						["Assets", data._count?.assets],
						["Created Date", data.createdAt ? new Date(data.createdAt).toLocaleDateString() : null],
					],
				},
			],
			"stock-batches": [
				{
					title: t("stockInformation"),
					pairs: [
						["Item", data.item?.name],
						["Category", data.item?.category?.name],
						["Location", data.location?.name],
						["Total Quantity", data.quantityTotal],
						["Good Quantity", data.quantityGood],
						["Damaged Quantity", data.quantityDamaged],
						["Disposed Quantity", data.quantityDisposed],
					],
				},
				{
					title: t("purchaseInformation"),
					pairs: [
						["Purchase Date", data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString() : null],
						["Unit Price", data.purchasePrice],
						["Total Cost", data.totalCost],
						["Supplier", data.supplier],
						["Invoice No", data.invoiceNo],
						["Invoice Image", data.invoiceImageUrl ? "Uploaded" : "-"],
					],
				},
			],
			assets: [
				{
					title: t("assetInformation"),
					pairs: [
						["Asset Tag", data.assetTag],
						["Item", data.item?.name],
						["Serial No", data.serialNo],
						["MAC Address", data.macAddress],
						["Condition", data.condition],
						["Status", data.status],
						["Location", data.location?.name],
					],
				},
				{
					title: t("purchaseInformation"),
					pairs: [
						["Purchase Date", data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString() : null],
						["Purchase Price", data.purchasePrice],
						["Supplier", data.supplier],
						["Invoice No", data.invoiceNo],
						[
							"Assigned User",
							data.assignedToUser
								? `${data.assignedToUser.profile?.firstName || ""} ${data.assignedToUser.profile?.lastName || ""}`.trim() || data.assignedToUser.email || data.assignedToUser.phone
								: data.assignedName,
						],
					],
				},
			],
			movements: [
				{
					title: t("movementInformation"),
					pairs: [
						["Movement Type", data.movementType],
						["Item", data.item?.name],
						["Asset", data.asset?.assetTag],
						["Quantity", data.quantity],
						["From Location", data.fromLocation?.name],
						["To Location", data.toLocation?.name],
						["Reference No", data.referenceNo],
						["Created Date", data.createdAt ? new Date(data.createdAt).toLocaleDateString() : null],
					],
				},
			],
			maintenance: [
				{
					title: t("maintenanceInformation"),
					pairs: [
						["Issue Title", data.issueTitle],
						["Item", data.item?.name],
						["Asset", data.asset?.assetTag],
						["Location", data.location?.name],
						["Priority", data.priority],
						["Status", data.status],
						["Cost", data.cost],
						["Reported At", data.reportedAt ? new Date(data.reportedAt).toLocaleDateString() : null],
					],
				},
			],
		};
		const sections = sectionsByResource[resource] || [];

		return (
			<div className="space-y-4 p-4">
				{sections.map((section) => (
					<section key={section.title} className="rounded-md border bg-muted/20 p-4">
						<h3 className="text-sm font-normal">{section.title}</h3>
						<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
							{section.pairs.map(([label, value]) => (
								<Pair key={label} label={label} value={value} />
							))}
						</div>
					</section>
				))}
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base font-normal leading-6">{t("detailsTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
