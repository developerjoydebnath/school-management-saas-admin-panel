"use client";

import { OnlineClassCreate } from "@/modules/academics/online-classes/components/OnlineClassCreate";
import OnlineClassList from "@/modules/academics/online-classes/components/OnlineClassList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function OnlineClassesPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_online_classes"), href: PATHS.ACADEMICS.ONLINE_CLASSES.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="OnlineClasses">
				<div className="hidden @3xl/page:flex">
					<OnlineClassCreate />
				</div>
			</PageHeading>
			<OnlineClassList />
		</div>
	);
}
