"use client";

import LessonPlanForm from "@/modules/academics/lesson-plans/components/LessonPlanForm";
import { useLessonPlan } from "@/modules/academics/lesson-plans/hooks/use-lesson-plans";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditLessonPlanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data, isLoading } = useLessonPlan(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_lesson_plans"), href: PATHS.ACADEMICS.LESSON_PLANS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EditLessonPlan" />
			{isLoading || !data ? (
				<Skeleton className="h-96 w-full" />
			) : (
				<LessonPlanForm initialData={data} isEdit />
			)}
		</div>
	);
}
