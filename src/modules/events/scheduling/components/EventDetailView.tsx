"use client";

import EventAwardsTab from "@/modules/events/competitions/components/EventAwardsTab";
import EventCompetitionsTab from "@/modules/events/competitions/components/EventCompetitionsTab";
import EventParticipantsTab from "@/modules/events/participants/components/EventParticipantsTab";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { getLocalizedName } from "@/shared/utils/localization";
import {
	CalendarDays,
	Clock,
	MapPin,
	Pencil,
	User,
	Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
	eventCategoryColors,
	eventStatusColors,
	SchoolEvent,
} from "../dto/event.dto";

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

function InfoRow({
	icon: Icon,
	label,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-3">
			<Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
			<div className="min-w-0">
				<p className="text-muted-foreground text-xs">{label}</p>
				<p className="text-sm font-medium">{children}</p>
			</div>
		</div>
	);
}

export default function EventDetailView({ event }: { event: SchoolEvent }) {
	const t = useTranslations("Events");
	const locale = useLocale();

	const categoryColors = eventCategoryColors[event.category];
	const statusColors = eventStatusColors[event.status];

	const dateRange =
		event.startDate === event.endDate
			? formatDate(event.startDate)
			: `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;

	const timeRange =
		event.startTime && event.endTime
			? `${event.startTime} - ${event.endTime}`
			: event.startTime || t("allDay");

	return (
		<div className="space-y-6">
			<Card className="shadow-none">
				<CardContent className="space-y-5 p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h2 className="text-xl font-bold tracking-tight">{event.title}</h2>
								<Badge
									className={cn(
										"border-transparent font-normal",
										categoryColors.bg,
										categoryColors.text
									)}
								>
									{t(event.category.toLowerCase())}
								</Badge>
								<Badge
									className={cn(
										"border-transparent font-normal",
										statusColors.bg,
										statusColors.text
									)}
								>
									{t(`statusValue.${event.status}`)}
								</Badge>
							</div>
							{event.titleBn && (
								<p className="text-muted-foreground text-sm">{event.titleBn}</p>
							)}
						</div>
						<PermissionGuard
							permissions={[
								PERMISSIONS.EVENTS.ALL,
								PERMISSIONS.EVENTS.SCHEDULING.ALL,
								PERMISSIONS.EVENTS.SCHEDULING.EDIT,
							]}
						>
							<Button asChild variant="outline" size="sm" className="shrink-0">
								<Link href={PATHS.EVENTS.SCHEDULING.EDIT(event.id)}>
									<Pencil className="size-4" />
									{t("editEventTitle")}
								</Link>
							</Button>
						</PermissionGuard>
					</div>

					<div className="grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
						<InfoRow icon={CalendarDays} label={t("dateRange")}>
							{dateRange}
						</InfoRow>
						<InfoRow icon={Clock} label={t("startTime")}>
							{timeRange}
						</InfoRow>
						<InfoRow icon={MapPin} label={t("venue")}>
							{event.venue || "-"}
						</InfoRow>
						<InfoRow icon={User} label={t("coordinator")}>
							{event.coordinator?.fullName || "-"}
						</InfoRow>
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="overview">
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
					<TabsTrigger value="participants">
						{t("tabParticipants")}
						{event._count?.participants ? ` (${event._count.participants})` : ""}
					</TabsTrigger>
					<TabsTrigger value="competitions">
						{t("tabCompetitions")}
						{event._count?.competitions ? ` (${event._count.competitions})` : ""}
					</TabsTrigger>
					<TabsTrigger value="awards">
						{t("tabAwards")}
						{event._count?.awards ? ` (${event._count.awards})` : ""}
					</TabsTrigger>
					<TabsTrigger value="gallery">{t("tabGallery")}</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-4 space-y-4">
					<Card className="shadow-none">
						<CardContent className="space-y-5 p-6">
							{event.description && (
								<div>
									<h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
										{t("descriptionLabel")}
									</h3>
									<p className="text-sm whitespace-pre-wrap">{event.description}</p>
								</div>
							)}

							<div>
								<h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
									{t("audienceTypes")}
								</h3>
								<div className="flex flex-wrap gap-2">
									{event.audienceTypes?.length ? (
										event.audienceTypes.map((audience) => (
											<Badge key={audience} variant="secondary" className="font-normal">
												{t(`audience.${audience}`)}
											</Badge>
										))
									) : (
										<span className="text-muted-foreground text-sm">-</span>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
								<InfoRow icon={Users} label={t("targetClass")}>
									{event.class
										? getLocalizedName(
												{ en: event.class.enName, bn: event.class.bnName },
												locale
											)
										: t("wholeSchool")}
								</InfoRow>
								<InfoRow icon={Users} label={t("targetSection")}>
									{event.section?.name || t("wholeClass")}
								</InfoRow>
								<InfoRow icon={User} label={t("organizingDepartment")}>
									{event.organizingDepartment || "-"}
								</InfoRow>
								<InfoRow icon={User} label={t("contactPerson")}>
									{event.contactPerson || "-"}
								</InfoRow>
							</div>

							{event.registrationRequired && (
								<div className="grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
									<InfoRow icon={CalendarDays} label={t("registrationStart")}>
										{formatDate(event.registrationStart)}
									</InfoRow>
									<InfoRow icon={CalendarDays} label={t("registrationEnd")}>
										{formatDate(event.registrationEnd)}
									</InfoRow>
									<InfoRow icon={Users} label={t("maxParticipants")}>
										{event.maxParticipants ?? t("unlimited")}
									</InfoRow>
									<InfoRow icon={Users} label={t("registrationFee")}>
										{event.registrationFee ? `৳${event.registrationFee}` : t("free")}
									</InfoRow>
								</div>
							)}
						</CardContent>
					</Card>

					{event.guests?.length > 0 && (
						<Card className="shadow-none">
							<CardContent className="p-6">
								<h3 className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
									{t("sectionGuests")}
								</h3>
								<div className="space-y-2">
									{event.guests.map((guest, index) => (
										<div
											key={index}
											className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
										>
											<div className="min-w-0">
												<p className="text-sm font-medium">{guest.name}</p>
												<p className="text-muted-foreground text-xs">
													{[guest.designation, guest.organization]
														.filter(Boolean)
														.join(" · ") || "-"}
												</p>
											</div>
											{guest.guestType && (
												<Badge variant="outline" className="font-normal capitalize">
													{guest.guestType.replace(/_/g, " ")}
												</Badge>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{event.scheduleItems?.length > 0 && (
						<Card className="shadow-none">
							<CardContent className="p-6">
								<h3 className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
									{t("sectionProgram")}
								</h3>
								<div className="space-y-2">
									{event.scheduleItems.map((item, index) => (
										<div key={index} className="flex gap-4 rounded-md border p-3">
											<div className="text-muted-foreground w-28 shrink-0 text-xs tabular-nums">
												{item.startTime || "-"}
												{item.endTime ? ` - ${item.endTime}` : ""}
											</div>
											<div className="min-w-0">
												<p className="text-sm font-medium">{item.title}</p>
												<p className="text-muted-foreground text-xs">
													{[item.speaker, item.location].filter(Boolean).join(" · ")}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="participants" className="mt-4">
					<Card className="shadow-none">
						<CardContent className="p-6">
							<EventParticipantsTab
								eventId={event.id}
								approvalRequired={event.approvalRequired}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="competitions" className="mt-4">
					<Card className="shadow-none">
						<CardContent className="p-6">
							<EventCompetitionsTab eventId={event.id} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="awards" className="mt-4">
					<Card className="shadow-none">
						<CardContent className="p-6">
							<EventAwardsTab eventId={event.id} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="gallery" className="mt-4">
					<Card className="shadow-none">
						<CardContent className="p-6">
							{!event.gallery?.length ? (
								<div className="rounded-lg border border-dashed p-10 text-center">
									<p className="text-muted-foreground text-sm">{t("noPhotos")}</p>
								</div>
							) : (
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
									{event.gallery.map((photo, index) => (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											key={photo.mediaId || index}
											src={
												/^(https?:|data:)/.test(photo.url)
													? photo.url
													: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")}/${photo.url.replace(/^\//, "")}`
											}
											alt={photo.name || `Photo ${index + 1}`}
											className="h-32 w-full rounded-md border object-cover"
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
