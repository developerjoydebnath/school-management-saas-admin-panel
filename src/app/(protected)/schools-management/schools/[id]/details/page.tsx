"use client";

import { SchoolDetails } from "@/modules/schools-management/schools/components/SchoolDetails";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useSchools } from "@/modules/schools-management/hooks/use-schools";

export default function SchoolDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	// In a real app we'd have a useSchool(id) hook, but for now we'll fetch the list and find it or just use the first if we add a dedicated endpoint later.
	// Since backend doesn't have a specific `findOne` for schools exposed clearly in the prompt, let's just use the list and find.
	const { data, isLoading } = useSchools();
	const school = data?.find((s: any) => s.id === id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: "Schools Management", href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: "Schools", href: PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT },
			{ label: school?.schoolName || "Details" },
		]);
	}, [setBreadcrumbs, tNav, school?.schoolName]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchoolsDetails" />
			{isLoading ? (
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
					<Skeleton className="h-[400px] w-full" />
				</div>
			) : school ? (
				<SchoolDetails school={school} />
			) : (
				<div className="text-center text-muted-foreground p-12">School not found.</div>
			)}
		</div>
	);
}
