"use client";

import SectionForm from "@/modules/academics/sections/components/SectionForm";
import { SectionFormValues } from "@/modules/academics/sections/dto/section.dto";
import { useSection } from "@/modules/academics/sections/hooks/use-section";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { data: section, isLoading } = useSection(id);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_sections"), href: PATHS.ACADEMICS.SECTIONS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) return null;

	const defaultValues: SectionFormValues = {
		name: section?.name || "",
		bnName: section?.bnName || "",
		code: section?.code || "",
		sortOrder: section?.sortOrder ?? 0,
		status: section?.status || StatusEnum.ACTIVE,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Sections"
				title="Edit Section"
				description="Update reusable section information."
			/>
			<SectionForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
