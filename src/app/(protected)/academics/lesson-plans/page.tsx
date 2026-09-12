"use client";

import { LessonPlanCreate } from "@/modules/academics/lesson-plans/components/LessonPlanCreate";
import LessonPlanList from "@/modules/academics/lesson-plans/components/LessonPlanList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function LessonPlansPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_lesson_plans"), href: PATHS.ACADEMICS.LESSON_PLANS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LessonPlans">
				<div className="hidden @3xl/page:flex">
					<LessonPlanCreate />
				</div>
			</PageHeading>
			<LessonPlanList />
		</div>
	);
}
