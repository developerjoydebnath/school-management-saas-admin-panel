"use client";

import SyllabusHistoryView from "@/modules/academics/syllabus/components/SyllabusHistoryView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function SyllabusHistoryPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_syllabus"), href: PATHS.ACADEMICS.SYLLABUS.ROOT },
			{ label: tNav("history") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SyllabusHistory" />
			<SyllabusHistoryView id={id} />
		</div>
	);
}
