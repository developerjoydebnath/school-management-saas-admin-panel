"use client";

import { StaffDetails } from "@/modules/staff/directory/components/StaffDetails";
import { useStaff } from "@/modules/staff/directory/hooks/use-staff";
import Loader from "@/shared/components/custom/Loader";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function StaffDetailsPage() {
	const params = useParams();
	const id = params?.id as string;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StaffDirectory");

	const { staff, isLoading } = useStaff(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_directory"), href: PATHS.STAFF.DIRECTORY.ROOT },
			{ label: t("staffDetails"), href: PATHS.STAFF.DIRECTORY.DETAILS(id) },
		]);
	}, [setBreadcrumbs, tNav, t, id]);

	if (isLoading) {
		return <Loader className="text-primary mt-40 h-10 w-10" />;
	}

	if (!staff) {
		return <div className="text-muted-foreground p-8 text-center">Staff member not found</div>;
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffDirectory" title={t("staffDetails")} />
			<StaffDetails staff={staff} />
		</div>
	);
}
