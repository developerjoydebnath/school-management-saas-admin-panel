"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SchoolEvent } from "../dto/event.dto";
import EventCalendarView from "./EventCalendarView";
import EventDayDialog from "./EventDayDialog";
import EventList from "./EventList";

export default function EventsView() {
	const t = useTranslations("Events");
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();

	// The calendar's single entry point: a day click opens this, which shows
	// what is already scheduled and hands off to the form for either action.
	const [dayDialogOpen, setDayDialogOpen] = useState(false);
	const [day, setDay] = useState<{ date: string; events: SchoolEvent[] } | null>(null);

	// The form is a full page now, not a dialog — so "add"/"edit" are plain
	// navigations, and the calendar's prefilled date rides along as ?date=.
	const openCreate = (date?: string) => {
		setDayDialogOpen(false);
		router.push(
			date
				? `${PATHS.EVENTS.SCHEDULING.CREATE}?date=${date}`
				: PATHS.EVENTS.SCHEDULING.CREATE
		);
	};

	const openEdit = (event: SchoolEvent) => {
		setDayDialogOpen(false);
		router.push(PATHS.EVENTS.SCHEDULING.EDIT(event.id));
	};

	const openDay = (date: string, events: SchoolEvent[]) => {
		setDay({ date, events });
		setDayDialogOpen(true);
	};

	return (
		<div className="space-y-4">
			<Tabs defaultValue="calendar">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<TabsList>
						<TabsTrigger value="calendar">{t("calendarTab")}</TabsTrigger>
						<TabsTrigger value="list">{t("listTab")}</TabsTrigger>
					</TabsList>
					<PermissionGuard
						permissions={[
							PERMISSIONS.EVENTS.ALL,
							PERMISSIONS.EVENTS.SCHEDULING.ALL,
							PERMISSIONS.EVENTS.SCHEDULING.CREATE,
						]}
					>
						<Button onClick={() => openCreate()}>
							<Plus className="size-4" />
							{t("addEvent")}
						</Button>
					</PermissionGuard>
				</div>

				<TabsContent value="calendar" className="mt-4">
					<Card className="p-6 shadow-none ring-0">
						<CardContent className="p-0">
							<EventCalendarView
								sessionId={selectedSessionId || undefined}
								onSelectDay={openDay}
								onEditEvent={openEdit}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="list" className="mt-4">
					<Card className="p-6 shadow-none ring-0">
						<CardContent className="p-0">
							<EventList onEditEvent={openEdit} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<EventDayDialog
				open={dayDialogOpen}
				onOpenChange={setDayDialogOpen}
				date={day?.date || null}
				events={day?.events || []}
				onEditEvent={openEdit}
				onAddEvent={openCreate}
			/>
		</div>
	);
}
