"use client";

import FineCreate from "@/modules/library/fines/components/FineCreate";
import FineList from "@/modules/library/fines/components/FineList";
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
			{ label: tNav("library_fines") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LibraryFines">
				<div className="hidden @3xl/page:flex">
					<FineCreate />
				</div>
			</PageHeading>

			<FineList />
		</div>
	);
}
