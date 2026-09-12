"use client";

import { useEvents } from "@/modules/events/scheduling/hooks/use-events";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { Eye, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";

const toAbsolute = (url: string) => {
	if (/^(https?:|data:)/.test(url)) return url;
	const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
	return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "";

/** Browse surface over every event's existing `gallery` — deliberately not its
 * own CRUD entity: photos are uploaded from the event that owns them. */
export default function EventGalleryBrowser() {
	const t = useTranslations("Events");
	const { selectedSessionId } = useSessionStore();

	const { data: events, isLoading } = useEvents({
		sessionId: selectedSessionId || undefined,
		limit: 200,
	});

	const withPhotos = useMemo(
		() => events.filter((event) => (event.gallery?.length ?? 0) > 0),
		[events]
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				{Array.from({ length: 2 }).map((_, i) => (
					<Skeleton key={i} className="h-56 w-full rounded-xl" />
				))}
			</div>
		);
	}

	if (!withPhotos.length) {
		return (
			<div className="rounded-lg border border-dashed p-16 text-center">
				<ImageOff className="text-muted-foreground mx-auto mb-3 size-8" />
				<p className="text-muted-foreground text-sm">{t("noGalleries")}</p>
				<p className="text-muted-foreground mt-1 text-xs">{t("noGalleriesHint")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{withPhotos.map((event) => (
				<Card key={event.id} className="shadow-none">
					<CardContent className="space-y-4 p-6">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="font-semibold">{event.title}</h3>
									<Badge variant="secondary" className="font-normal">
										{event.gallery.length} {t("photos")}
									</Badge>
								</div>
								<p className="text-muted-foreground text-xs">
									{formatDate(event.startDate)}
									{event.venue ? ` · ${event.venue}` : ""}
								</p>
							</div>
							<Button asChild variant="outline" size="sm">
								<Link href={PATHS.EVENTS.SCHEDULING.DETAILS(event.id)}>
									<Eye className="size-4" />
									{t("viewEvent")}
								</Link>
							</Button>
						</div>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
							{event.gallery.map((photo, index) => (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									key={photo.mediaId || index}
									src={toAbsolute(photo.url)}
									alt={photo.name || `${event.title} ${index + 1}`}
									className="h-28 w-full rounded-md border object-cover"
								/>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
