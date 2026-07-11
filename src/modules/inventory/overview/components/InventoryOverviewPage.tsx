"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import InventoryOverview from "./InventoryOverview";

export default function InventoryOverviewPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: tNav("inventory_overview") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("overviewTitle")}
				description={t("overviewDescription")}
			/>
			<InventoryOverview />
		</div>
	);
}
