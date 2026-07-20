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
import { getLocalizedName } from "@/shared/utils/localization";
import { useTranslations } from "next-intl";
import { useClass } from "../hooks/use-class";

type Props = {
	id: string;
	open: boolean;
};

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function statusText(status?: string) {
	return status?.toUpperCase() === StatusEnum.INACTIVE ? "Inactive" : "Active";
}

function setupSectionName(item: any) {
	return item?.section?.name || item?.section?.bnName || "Class Group";
}

function setupRoomName(item: any) {
	if (!item?.room) return "-";
	return [item.room.roomNo, item.room.name].filter(Boolean).join(" - ") || "-";
}

function setupRoomBuilding(item: any) {
	return item?.room?.building || "-";
}

function setupRoomFloor(item: any) {
	return item?.room?.floor || "-";
}

function ClassDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 2 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="rounded-md border bg-muted/20 p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function ClassDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Classes");
	const { data: cls, isLoading } = useClass(open ? id : undefined);

	const content = (() => {
		if (isLoading || !cls) {
			return <ClassDetailsSkeleton />;
		}

		const sessionSetups = cls.original?.sessionSections || [];
		const status = statusText(cls.status);

		return (
			<div className="space-y-4 p-4">
				<div className="rounded-md border bg-muted/20 p-4">
					<h3 className="text-sm font-normal">{t("classInformation")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Class Name" value={getLocalizedName(cls.name, "en")} />
						<CompactPair label="Status" value={status} />
						<CompactPair label="Session Setup Count" value={sessionSetups.length} />
					</div>
				</div>

				<div className="rounded-md border bg-muted/20 p-4">
					<h3 className="text-sm font-normal">{t("sessionSetupNoteTitle")}</h3>
					{sessionSetups.length > 0 ? (
						<div className="mt-3 grid grid-cols-1 gap-3 @2xl/body:grid-cols-2">
							{sessionSetups.map((item: any) => (
								<div
									key={item.id}
									className="rounded-md border bg-background/45 p-3 transition-colors hover:bg-muted/20"
								>
									<div className="flex items-start justify-between gap-3 border-b pb-2">
										<div>
											<p className="text-muted-foreground text-[11px] leading-4">Section</p>
											<p className="text-sm leading-5">{setupSectionName(item)}</p>
										</div>
										<div className="rounded-full border px-2 py-0.5 text-xs">
											{statusText(item.status)}
										</div>
									</div>
									<div className="mt-3 grid grid-cols-1 gap-3 @lg/body:grid-cols-2">
										<CompactPair label="Capacity" value={item.capacity ?? "-"} />
										<CompactPair label="Shift" value={item.shift?.name || "-"} />
										<CompactPair label="Room" value={setupRoomName(item)} />
										<CompactPair label="Building" value={setupRoomBuilding(item)} />
										<CompactPair label="Floor" value={setupRoomFloor(item)} />
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground mt-2 text-sm leading-6">
							{t("sessionSetupNoteDescription")}
						</p>
					)}
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
