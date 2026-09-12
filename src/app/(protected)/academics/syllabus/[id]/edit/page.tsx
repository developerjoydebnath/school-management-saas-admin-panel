"use client";

import SyllabusForm from "@/modules/academics/syllabus/components/SyllabusForm";
import {
	SyllabusModeEnum,
	SyllabusStatusEnum,
} from "@/modules/academics/syllabus/dto/syllabus.dto";
import { useSyllabus } from "@/modules/academics/syllabus/hooks/use-syllabus";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditSyllabusPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data, isLoading } = useSyllabus(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_syllabus"), href: PATHS.ACADEMICS.SYLLABUS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading || !data) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="EditSyllabus" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EditSyllabus" />
			<SyllabusForm
				id={id}
				isEdit
				defaultValues={{
					sessionId: data.sessionId || "",
					examId: data.examId || "",
					classId: data.classId || "",
					sectionIds: data.sectionId ? [data.sectionId] : [],
					title: data.title || "",
					status: data.status || SyllabusStatusEnum.DRAFT,
					mode: data.mode || SyllabusModeEnum.STRUCTURED,
					content: data.content || "",
					subjects: (data.subjects || []).map((subject: any) => ({
						subjectId: subject.subjectId || "",
						teacherId: subject.teacherId || "",
						chapters: (subject.chapters || []).map((chapter: any) => ({
							chapterNo: chapter.chapterNo || 1,
							title: chapter.title || "",
							titleBn: chapter.titleBn || "",
							pageRange: chapter.pageRange || "",
							learningOutcome: chapter.learningOutcome || "",
							weightPercent: Number(chapter.weightPercent || 100),
							topics: (chapter.topics || []).map((topic: any) => ({
								title: topic.title || "",
								titleBn: topic.titleBn || "",
								description: topic.description || "",
								estimatedClasses: topic.estimatedClasses || 1,
								weightPercent: Number(topic.weightPercent || 100),
								progressPercent: Number(topic.progressPercent || 0),
								isCompleted: !!topic.isCompleted,
							})),
						})),
					})),
				}}
			/>
		</div>
	);
}
