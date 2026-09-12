"use client";

import EventFormPage from "@/modules/events/scheduling/components/EventFormPage";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CreateEventPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Events");
	const searchParams = useSearchParams();

	// Set when arriving from a calendar day click.
	const defaultDate = searchParams.get("date") || undefined;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("events"), href: PATHS.EVENTS.SCHEDULING.ROOT },
			{ label: tNav("events_scheduling"), href: PATHS.EVENTS.SCHEDULING.ROOT },
			{ label: t("addEventTitle") },
		]);
	}, [setBreadcrumbs, tNav, t]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Events" title={t("addEventTitle")} description={t("formDescription")} />
			<EventFormPage defaultDate={defaultDate} />
		</div>
	);
}
