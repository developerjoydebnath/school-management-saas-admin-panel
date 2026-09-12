"use client";

import LibrarySettingsForm from "@/modules/library/settings/components/LibrarySettingsForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function EditLibrarySettingsPage() {
	const t = useTranslations("LibrarySettings");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("library"), href: PATHS.LIBRARY.CATALOG.ROOT },
			{ label: tNav("library_settings"), href: PATHS.LIBRARY.SETTINGS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="LibrarySettings"
				title={t("editTitle")}
				description={t("editDescription")}
			/>
			<LibrarySettingsForm />
		</div>
	);
}
