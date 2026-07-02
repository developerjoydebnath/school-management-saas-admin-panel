"use client";

import SyllabusForm from "@/modules/academics/syllabus/components/SyllabusForm";
import { SyllabusStatusEnum } from "@/modules/academics/syllabus/dto/syllabus.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CreateSyllabusPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_syllabus"), href: PATHS.ACADEMICS.SYLLABUS.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="CreateSyllabus" />
			<SyllabusForm
				defaultValues={{
					sessionId: "",
					examId: "",
					classId: "",
					sectionIds: [],
					title: "",
					status: SyllabusStatusEnum.DRAFT,
					subjects: [
						{
							subjectId: "",
							teacherId: "",
							chapters: [
								{
									chapterNo: 1,
									title: "",
									titleBn: "",
									pageRange: "",
									learningOutcome: "",
									weightPercent: 100,
									topics: [
										{
											title: "",
											titleBn: "",
											description: "",
											estimatedClasses: 1,
											weightPercent: 100,
											progressPercent: 0,
											isCompleted: false,
										},
									],
								},
							],
						},
					],
				}}
			/>
		</div>
	);
}
