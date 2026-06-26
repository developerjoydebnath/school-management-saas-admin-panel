"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { ClassRoomModel } from "../models/class-room.model";

type Props = {
	room: ClassRoomModel;
};

const formatValue = (value?: string | number | null) => value || "-";

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

export function ClassRoomDetailsSheet({ room }: Props) {
	const t = useTranslations("ClassRooms");
	const status = room.status === StatusEnum.ACTIVE ? "Active" : "Inactive";

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base font-normal leading-6">{t("detailsSheetTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsSheetDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				<div className="space-y-4 p-4">
					<div className="rounded-md border p-4">
						<h3 className="text-sm font-normal">{t("roomInformation")}</h3>
						<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
							<CompactPair label="Room Name" value={room.name} />
							<CompactPair label="Room No" value={room.roomNo} />
							<CompactPair label="Capacity" value={formatValue(room.capacity)} />
							<CompactPair label="Status" value={status} />
							<CompactPair label="Building" value={room.building} />
							<CompactPair label="Floor" value={room.floor} />
						</div>
					</div>

					<div className="rounded-md border p-4">
						<h3 className="text-sm font-normal">{t("furnitureFacilities")}</h3>
						<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
							<CompactPair label="High Bench" value={formatValue(room.highBench)} />
							<CompactPair label="Low Bench" value={formatValue(room.lowBench)} />
							<CompactPair label="Chair" value={formatValue(room.chair)} />
							<CompactPair label="Table" value={formatValue(room.table)} />
							<CompactPair label="Board" value={formatValue(room.board)} />
							<CompactPair label="Total Benches" value={room.highBench + room.lowBench} />
						</div>
					</div>
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
