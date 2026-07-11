"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { MaintenanceFormValues } from "../dto/maintenance.dto";
import MaintenanceForm from "./MaintenanceForm";

const defaultValues: Partial<MaintenanceFormValues> = {
	itemId: "",
	assetId: "",
	stockBatchId: "",
	locationId: "",
	issueTitle: "",
	issueDescription: "",
	status: "OPEN",
	priority: "MEDIUM",
	serviceProvider: "",
	cost: 0,
	notes: "",
};

export function MaintenanceFormPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("maintenanceTitle"), href: PATHS.INVENTORY.MAINTENANCE.ROOT },
			{ label: t("createTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={`${t("createTitle")} ${t("maintenanceTitle")}`}
				description={t("maintenanceDescription")}
			/>
			<MaintenanceForm defaultValues={defaultValues} />
		</div>
	);
}
