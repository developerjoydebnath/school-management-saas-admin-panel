"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useMaintenance } from "../hooks/use-maintenance";
import MaintenanceForm from "./MaintenanceForm";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function MaintenanceEditFormPage({ id }: { id: string }) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const { data, isLoading } = useMaintenance(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("maintenanceTitle"), href: PATHS.INVENTORY.MAINTENANCE.ROOT },
			{ label: t("editTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	if (isLoading || !data) {
		return (
			<div className="@container/page mx-auto max-w-7xl space-y-6">
				<Skeleton className="h-10 w-72" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	const maintenance = data.data || data;

	const defaultValues = {
		itemId: maintenance.itemId || "",
		assetId: maintenance.assetId || "",
		stockBatchId: maintenance.stockBatchId || "",
		locationId: maintenance.locationId || "",
		issueTitle: maintenance.issueTitle || "",
		issueDescription: maintenance.issueDescription || "",
		status: maintenance.status || "OPEN",
		priority: maintenance.priority || "MEDIUM",
		serviceProvider: maintenance.serviceProvider || "",
		cost: maintenance.cost || 0,
		notes: maintenance.notes || "",
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={`${t("editTitle")} ${t("maintenanceTitle")}`}
				description={t("maintenanceDescription")}
			/>
			<MaintenanceForm defaultValues={defaultValues} id={id} />
		</div>
	);
}
