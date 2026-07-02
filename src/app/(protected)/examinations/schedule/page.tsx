"use client";

import { ExamCreate } from "@/modules/examinations/schedule/components/ExamCreate";
import ExamList from "@/modules/examinations/schedule/components/ExamList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ExamsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{
				label: tNav("examinations_schedule"),
				href: PATHS.EXAMINATIONS.SCHEDULE.ROOT,
			},
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Exams">
				<div className="hidden @3xl/page:flex">
					<ExamCreate />
				</div>
			</PageHeading>
			<ExamList />
		</div>
	);
}
