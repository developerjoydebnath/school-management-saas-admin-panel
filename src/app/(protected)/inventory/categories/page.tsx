"use client";

import { CategoryCreateButton } from "@/modules/inventory/categories/components/CategoryCreateButton";
import { CategoryList } from "@/modules/inventory/categories/components/CategoryList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function InventoryCategoriesPage() {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("categoriesTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={t("categoriesTitle")}
				description={t("categoriesDescription")}
			>
				<div className="hidden @3xl/page:flex">
					<CategoryCreateButton />
				</div>
			</PageHeading>
			<CategoryList />
		</div>
	);
}
