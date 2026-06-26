"use client";

import { SubjectCreate } from "@/modules/academics/subjects/components/SubjectCreate";
import SubjectList from "@/modules/academics/subjects/components/SubjectList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SubjectsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_subjects"), href: PATHS.ACADEMICS.SUBJECTS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Subjects">
				<div className="hidden @3xl/page:flex">
					<SubjectCreate />
				</div>
			</PageHeading>
			<SubjectList />
		</div>
	);
}
