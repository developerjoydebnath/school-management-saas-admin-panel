"use client";

import EventGalleryBrowser from "@/modules/events/gallery/components/EventGalleryBrowser";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function EventGalleryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("events"), href: PATHS.EVENTS.SCHEDULING.ROOT },
			{ label: tNav("events_gallery") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EventGallery" />
			<EventGalleryBrowser />
		</div>
	);
}
