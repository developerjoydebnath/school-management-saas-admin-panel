"use client";

import { SyllabusProgressView } from "@/modules/academics/syllabus/components/SyllabusProgressView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function SyllabusProgressPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Syllabus");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_syllabus"), href: PATHS.ACADEMICS.SYLLABUS.ROOT },
			{ label: t("updateProgress") },
		]);
	}, [setBreadcrumbs, t, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SyllabusProgress" />
			<SyllabusProgressView id={id} />
		</div>
	);
}
