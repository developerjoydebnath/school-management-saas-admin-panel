"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { InventoryModuleKey, inventoryModules } from "../constants/inventory.constants";
import { InventoryCreateButton } from "./InventoryCreateButton";
import InventoryList from "./InventoryList";
import InventoryOverview from "./InventoryOverview";

type Props = {
	moduleKey?: InventoryModuleKey;
	overview?: boolean;
};

export default function InventoryPageShell({ moduleKey, overview = false }: Props) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const config = moduleKey ? inventoryModules[moduleKey] : null;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: overview ? tNav("inventory_overview") : t(config?.titleKey || "title") },
		]);
	}, [setBreadcrumbs, tNav, t, overview, config?.titleKey]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={overview ? t("overviewTitle") : t(config?.titleKey || "title")}
				description={
					overview
						? t("overviewDescription")
						: t(config?.descriptionKey || "description")
				}
			>
				{moduleKey && (
					<div className="hidden @3xl/page:flex">
						<InventoryCreateButton moduleKey={moduleKey} />
					</div>
				)}
			</PageHeading>
			{overview ? <InventoryOverview /> : moduleKey ? <InventoryList moduleKey={moduleKey} /> : null}
		</div>
	);
}
