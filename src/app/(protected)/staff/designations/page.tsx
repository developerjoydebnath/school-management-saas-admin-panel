"use client";

import { DesignationCreate } from "@/modules/staff/designations/components/DesignationCreate";
import DesignationList from "@/modules/staff/designations/components/DesignationList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function DesignationsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_designations"), href: PATHS.STAFF.DESIGNATIONS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Designations">
				<div className="hidden @3xl/page:flex">
					<DesignationCreate />
				</div>
			</PageHeading>
			<DesignationList />
		</div>
	);
}
