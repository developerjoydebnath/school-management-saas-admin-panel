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

const formatValue = (value?: string | number | null) => value ?? "-";

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function CompactChip({ children }: { children: React.ReactNode }) {
	return <span className="rounded-md border px-2 py-0.5 text-xs leading-5">{children}</span>;
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

		const sections = cls.sections || [];
		const hasSections = sections.length > 0;
		const status = cls.status === StatusEnum.ACTIVE ? "Active" : "Inactive";

		return (
			<div className="space-y-4 p-4">
				<div className="rounded-md border bg-muted/20 p-4">
					<h3 className="text-sm font-normal">{t("classInformation")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Class Name" value={getLocalizedName(cls.name, "en")} />
						<CompactPair label="Status" value={status} />
						<CompactPair label="Section Count" value={sections.length} />
						<CompactPair
							label="Capacity"
							value={
								hasSections
									? sections.reduce(
										(total, section: any) =>
											total + Number(section.classRoom?.capacity || 0),
										0
									)
									: cls.classRoom?.capacity || "-"
							}
						/>
					</div>
				</div>

				{hasSections ? (
					<div className="rounded-md border bg-muted/20 p-4">
						<h3 className="text-sm font-normal">{t("sectionAssignments")}</h3>
						<div className="mt-3 space-y-3">
							{sections.map((section: any) => {
								const room = section.classRoom;
								const shiftName =
									section.shift?.name ||
									(typeof section.shift === "string" ? section.shift : "-");

								return (
									<div
										key={section.id || section.name}
										className="rounded-md border bg-popover p-3"
									>
										<div className="mb-3 flex flex-wrap gap-1.5">
											<CompactChip>{section.name}</CompactChip>
											<CompactChip>{shiftName}</CompactChip>
										</div>
										<div className="grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
											<CompactPair label="Class Room" value={room?.name || room?.roomNo} />
											<CompactPair label="Room No" value={room?.roomNo} />
											<CompactPair label="Capacity" value={formatValue(room?.capacity)} />
											<CompactPair label="Building" value={room?.building} />
											<CompactPair label="Floor" value={room?.floor} />
										</div>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className="rounded-md border bg-muted/20 p-4">
						<h3 className="text-sm font-normal">{t("roomAndShift")}</h3>
						<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
							<CompactPair
								label="Class Room"
								value={cls.classRoom?.name || cls.classRoom?.roomNo}
							/>
							<CompactPair label="Room No" value={cls.classRoom?.roomNo} />
							<CompactPair label="Capacity" value={formatValue(cls.classRoom?.capacity)} />
							<CompactPair label="Building" value={cls.classRoom?.building} />
							<CompactPair label="Floor" value={cls.classRoom?.floor} />
							<CompactPair label="Shift" value={cls.shift} />
						</div>
					</div>
				)}
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
