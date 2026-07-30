"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useClassRoom } from "../hooks/use-class-room";
import { useClassRoomAssignedInventory } from "../hooks/use-class-room-inventory";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { ItemDetailsContent } from "@/modules/inventory/items/components/ItemDetailsSheet";
import { cn } from "@/shared/lib/utils";

type Props = {
	id: string;
	open: boolean;
};

const formatValue = (value?: string | number | null) => value || "-";

function CompactPair({ label, value }: { label: string; value?: string | number | null }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<p className="mt-0.5 truncate text-sm leading-5">{formatValue(value)}</p>
		</div>
	);
}

function formatDate(value: unknown) {
	if (!value) return "-";
	return new Date(String(value)).toLocaleDateString();
}

function formatNumber(value: unknown) {
	const numericValue = Number(value || 0);
	return Number.isFinite(numericValue) ? numericValue.toLocaleString() : "0";
}

function locationName(location: any) {
	return location?.name || "-";
}

function ClassRoomDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 2 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-40" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 6 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-28" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function ClassRoomDetailsSheet({ id, open }: Props) {
	const t = useTranslations("ClassRooms");
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const { data: room, isLoading } = useClassRoom(open ? id : undefined);
	const {
		data: assignedInventory,
		meta: inventoryMeta,
		isLoading: isInventoryLoading,
	} = useClassRoomAssignedInventory(open ? id : null);

	const content = (() => {
		if (isLoading || !room) {
			return <ClassRoomDetailsSkeleton />;
		}

		const status = room.status === StatusEnum.ACTIVE ? "Active" : "Inactive";
		const inventorySummary = (inventoryMeta as any)?.summary;

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("roomInformation")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Room Name" value={room.name} />
						<CompactPair label="Room No" value={room.roomNo} />
						<CompactPair label="Capacity" value={room.capacity} />
						<CompactPair label="Status" value={status} />
						<CompactPair label="Building" value={room.building} />
						<CompactPair label="Floor" value={room.floor} />
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<div className="flex flex-col gap-2 @xl/body:flex-row @xl/body:items-center @xl/body:justify-between">
						<div>
							<h3 className="text-sm font-normal">{t("assignedInventory")}</h3>
							<p className="text-muted-foreground mt-1 text-xs">
								{t("assignedInventoryDescription")}
							</p>
						</div>
						<div className="text-muted-foreground text-xs">
							{formatNumber(assignedInventory?.length || 0)} {t("records")} -{" "}
							{formatNumber(inventorySummary?.quantity)} {t("items")}
						</div>
					</div>

					{isInventoryLoading ? (
						<div className="mt-4 space-y-3">
							{Array.from({ length: 4 }).map((_, itemIndex) => (
								<div
									key={itemIndex}
									className="grid gap-2 rounded-md border p-3 @xl/body:grid-cols-4"
								>
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-20" />
								</div>
							))}
						</div>
					) : assignedInventory?.length ? (
						<div className="mt-4 overflow-hidden rounded-md border">
							<div className="bg-muted/40 hidden grid-cols-[2fr_0.8fr_1fr_auto] gap-3 px-3 py-2 text-xs font-medium @xl/body:grid">
								<span>{t("item")}</span>
								<span>{t("quantity")}</span>
								<span>{t("createdDate")}</span>
								<span className="w-8"></span>
							</div>
							<div className="divide-y">
								{assignedInventory.map((item: any) => (
									<div
										key={item.id}
										className="grid gap-2 px-3 py-3 text-sm @xl/body:grid-cols-[2fr_0.8fr_1fr_auto] @xl/body:items-center group"
									>
										<div className="min-w-0">
											<p className="truncate font-medium">
												{item.item?.name || "-"}
											</p>
											<p className="text-muted-foreground truncate text-xs">
												{item.item?.code ||
													item.asset?.assetTag ||
													item.referenceNo ||
													"-"}
											</p>
										</div>
										<div>{formatNumber(item.quantity)}</div>
										<div className="text-muted-foreground">
											{formatDate(item.createdAt)}
										</div>
										<div className="flex justify-end">
											<Button
												variant="outline"
												size="icon-sm"
												onClick={() => setSelectedItemId(item.item?.id)}
												title="View Details"
											>
												<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="text-muted-foreground mt-4 rounded-md border border-dashed p-4 text-sm">
							{t("noAssignedInventory")}
						</div>
					)}
				</div>
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal flex items-center gap-2">
					{selectedItemId && (
						<Button
							variant="outline"
							size="icon-sm"
							className="-ml-1.5 shrink-0"
							onClick={() => setSelectedItemId(null)}
						>
							<ArrowLeft className="text-muted-foreground hover:text-foreground h-4 w-4" />
						</Button>
					)}
					{selectedItemId ? "Item Details" : t("detailsSheetTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">
					{selectedItemId ? "View complete details of this inventory item." : t("detailsSheetDescription")}
				</SheetDescription>
			</SheetHeader>
			<div className="relative h-[calc(100vh-73px)] overflow-hidden">
				<div className={cn("absolute inset-0 transition-transform duration-300 ease-in-out", selectedItemId ? "-translate-x-full" : "translate-x-0")}>
					<ScrollArea className="h-full">
						{content}
					</ScrollArea>
				</div>
				<div className={cn("absolute inset-0 transition-transform duration-300 ease-in-out bg-popover", selectedItemId ? "translate-x-0" : "translate-x-full")}>
					<ScrollArea className="h-full">
						{selectedItemId && <ItemDetailsContent id={selectedItemId} />}
					</ScrollArea>
				</div>
			</div>
		</SheetContent>
	);
}
