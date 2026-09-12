"use client";

import { HomeworkCreate } from "@/modules/academics/homework/components/HomeworkCreate";
import HomeworkList from "@/modules/academics/homework/components/HomeworkList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function HomeworkPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_homework"), href: PATHS.ACADEMICS.HOMEWORK.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Homework">
				<div className="hidden @3xl/page:flex">
					<HomeworkCreate />
				</div>
			</PageHeading>
			<HomeworkList />
		</div>
	);
}
