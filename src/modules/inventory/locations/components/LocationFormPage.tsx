"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { LocationFormValues } from "../dto/location.dto";
import { useLocation } from "../hooks/use-location";
import { LocationForm } from "./LocationForm";

type Props = {
	id?: string;
};

function defaults(data?: any): LocationFormValues {
	return {
		name: data?.name || "",
		code: data?.code || "",
		classRoomId: data?.classRoomId || "",
		description: data?.description || "",
		locationType: data?.locationType || "STORE",
		status: data?.status || "ACTIVE",
	};
}

export function LocationFormPage({ id }: Props) {
	const t = useTranslations("Inventory");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const isEdit = Boolean(id);
	const { data: response, isLoading } = useLocation(isEdit ? id : null);
	const details = response?.data || response;
	const defaultValues = useMemo(() => defaults(details), [details]);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("inventory"), href: PATHS.INVENTORY.OVERVIEW },
			{ label: t("locationsTitle"), href: PATHS.INVENTORY.LOCATIONS.ROOT },
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
				title={`${isEdit ? t("editTitle") : t("createTitle")} ${t("locationsTitle")}`}
				description={t("locationsDescription")}
			/>
			<LocationForm id={id} isEdit={isEdit} defaultValues={defaultValues} />
		</div>
	);
}
