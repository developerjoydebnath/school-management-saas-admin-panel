"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { AssetFormValues } from "../dto/asset.dto";
import { useAsset } from "../hooks/use-asset";
import AssetForm from "./AssetForm";

type Props = {
	id?: string;
};

function defaults(data?: any): AssetFormValues {
	return {
		itemId: data?.itemId || "",
		locationId: data?.locationId || "",
		assetTag: data?.assetTag || "",
		serialNo: data?.serialNo || "",
		macAddress: data?.macAddress || "",
		condition: data?.condition || "GOOD",
		status: data?.status || "IN_STORE",
		assignedTo: data?.assignedTo || "",
		purchaseDate: data?.purchaseDate || "",
		purchasePrice: data?.purchasePrice || 0,
		supplier: data?.supplier || "",
		invoiceNo: data?.invoiceNo || "",
		hasWarranty: data?.hasWarranty || false,
		warrantyPeriod: data?.warrantyPeriod || 0,
		warrantyPeriodUnit: data?.warrantyPeriodUnit || "YEAR",
		imageUrl: data?.imageUrl || "",
		imagePlaceholder: data?.imagePlaceholder || "",
		notes: data?.notes || "",
	};
}

export function AssetFormPage({ id }: Props) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const isEdit = Boolean(id);
	const { data: response, isLoading } = useAsset(isEdit ? id : null);
	const details = response?.data || response;
	const defaultValues = useMemo(() => defaults(details), [details]);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("assetsTitle"), href: PATHS.INVENTORY.ASSETS.ROOT },
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
				title={`${isEdit ? t("editTitle") : t("createTitle")} ${t("assetsTitle")}`}
				description={t("assetsDescription")}
			/>
			<AssetForm id={id} defaultValues={defaultValues} />
		</div>
	);
}
