"use client";

import SyllabusDetailView from "@/modules/academics/syllabus/components/SyllabusDetailView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function SyllabusDetailPage() {
	const params = useParams();
	const classId = params.classId as string;

	const { setBreadcrumbs } = useBreadcrumbStore();
	const t = useTranslations("Syllabus");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_syllabus"), href: PATHS.ACADEMICS.SYLLABUS.ROOT },
			{ label: classId.replace("-", " ").toUpperCase(), href: "#" },
		]);
	}, [setBreadcrumbs, tNav, classId]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Syllabus Details" />

			<div className="flex items-center justify-between">
				<h2 className="text-foreground text-lg font-semibold capitalize">
					{classId.replace("-", " ")} Syllabus
				</h2>
			</div>

			<SyllabusDetailView classId={classId} />
		</div>
	);
}
