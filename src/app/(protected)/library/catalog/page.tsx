"use client";

import CatalogActions from "@/modules/library/catalog/components/CatalogActions";
import CatalogList from "@/modules/library/catalog/components/CatalogList";
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
			{ label: tNav("library_catalog") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LibraryCatalog">
				{/* Hidden below @3xl/page, where the filter bar shows the same
				    component instead — the ClassesPage split. */}
				<div className="hidden @3xl/page:flex">
					<CatalogActions />
				</div>
			</PageHeading>

			<CatalogList />
		</div>
	);
}
