"use client";

import LibraryCategoryManager from "@/modules/library/settings/components/LibraryCategoryManager";
import LibrarySettingsEditButton from "@/modules/library/settings/components/LibrarySettingsEditButton";
import LibrarySettingsView from "@/modules/library/settings/components/LibrarySettingsView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Page() {
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("library"), href: PATHS.LIBRARY.CATALOG.ROOT },
			{ label: tNav("library_settings") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LibrarySettings">
				<div className="hidden @3xl/page:flex">
					<LibrarySettingsEditButton />
				</div>
			</PageHeading>

			{/* Mobile: the header has no room, so the action sits above the cards. */}
			<div className="flex @3xl/page:hidden">
				<LibrarySettingsEditButton />
			</div>

			<LibrarySettingsView />

			{/* Editable in place: these are three short fields per row, so a
			    separate route would be heavier than the edit itself. */}
			<LibraryCategoryManager />
		</div>
	);
}
