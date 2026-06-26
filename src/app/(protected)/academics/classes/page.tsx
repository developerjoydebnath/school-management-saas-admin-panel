"use client";

import { ClassCreate } from "@/modules/academics/classes/components/ClassCreate";
import ClassList from "@/modules/academics/classes/components/ClassList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ClassesPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_classes"), href: PATHS.ACADEMICS.CLASSES.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Classes">
				<div className="hidden @3xl/page:flex">
					<ClassCreate />
				</div>
			</PageHeading>

			<ClassList />
		</div>
	);
}
