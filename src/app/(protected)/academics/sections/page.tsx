"use client";

import { SectionCreate } from "@/modules/academics/sections/components/SectionCreate";
import SectionList from "@/modules/academics/sections/components/SectionList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SectionsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_sections"), href: PATHS.ACADEMICS.SECTIONS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Sections"
				title="Sections"
				description="Manage reusable section names for session class setup."
			>
				<div className="hidden @3xl/page:flex">
					<SectionCreate />
				</div>
			</PageHeading>
			<SectionList />
		</div>
	);
}
