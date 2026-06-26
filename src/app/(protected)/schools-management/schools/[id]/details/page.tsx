"use client";

import { SchoolDetails } from "@/modules/schools-management/schools/components/SchoolDetails";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { SchoolModel } from "@/shared/models/school.model";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function SchoolDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const tDetails = useTranslations("SchoolsManagementSchoolsDetails");
	const locale = useLocale();

	const { data: response, isLoading } = useSWR(`/superadmin/schools/${id}`);
	const schoolData = response?.data ? new SchoolModel(response.data) : null;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{
				label: tNav("schools_management_schools"),
				href: PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT,
			},
			{ label: tDetails("title") },
		]);
	}, [setBreadcrumbs, tNav, tDetails, locale]);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!schoolData) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				School not found.
			</div>
		);
	}

	return (
		<div className="@container/page mx-auto max-w-7xl">
			<SchoolDetails school={schoolData} />
		</div>
	);
}
