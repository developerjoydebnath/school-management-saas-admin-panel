"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Subject } from "@/shared/models/subject.model";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale, useTranslations } from "next-intl";

type Props = {
	subject: Subject;
};

const formatLabel = (value?: string) =>
	(value || "-")
		.replaceAll("_", " ")
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());

const classNames = (subject: Subject) =>
	subject.classes.map((item: any) => item.enName || "-").filter(Boolean);

function CompactPair({ label, value }: { label: string; value?: string | number }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<p className="mt-0.5 truncate text-sm leading-5">{value || "-"}</p>
		</div>
	);
}

function CompactClassChips({ subject }: Props) {
	const names = classNames(subject);

	return (
		<div className="flex flex-wrap gap-1.5">
			{names.length ? (
				names.map((name) => (
					<span key={name} className="rounded-md border px-2 py-0.5 text-xs leading-5">
						{name}
					</span>
				))
			) : (
				<span className="text-muted-foreground text-sm">-</span>
			)}
		</div>
	);
}

function CompactMarkRows({ subject }: Props) {
	const rows = [
		["Written", subject.writtenMarks, subject.writtenPassMarks],
		["MCQ", subject.mcqMarks || "-", subject.mcqPassMarks || "-"],
		["Practical", subject.practicalMarks || "-", subject.practicalPassMarks || "-"],
	];

	return (
		<div className="overflow-hidden rounded-md border">
			<div className="grid grid-cols-3 bg-muted/40 px-3 py-2 text-xs">
				<span>Division</span>
				<span>Marks</span>
				<span>Pass Marks</span>
			</div>
			{rows.map(([label, marks, pass]) => (
				<div key={label} className="grid grid-cols-3 border-t px-3 py-2 text-xs leading-5">
					<span>{label}</span>
					<span>{marks}</span>
					<span>{pass}</span>
				</div>
			))}
		</div>
	);
}

export function SubjectDetailsSheet({ subject }: Props) {
	const locale = useLocale();
	const t = useTranslations("Subjects");

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base font-normal leading-6">{t("detailsSheetTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsSheetDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				<div className="space-y-4 p-4">
					<div className="rounded-md border p-4">
						<h3 className="text-sm font-normal">{t("subjectInformation")}</h3>
						<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
							<CompactPair label="Subject Name" value={getLocalizedName(subject.name, locale)} />
							<CompactPair label="Status" value={formatLabel(subject.status)} />
							<CompactPair label="Full / Pass" value={`${subject.fullMarks} / ${subject.passMarks}`} />
							<CompactPair label="Classes" value={subject.classes.length} />
							<CompactPair label="Internal Code" value={subject.code} />
							<CompactPair label="Board Code" value={subject.boardCode} />
							<CompactPair label="Type" value={formatLabel(subject.type)} />
							<CompactPair label="Group" value={formatLabel(subject.group)} />
						</div>
					</div>
					<div className="rounded-md border p-4">
						<h3 className="text-sm font-normal">{t("markDivisions")}</h3>
						<div className="mt-3">
							<CompactMarkRows subject={subject} />
						</div>
					</div>
					<div className="rounded-md border p-4">
						<h3 className="text-sm font-normal">{t("assignedClasses")}</h3>
						<div className="mt-3">
							<CompactClassChips subject={subject} />
						</div>
					</div>
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
