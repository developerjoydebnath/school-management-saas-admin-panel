"use client";

import EventFormPage from "@/modules/events/scheduling/components/EventFormPage";
import { useEvent } from "@/modules/events/scheduling/hooks/use-events";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditEventPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Events");
	const params = useParams();
	const id = params.id as string;

	const { data: event, isLoading } = useEvent(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("events"), href: PATHS.EVENTS.SCHEDULING.ROOT },
			{ label: tNav("events_scheduling"), href: PATHS.EVENTS.SCHEDULING.ROOT },
			{ label: event?.title || t("editEventTitle") },
		]);
	}, [setBreadcrumbs, tNav, t, event]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Events"
				title={t("editEventTitle")}
				description={t("formDescription")}
			/>
			{isLoading ? (
				<div className="mx-auto max-w-5xl space-y-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-48 w-full rounded-xl" />
					))}
				</div>
			) : !event ? (
				<p className="text-muted-foreground text-sm">{t("notFound")}</p>
			) : (
				<EventFormPage event={event} />
			)}
		</div>
	);
}
