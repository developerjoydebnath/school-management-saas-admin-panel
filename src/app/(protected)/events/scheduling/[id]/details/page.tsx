"use client";

import EventDetailView from "@/modules/events/scheduling/components/EventDetailView";
import { useEvent } from "@/modules/events/scheduling/hooks/use-events";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EventDetailsPage() {
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
			{ label: event?.title || t("eventDetails") },
		]);
	}, [setBreadcrumbs, tNav, t, event]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Events"
				title={event?.title || t("eventDetails")}
				description={t("eventDetailsHint")}
			/>
			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-10 w-96" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			) : !event ? (
				<p className="text-muted-foreground text-sm">{t("notFound")}</p>
			) : (
				<EventDetailView event={event} />
			)}
		</div>
	);
}
