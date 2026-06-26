"use client";

import { ShiftCreate } from "@/modules/academics/shifts/components/ShiftCreate";
import ShiftList from "@/modules/academics/shifts/components/ShiftList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ShiftsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_shifts"), href: PATHS.ACADEMICS.SHIFTS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Shifts">
				<div className="hidden @3xl/page:flex">
					<ShiftCreate />
				</div>
			</PageHeading>

			<ShiftList />
		</div>
	);
}
