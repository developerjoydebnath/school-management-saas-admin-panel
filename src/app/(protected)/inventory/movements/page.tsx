"use client";

import { MovementCreateButton } from "@/modules/inventory/movements/components/MovementCreateButton";
import { MovementList } from "@/modules/inventory/movements/components/MovementList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function InventoryMovementsPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("movementsTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("movementsTitle")}
				description={t("movementsDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<MovementCreateButton />
				</div>
			</PageHeading>
			<MovementList />
		</div>
	);
}
