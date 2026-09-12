"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { useSessionStore } from "@/shared/stores/session-store";
import { FileDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Holiday } from "../dto/holiday.dto";
import { useHoliday } from "../hooks/use-holidays";
import AcademicCalendarSettingsDialog from "./AcademicCalendarSettingsDialog";
import CopyHolidaysDialog from "./CopyHolidaysDialog";
import SeedDefaultHolidaysDialog from "./SeedDefaultHolidaysDialog";
import HolidayCalendarView from "./HolidayCalendarView";
import HolidayDayDialog from "./HolidayDayDialog";
import HolidayFormDialog from "./HolidayFormDialog";
import HolidayList from "./HolidayList";

export default function AcademicCalendarView() {
	const t = useTranslations("Holidays");
	const { selectedSessionId } = useSessionStore();
	const searchParams = useSearchParams();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
	const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

	// The day dialog is the calendar's single entry point: it shows what is
	// already on that date and hands off to the form for either action.
	const [dayDialogOpen, setDayDialogOpen] = useState(false);
	const [day, setDay] = useState<{
		date: string;
		holidays: Holiday[];
		isWeeklyOff: boolean;
	} | null>(null);

	const openCreate = (date?: string) => {
		setEditingHoliday(null);
		setPrefilledDate(date);
		setDayDialogOpen(false);
		setDialogOpen(true);
	};

	const openEdit = (holiday: Holiday) => {
		setEditingHoliday(holiday);
		setPrefilledDate(undefined);
		setDayDialogOpen(false);
		setDialogOpen(true);
	};

	const openDay = (date: string, holidays: Holiday[], isWeeklyOff: boolean) => {
		setDay({ date, holidays, isWeeklyOff });
		setDayDialogOpen(true);
	};

	// Deep-link from the combined School Calendar view (?editId=...) — jump
	// straight into this holiday's editor rather than making the admin
	// re-find it in the list.
	const { data: deepLinkedHoliday } = useHoliday(searchParams.get("editId") || undefined);
	useEffect(() => {
		if (deepLinkedHoliday) openEdit(deepLinkedHoliday);
		 
	}, [deepLinkedHoliday]);

	const exportQuery = selectedSessionId ? `?sessionId=${selectedSessionId}` : "";

	const handleExport = async (type: "pdf" | "ics") => {
		try {
			await downloadPdf(
				`/holidays/export/${type}${exportQuery}`,
				`academic-calendar.${type}`
			);
		} catch {
			toast.error(t("exportFailed"));
		}
	};

	return (
		<div className="space-y-4">
			<Tabs defaultValue="calendar">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<TabsList>
						<TabsTrigger value="calendar">{t("calendarTab")}</TabsTrigger>
						<TabsTrigger value="list">{t("listTab")}</TabsTrigger>
					</TabsList>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							title={t("exportPdf")}
							onClick={() => handleExport("pdf")}
						>
							<FileDown className="size-4" />
						</Button>
						<Button variant="outline" onClick={() => handleExport("ics")}>
							{t("exportIcs")}
						</Button>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.CREATE,
							]}
						>
							<SeedDefaultHolidaysDialog />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.CREATE,
							]}
						>
							<CopyHolidaysDialog />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.EDIT,
							]}
						>
							<AcademicCalendarSettingsDialog />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.CREATE,
							]}
						>
							<Button onClick={() => openCreate()}>
								<Plus className="size-4" />
								{t("addHoliday")}
							</Button>
						</PermissionGuard>
					</div>
				</div>

				<TabsContent value="calendar" className="mt-4">
					<Card className="p-6 shadow-none ring-0">
						<CardContent className="p-0">
							<HolidayCalendarView
								sessionId={selectedSessionId || undefined}
								onSelectDay={openDay}
								onEditHoliday={openEdit}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="list" className="mt-4">
					<Card className="p-6 shadow-none ring-0">
						<CardContent className="p-0">
							<HolidayList onEditHoliday={openEdit} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<HolidayDayDialog
				open={dayDialogOpen}
				onOpenChange={setDayDialogOpen}
				date={day?.date || null}
				holidays={day?.holidays || []}
				isWeeklyOff={day?.isWeeklyOff}
				onEditHoliday={openEdit}
				onAddHoliday={openCreate}
			/>

			<HolidayFormDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				holiday={editingHoliday}
				defaultDate={prefilledDate}
			/>
		</div>
	);
}
