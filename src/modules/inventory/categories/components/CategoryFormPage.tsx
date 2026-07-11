"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { CategoryFormValues } from "../dto/category.dto";
import { useCategory } from "../hooks/use-category";
import { CategoryForm } from "./CategoryForm";

type Props = {
	id?: string;
};

function defaults(data?: any): CategoryFormValues {
	return {
		name: data?.name || "",
		nameBn: data?.nameBn || "",
		slug: data?.slug || "",
		iconName: data?.iconName || "",
		colorCode: data?.colorCode || "",
		description: data?.description || "",
		isActive: data?.isActive ?? true,
	};
}

export function CategoryFormPage({ id }: Props) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const isEdit = Boolean(id);
	const { data: response, isLoading } = useCategory(isEdit ? id : null);
	const details = response?.data || response;
	const defaultValues = useMemo(() => defaults(details), [details]);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("categoriesTitle"), href: PATHS.INVENTORY.CATEGORIES.ROOT },
			{ label: isEdit ? t("editTitle") : t("createTitle") },
		]);
	}, [setBreadcrumbs, tNav, t, isEdit]);

	if (isEdit && isLoading) {
		return (
			<div className="@container/page mx-auto max-w-7xl space-y-6">
				<Skeleton className="h-10 w-72" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Inventory"
				title={`${isEdit ? t("editTitle") : t("createTitle")} ${t("categoriesTitle")}`}
				description={t("categoriesDescription")}
			/>
			<CategoryForm id={id} isEdit={isEdit} defaultValues={defaultValues} />
		</div>
	);
}
