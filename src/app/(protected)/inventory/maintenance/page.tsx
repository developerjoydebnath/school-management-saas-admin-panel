"use client";

import { MaintenanceList } from "@/modules/inventory/maintenance/components/MaintenanceList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { MaintenanceCreateButton } from "@/modules/inventory/maintenance/components/MaintenanceCreateButton";

export default function InventoryMaintenancePage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("maintenanceTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("maintenanceTitle")}
				description={t("maintenanceDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<MaintenanceCreateButton />
				</div>
			</PageHeading>
			<MaintenanceList />
		</div>
	);
}
