"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { InventoryModuleKey, inventoryModules } from "../constants/inventory.constants";
import { InventoryFormValues, inventoryMovementTypeEnum } from "../dto/inventory.dto";
import { useInventoryDetails } from "../hooks/use-inventory";
import InventoryForm from "./InventoryForm";

type Props = {
	moduleKey: InventoryModuleKey;
	id?: string;
};

function dateInput(value?: string | null) {
	if (!value) return "";
	return value.slice(0, 10);
}

function defaults(moduleKey: InventoryModuleKey, data?: any): InventoryFormValues {
	if (moduleKey === "categories") {
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
	if (moduleKey === "items") {
		return {
			categoryId: data?.categoryId || data?.category?.id || "",
			name: data?.name || "",
			code: data?.code || "",
			brand: data?.brand || "",
			model: data?.model || "",
			trackingType: data?.trackingType || "QUANTITY",
			unit: data?.unit || "piece",
			material: data?.material || "",
			seatingCapacity: data?.seatingCapacity ?? undefined,
			minimumStock: data?.minimumStock ?? 0,
			dimensionUnit: data?.dimensionUnit || "m",
			length: data?.length ?? undefined,
			width: data?.width ?? undefined,
			height: data?.height ?? undefined,
			isSeatingItem: data?.isSeatingItem ?? false,
			isDepreciable: data?.isDepreciable ?? false,
			isActive: data?.isActive ?? true,
			description: data?.description || "",
		};
	}
	if (moduleKey === "locations") {
		return {
			locationType: data?.locationType || "STORE",
			name: data?.name || "",
			code: data?.code || "",
			classRoomId: data?.classRoomId || "",
			building: data?.building || "",
			floor: data?.floor || "",
			roomNo: data?.roomNo || "",
			status: data?.status || "ACTIVE",
			description: data?.description || "",
		};
	}
	if (moduleKey === "stock") {
		return {
			itemId: data?.itemId || data?.item?.id || "",
			locationId: data?.locationId || data?.location?.id || "",
			quantityTotal: data?.quantityTotal ?? 0,
			quantityGood: data?.quantityGood ?? 0,
			quantityDamaged: data?.quantityDamaged ?? 0,
			quantityDisposed: data?.quantityDisposed ?? 0,
			purchaseDate: dateInput(data?.purchaseDate),
			purchasePrice: data?.purchasePrice ?? undefined,
			supplier: data?.supplier || "",
			invoiceNo: data?.invoiceNo || "",
			invoiceImageUrl: data?.invoiceImageUrl || "",
			invoicePlaceholder: data?.invoicePlaceholder || "",
			hasWarranty: data?.hasWarranty ?? false,
			warrantyPeriod: data?.warrantyPeriod ?? undefined,
			warrantyPeriodUnit: data?.warrantyPeriodUnit || "year",
			notes: data?.notes || "",
		};
	}
	if (moduleKey === "assets") {
		return {
			itemId: data?.itemId || data?.item?.id || "",
			locationId: data?.locationId || data?.location?.id || "",
			assetTag: data?.assetTag || "",
			serialNo: data?.serialNo || "",
			macAddress: data?.macAddress || "",
			condition: data?.condition || "GOOD",
			status: data?.status || "IN_STORE",
			assignedTo: data?.assignedTo || data?.assignedToUser?.id || "",
			purchaseDate: dateInput(data?.purchaseDate),
			purchasePrice: data?.purchasePrice ?? undefined,
			supplier: data?.supplier || "",
			invoiceNo: data?.invoiceNo || "",
			hasWarranty: data?.hasWarranty ?? false,
			warrantyPeriod: data?.warrantyPeriod ?? undefined,
			warrantyPeriodUnit: data?.warrantyPeriodUnit || "year",
			notes: data?.notes || "",
		};
	}
	if (moduleKey === "movements") {
		return {
			itemId: "",
			movementType: inventoryMovementTypeEnum.TRANSFER,
			quantity: 1,
			fromLocationId: "",
			toLocationId: "",
			referenceNo: "",
			notes: "",
		};
	}
	return {
		itemId: data?.itemId || data?.item?.id || "",
		locationId: data?.locationId || data?.location?.id || "",
		issueTitle: data?.issueTitle || "",
		status: data?.status || "OPEN",
		priority: data?.priority || "MEDIUM",
		serviceProvider: data?.serviceProvider || "",
		cost: data?.cost ?? undefined,
		issueDescription: data?.issueDescription || "",
		notes: data?.notes || "",
	};
}

export default function InventoryFormPage({ moduleKey, id }: Props) {
	const config = inventoryModules[moduleKey];
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const isEdit = !!id;
	const canFetchDetails = isEdit && config.resource !== "movements";
	const { data: response, isLoading } = useInventoryDetails(
		canFetchDetails ? (config.resource as any) : "categories",
		canFetchDetails ? id : null
	);
	const details = response?.data || response;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t(config.titleKey), href: config.rootPath },
			{ label: isEdit ? t("editTitle") : t("createTitle") },
		]);
	}, [setBreadcrumbs, tNav, t, config.rootPath, config.titleKey, isEdit]);

	if (canFetchDetails && isLoading) {
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
				title={`${isEdit ? t("editTitle") : t("createTitle")} ${t(config.titleKey)}`}
				description={t(config.descriptionKey)}
			/>
			<InventoryForm
				moduleKey={moduleKey}
				id={id}
				isEdit={isEdit}
				defaultValues={defaults(moduleKey, details)}
			/>
		</div>
	);
}
