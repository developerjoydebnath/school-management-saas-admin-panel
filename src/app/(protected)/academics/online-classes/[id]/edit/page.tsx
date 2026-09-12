"use client";

import OnlineClassForm from "@/modules/academics/online-classes/components/OnlineClassForm";
import { useOnlineClass } from "@/modules/academics/online-classes/hooks/use-online-classes";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditOnlineClassPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data, isLoading } = useOnlineClass(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_online_classes"), href: PATHS.ACADEMICS.ONLINE_CLASSES.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EditOnlineClass" />
			{isLoading || !data ? (
				<Skeleton className="h-96 w-full" />
			) : (
				<OnlineClassForm initialData={data} isEdit />
			)}
		</div>
	);
}
