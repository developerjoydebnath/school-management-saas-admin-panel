"use client";

import { ItemCreateButton } from "@/modules/inventory/items/components/ItemCreateButton";
import { ItemList } from "@/modules/inventory/items/components/ItemList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function InventoryItemsPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("itemsTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("itemsTitle")}
				description={t("itemsDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<ItemCreateButton />
				</div>
			</PageHeading>
			<ItemList />
		</div>
	);
}
