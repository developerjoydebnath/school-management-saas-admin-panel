"use client";

import { StockList } from "@/modules/inventory/stock/components/StockList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { StockCreateButton } from "@/modules/inventory/stock/components/StockCreateButton";

export default function InventoryStockPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("stockTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("stockTitle")}
				description={t("stockDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<StockCreateButton />
				</div>
			</PageHeading>
			<StockList />
		</div>
	);
}
