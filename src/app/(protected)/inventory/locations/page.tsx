"use client";

import { LocationCreateButton } from "@/modules/inventory/locations/components/LocationCreateButton";
import { LocationList } from "@/modules/inventory/locations/components/LocationList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function InventoryLocationsPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("locationsTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("locationsTitle")}
				description={t("locationsDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<LocationCreateButton />
				</div>
			</PageHeading>
			<LocationList />
		</div>
	);
}
