"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { MovementFormValues } from "../dto/movement.dto";
import { MovementForm } from "./MovementForm";

const defaultValues: MovementFormValues = {
	itemId: "",
	movementType: "PURCHASE",
	quantity: 1,
	assetId: "",
	stockBatchId: "",
	fromLocationId: "",
	toLocationId: "",
	referenceNo: "",
	notes: "",
};

export function MovementFormPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("movementsTitle"), href: PATHS.INVENTORY.MOVEMENTS.ROOT },
			{ label: t("createTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={`${t("createTitle")} ${t("movementsTitle")}`}
				description={t("movementsDescription")}
			/>
			<MovementForm defaultValues={defaultValues} />
		</div>
	);
}
