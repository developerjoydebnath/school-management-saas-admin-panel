"use client";

import SubjectForm from "@/modules/academics/subjects/components/SubjectForm";
import { SubjectFormValues } from "@/modules/academics/subjects/dto/subject.dto";
import { useSubject } from "@/modules/academics/subjects/hooks/use-subject";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum, SubjectMarkDivisionEnum, SubjectTypeEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { data: subject, isLoading } = useSubject(id);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_subjects"), href: PATHS.ACADEMICS.SUBJECTS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) return null;

	const raw = subject?.original || {};
	const defaultValues: SubjectFormValues = {
		enName: raw.enName || "",
		bnName: raw.bnName || "",
		code: raw.code || "",
		boardCode: raw.boardCode || "",
		type: raw.type || SubjectTypeEnum.MANDATORY,
		group: raw.group || "",
		paperCount: raw.paperCount || 1,
		fullMarks: raw.fullMarks || 100,
		passMarks: raw.passMarks || 33,
		markDivision: raw.markDivision || SubjectMarkDivisionEnum.WRITTEN,
		writtenMarks: raw.writtenMarks || raw.theoryMarks || raw.fullMarks || 100,
		writtenPassMarks: raw.writtenPassMarks || raw.passMarks || 33,
		mcqMarks: raw.mcqMarks || 0,
		mcqPassMarks: raw.mcqPassMarks || 0,
		practicalMarks: raw.practicalMarks || 0,
		practicalPassMarks: raw.practicalPassMarks || 0,
		theoryMarks: raw.theoryMarks || 0,
		sortOrder: raw.sortOrder || 0,
		classIds: raw.classIds || [],
		status: raw.status || StatusEnum.ACTIVE,
		description: raw.description || "",
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Subjects" />
			<SubjectForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
