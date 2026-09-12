"use client";

import IncidentForm from "@/modules/students/behavior/components/IncidentForm";
import { useIncident } from "@/modules/students/behavior/hooks/use-behavior-incidents";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditBehaviorRecordPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data, isLoading } = useIncident(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_behavior"), href: PATHS.STUDENTS.BEHAVIOR.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EditBehaviorRecord" />
			{isLoading || !data ? (
				<Skeleton className="h-96 w-full" />
			) : (
				<IncidentForm initialData={data} isEdit />
			)}
		</div>
	);
}
