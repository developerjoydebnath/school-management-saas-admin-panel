"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { StockFormValues } from "../dto/stock.dto";
import { useStockBatch } from "../hooks/use-stock";
import { StockForm } from "./StockForm";

type Props = {
	id?: string;
};

function defaults(data?: any): StockFormValues {
	return {
		itemId: data?.itemId || "",
		locationId: data?.locationId || "",
		quantityTotal: data?.quantityTotal ?? 0,
		quantityGood: data?.quantityGood ?? undefined,
		quantityDamaged: data?.quantityDamaged ?? undefined,
		quantityDisposed: data?.quantityDisposed ?? undefined,
		purchaseDate: data?.purchaseDate ? new Date(data.purchaseDate).toISOString().slice(0, 10) : "",
		purchasePrice: data?.purchasePrice ?? undefined,
		supplier: data?.supplier || "",
		invoiceNo: data?.invoiceNo || "",
		hasWarranty: data?.hasWarranty ?? false,
		warrantyPeriod: data?.warrantyPeriod ?? undefined,
		warrantyPeriodUnit: data?.warrantyPeriodUnit || "",
		warrantyNotes: data?.warrantyNotes || "",
		invoiceImageUrl: data?.invoiceImageUrl || "",
		invoicePlaceholder: data?.invoicePlaceholder || "",
		notes: data?.notes || "",
	};
}

export function StockFormPage({ id }: Props) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const isEdit = Boolean(id);
	const { data: response, isLoading } = useStockBatch(isEdit ? id : null);
	const details = response?.data || response;
	const defaultValues = useMemo(() => defaults(details), [details]);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("stockTitle"), href: PATHS.INVENTORY.STOCK.ROOT },
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
				title={`${isEdit ? t("editTitle") : t("createTitle")} ${t("stockTitle")}`}
				description={t("stockDescription")}
			/>
			<StockForm id={id} isEdit={isEdit} defaultValues={defaultValues} />
		</div>
	);
}
