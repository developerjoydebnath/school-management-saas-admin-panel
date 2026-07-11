"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import PortalContainer from "@/modules/admission/portal/components/PortalContainer";

export default function OnlinePortalPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("home"), href: "/" },
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("admission"), href: PATHS.ADMISSION.ROOT },
			{ label: tNav("admission_portal"), href: PATHS.ADMISSION.PORTAL.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="AdmissionPortal" />
			<PortalContainer />
		</div>
	);
}
