"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Subject } from "@/shared/models/subject.model";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale, useTranslations } from "next-intl";

type Props = {
	subject: Subject;
};

const formatLabel = (value: string) =>
	value
		.replaceAll("_", " ")
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());

function InfoItem({ label, value }: { label: string; value?: string | number }) {
	return (
		<div>
			<p className="text-muted-foreground text-sm">{label}</p>
			<p className="font-medium">{value || "-"}</p>
		</div>
	);
}

export function SubjectDetails({ subject }: Props) {
	const t = useTranslations("Subjects");
	const locale = useLocale();

	return (
		<div className="space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("subjectDetails")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InfoItem label="Subject Name" value={getLocalizedName(subject.name, locale)} />
					<InfoItem label="Internal Code" value={subject.code} />
					<InfoItem label="Board Code" value={subject.boardCode} />
					<InfoItem label="Type" value={formatLabel(subject.type)} />
					<InfoItem label="Group" value={subject.group ? formatLabel(subject.group) : "-"} />
					<InfoItem label="Status" value={formatLabel(subject.status)} />
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("marks")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-5">
					<InfoItem label="Paper Count" value={subject.paperCount} />
					<InfoItem label="Mark Division" value={formatLabel(subject.markDivision)} />
					<InfoItem label="Full Marks" value={subject.fullMarks} />
					<InfoItem label="Pass Marks" value={subject.passMarks} />
					<InfoItem label="Written Marks" value={subject.writtenMarks || "-"} />
					<InfoItem label="Written Pass Marks" value={subject.writtenPassMarks || "-"} />
					<InfoItem label="MCQ Marks" value={subject.mcqMarks || "-"} />
					<InfoItem label="MCQ Pass Marks" value={subject.mcqPassMarks || "-"} />
					<InfoItem label="Practical Marks" value={subject.practicalMarks || "-"} />
					<InfoItem label="Practical Pass Marks" value={subject.practicalPassMarks || "-"} />
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("assignedClasses")}</CardTitle>
				</CardHeader>
				<CardContent>
					{subject.classes.length ? (
						<div className="flex flex-wrap gap-2">
							{subject.classes.map((item: any) => (
								<span key={item.id} className="rounded-md border px-3 py-1 text-sm">
									{item.enName || "-"}
								</span>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">-</p>
					)}
				</CardContent>
			</Card>

			{subject.description ? (
				<Card className="shadow-none ring-0">
					<CardHeader>
						<CardTitle>{t("descriptionTitle")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">{subject.description}</p>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
