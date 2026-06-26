"use client";

import SubjectForm from "@/modules/academics/subjects/components/SubjectForm";
import { SubjectFormValues } from "@/modules/academics/subjects/dto/subject.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum, SubjectMarkDivisionEnum, SubjectTypeEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues: SubjectFormValues = {
	enName: "",
	bnName: "",
	code: "",
	boardCode: "",
	type: SubjectTypeEnum.MANDATORY,
	group: "",
	paperCount: 1,
	fullMarks: 100,
	passMarks: 33,
	markDivision: SubjectMarkDivisionEnum.WRITTEN,
	writtenMarks: 100,
	writtenPassMarks: 33,
	mcqMarks: 0,
	mcqPassMarks: 0,
	practicalMarks: 0,
	practicalPassMarks: 0,
	theoryMarks: 0,
	sortOrder: 0,
	classIds: [],
	status: StatusEnum.ACTIVE,
	description: "",
};

export default function CreateSubjectPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_subjects"), href: PATHS.ACADEMICS.SUBJECTS.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Subjects" />
			<SubjectForm defaultValues={defaultValues} />
		</div>
	);
}
