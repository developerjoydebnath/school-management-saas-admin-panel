"use client";

import StaffForm from "@/modules/staff/directory/components/StaffForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CreateStaffPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const tForm = useTranslations("StaffForm");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_directory"), href: PATHS.STAFF.DIRECTORY.ROOT },
			{ label: tForm("createStaff"), href: PATHS.STAFF.DIRECTORY.CREATE },
		]);
	}, [setBreadcrumbs, tNav, tForm]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffDirectory" title={tForm("createStaff")} />
			<StaffForm defaultValues={{}} />
		</div>
	);
}
