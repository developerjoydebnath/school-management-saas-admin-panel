"use client";

import CirculationActions from "@/modules/library/circulation/components/CirculationActions";
import CirculationDesk from "@/modules/library/circulation/components/CirculationDesk";
import LoanRegister from "@/modules/library/circulation/components/LoanRegister";
import LibraryStatStrip from "@/modules/library/shared/components/LibraryStatStrip";
import { useCirculationOverview } from "@/modules/library/shared/hooks/use-library-circulation";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function IssueReturnPage() {
	const t = useTranslations("LibraryCirculation");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const { counters, isLoading } = useCirculationOverview();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("library"), href: PATHS.LIBRARY.CATALOG.ROOT },
			{ label: tNav("library_issue_return") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LibraryCirculation">
				{/* Hidden below @3xl/page, where the register's filter bar shows the
				    same component instead. */}
				<div className="hidden @3xl/page:flex">
					<CirculationActions />
				</div>
			</PageHeading>

			<LibraryStatStrip
				isLoading={isLoading}
				columns={4}
				stats={[
					{
						label: t("statIssuedToday"),
						value: counters?.issuedToday ?? 0,
						icon: ArrowUpRight,
					},
					{
						label: t("statReturnedToday"),
						value: counters?.returnedToday ?? 0,
						icon: ArrowDownLeft,
					},
					{
						label: t("statDueToday"),
						value: counters?.dueToday ?? 0,
						icon: CalendarClock,
					},
					{
						label: t("statOverdue"),
						value: counters?.overdue ?? 0,
						icon: Clock,
						tone: Number(counters?.overdue || 0) > 0 ? "warning" : "default",
					},
				]}
			/>

			<CirculationDesk />
			<LoanRegister />
		</div>
	);
}
