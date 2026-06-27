"use client";

import DesignationForm from "@/modules/staff/designations/components/DesignationForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues = {
	name: "",
	nameBn: "",
	category: "",
	applicableTo: [],
	level: 0,
	isHeadRole: false,
	isSystem: false,
	isActive: true,
};

export default function CreateDesignationPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_designations"), href: PATHS.STAFF.DESIGNATIONS.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Designations" />
			<DesignationForm defaultValues={defaultValues} />
		</div>
	);
}
