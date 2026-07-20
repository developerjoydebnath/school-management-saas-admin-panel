"use client";

import SectionForm from "@/modules/academics/sections/components/SectionForm";
import { SectionFormValues } from "@/modules/academics/sections/dto/section.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues: SectionFormValues = {
	name: "",
	bnName: "",
	code: "",
	sortOrder: 0,
	status: StatusEnum.ACTIVE,
};

export default function CreateSectionPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_sections"), href: PATHS.ACADEMICS.SECTIONS.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Sections"
				title="Create Section"
				description="Create a reusable section name for yearly class setup."
			/>
			<SectionForm defaultValues={defaultValues} />
		</div>
	);
}
