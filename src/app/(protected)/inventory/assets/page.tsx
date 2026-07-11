"use client";

import { AssetCreateButton } from "@/modules/inventory/assets/components/AssetCreateButton";
import { AssetList } from "@/modules/inventory/assets/components/AssetList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function InventoryAssetsPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("assetsTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("assetsTitle")}
				description={t("assetsDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<AssetCreateButton />
				</div>
			</PageHeading>
			<AssetList />
		</div>
	);
}
