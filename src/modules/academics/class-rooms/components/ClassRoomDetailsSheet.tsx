"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { useClassRoom } from "../hooks/use-class-room";

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

function ClassRoomDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 2 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="rounded-md border bg-muted/20 p-4">
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
	const { data: room, isLoading } = useClassRoom(open ? id : undefined);

	const content = (() => {
		if (isLoading || !room) {
			return <ClassRoomDetailsSkeleton />;
		}

	const status = room.status === StatusEnum.ACTIVE ? "Active" : "Inactive";

		return (
			<div className="space-y-4 p-4">
				<div className="rounded-md border bg-muted/20 p-4">
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

				<div className="rounded-md border bg-muted/20 p-4">
					<h3 className="text-sm font-normal">{t("furnitureFacilities")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="High Bench" value={room.highBench} />
						<CompactPair label="Low Bench" value={room.lowBench} />
						<CompactPair label="Chair" value={room.chair} />
						<CompactPair label="Table" value={room.table} />
						<CompactPair label="Board" value={room.board} />
						<CompactPair label="Total Benches" value={room.highBench + room.lowBench} />
					</div>
				</div>
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base font-normal leading-6">{t("detailsSheetTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsSheetDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				{content}
			</ScrollArea>
		</SheetContent>
	);
}
