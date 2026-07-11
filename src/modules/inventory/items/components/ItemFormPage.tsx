"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { ItemFormValues, inventoryTrackingTypeEnum } from "../dto/item.dto";
import { useItem } from "../hooks/use-item";
import { ItemForm } from "./ItemForm";

type Props = {
	id?: string;
};

function defaults(data?: any): ItemFormValues {
	return {
		categoryId: data?.categoryId || data?.category?.id || "",
		name: data?.name || "",
		nameBn: data?.nameBn || "",
		code: data?.code || "",
		brand: data?.brand || "",
		model: data?.model || "",
		description: data?.description || "",
		trackingType: data?.trackingType || inventoryTrackingTypeEnum.QUANTITY,
		unit: data?.unit || "piece",
		material: data?.material || "",
		length: data?.length || 0,
		width: data?.width || 0,
		height: data?.height || 0,
		depth: data?.depth || 0,
		dimensionUnit: data?.dimensionUnit || "meter",
		weight: data?.weight || 0,
		weightUnit: data?.weightUnit || "kilogram",
		seatingCapacity: data?.seatingCapacity || 0,
		isSeatingItem: data?.isSeatingItem || false,
		isDepreciable: data?.isDepreciable || false,
		depreciationRate: data?.depreciationRate || 0,
		usefulLifeYears: data?.usefulLifeYears || 0,
		minimumStock: data?.minimumStock || 0,
		isActive: data?.isActive ?? true,
	};
}

export function ItemFormPage({ id }: Props) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const isEdit = Boolean(id);
	const { data: response, isLoading } = useItem(isEdit ? id : null);
	const details = response?.data || response;
	const defaultValues = useMemo(() => defaults(details), [details]);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("itemsTitle"), href: PATHS.INVENTORY.ITEMS.ROOT },
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
				title={`${isEdit ? t("editTitle") : t("createTitle")} ${t("itemsTitle")}`}
				description={t("itemsDescription")}
			/>
			<ItemForm id={id} isEdit={isEdit} defaultValues={defaultValues} />
		</div>
	);
}
