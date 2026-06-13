"use client";

import AdmissionSettingsTabs from "@/modules/admission/admission-settings/components/AdmissionSettingsTabs";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function AdmissionSettingsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("admission"), href: PATHS.ADMISSION.ROOT },
			{ label: tNav("admission_settings"), href: PATHS.ADMISSION.SETTINGS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="AdmissionSettings" />
			<AdmissionSettingsTabs />
		</div>
	);
}
