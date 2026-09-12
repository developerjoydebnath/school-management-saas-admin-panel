"use client";

import HomeworkForm from "@/modules/academics/homework/components/HomeworkForm";
import { useHomework } from "@/modules/academics/homework/hooks/use-homeworks";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditHomeworkPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data, isLoading } = useHomework(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_homework"), href: PATHS.ACADEMICS.HOMEWORK.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EditHomework" />
			{isLoading || !data ? (
				<Skeleton className="h-96 w-full" />
			) : (
				<HomeworkForm initialData={data} isEdit />
			)}
		</div>
	);
}
