"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { ClassModel } from "@/shared/models/class.model";
import { useSessionStore } from "@/shared/stores/session-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { downloadTimetablePdf, saveTimetable } from "../hooks/use-timetable-mutations";
import { useCurrentTimetable } from "../hooks/use-timetables";
import { DAYS, TimetableCells, TimetableColumn } from "../types";
import { AssignPeriodDialog } from "./AssignPeriodDialog";
import { ClassesSelection } from "./ClassesSelection";
import { EditColumnDialog } from "./EditColumnDialog";
import { EmptyState } from "./EmptyState";
import { TimetableGrid } from "./TimetableGrid";
import { TimetableHeader } from "./TimetableHeader";

const DEFAULT_PERIODS: TimetableColumn[] = [
	{ id: "1", name: "Period 1", startTime: "08:00", endTime: "08:45", type: "Period" },
	{ id: "2", name: "Period 2", startTime: "08:45", endTime: "09:30", type: "Period" },
	{ id: "3", name: "Period 3", startTime: "09:30", endTime: "10:15", type: "Period" },
	{ id: "4", name: "Break", startTime: "10:15", endTime: "10:30", type: "Break" },
	{ id: "5", name: "Period 4", startTime: "10:30", endTime: "11:15", type: "Period" },
];

export default function TimetableView() {
	const t = useTranslations("Timetable");
	const locale = useLocale();
	const { selectedSessionId } = useSessionStore();
	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const { data: classesRes } = useSWR("/classes/active-list");
	const { data: subjectResponse } = useSWR("/subjects/active-list");
	const { data: roomResponse } = useSWR("/class-rooms/active-list");

	const sessions = useMemo(() => sessionsRes?.data || sessionsRes || [], [sessionsRes]);
	const sessionId =
		selectedSessionId ||
		sessions.find((session: any) => session.status === "ACTIVE")?.id ||
		sessions[0]?.id ||
		null;
	const classes = useMemo(() => classesRes?.data || classesRes || [], [classesRes]);
	const subjectsData = useMemo(
		() => subjectResponse?.data || subjectResponse || [],
		[subjectResponse]
	);
	const roomsData = useMemo(() => roomResponse?.data || roomResponse || [], [roomResponse]);

	const serializedClasses: ClassModel[] = useMemo(
		() => classes?.map((cls: any) => new ClassModel(cls)) || [],
		[classes]
	);

	const [selectedClass, setSelectedClass] = useState<string | null>("");
	const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
	const [periods, setPeriods] = useState<TimetableColumn[]>(DEFAULT_PERIODS);
	const [assignments, setAssignments] = useState<TimetableCells>({});
	const [editingColumn, setEditingColumn] = useState<TimetableColumn | null>(null);
	const [assigningPeriod, setAssigningPeriod] = useState<any | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);

	const activeClass = serializedClasses.find((c) => c.id === selectedClass);
	const sections = activeClass?.sections || [];
	const sectionKey = sections.map((section) => section.id).join(",");
	const activeSectionId = sections.length ? selectedSectionIds[0] || null : null;
	const isSectionSelectionRequired = sections.length > 0 && selectedSectionIds.length === 0;
	const disableActions = !sessionId || !selectedClass || isSectionSelectionRequired;
	const historyHref = useMemo(() => {
		const params = new URLSearchParams();
		if (sessionId) params.set("sessionId", sessionId);
		if (selectedClass) params.set("classId", selectedClass);
		if (selectedSectionIds[0]) params.set("sectionId", selectedSectionIds[0]);

		const query = params.toString();
		return query
			? `${PATHS.ACADEMICS.TIMETABLE.HISTORY}?${query}`
			: PATHS.ACADEMICS.TIMETABLE.HISTORY;
	}, [sessionId, selectedClass, selectedSectionIds]);

	const { data: timetableResponse, isLoading: isTimetableLoading } = useCurrentTimetable({
		sessionId,
		classId: selectedClass,
		sectionId: activeSectionId,
	});

	useEffect(() => {
		if (!selectedClass || !sections.length) {
			setSelectedSectionIds([]);
			return;
		}

		setSelectedSectionIds((current) => {
			const existing = current.filter((id) => sections.some((section) => section.id === id));
			const next = existing.length ? existing : [sections[0].id as string];
			const isSame =
				next.length === current.length && next.every((id, index) => id === current[index]);
			return isSame ? current : next;
		});
	}, [selectedClass, sectionKey]);

	useEffect(() => {
		if (!selectedClass || isSectionSelectionRequired || isTimetableLoading) return;

		const timetable = timetableResponse?.data || null;
		setPeriods(timetable?.columns || timetable?.periods || DEFAULT_PERIODS);
		setAssignments(timetable?.cells || timetable?.assignments || {});
	}, [selectedClass, isSectionSelectionRequired, isTimetableLoading, timetableResponse]);

	const handleToggleSection = (id: string) => {
		setSelectedSectionIds((current) =>
			current.includes(id)
				? current.filter((sectionId) => sectionId !== id)
				: [...current, id]
		);
	};

	const handleAddColumn = () => {
		setEditingColumn({
			id: `new-${Date.now()}`,
			name: "",
			startTime: "",
			endTime: "",
			type: "Period",
		});
	};

	const handleSaveColumn = (data: TimetableColumn) => {
		const normalized = {
			...data,
			id: data.id.startsWith("new-") ? `${Date.now()}` : data.id,
		};
		setPeriods((current) =>
			current.some((p) => p.id === data.id)
				? current.map((p) => (p.id === data.id ? normalized : p))
				: [...current, normalized]
		);
		setEditingColumn(null);
	};

	const handleDeleteColumn = (id: string) => {
		setPeriods((current) => current.filter((p) => p.id !== id));
		setAssignments((current) => {
			const next = { ...current };
			DAYS.forEach((day) => delete next[`${day}_${id}`]);
			return next;
		});
		setEditingColumn(null);
		toast.success("Column deleted");
	};

	const handleAssignPeriod = (data: any[]) => {
		if (!assigningPeriod) return;

		const enrichedData = data.map((item) => {
			const subject = subjectsData.find((s: any) => s.id === item.subjectId);
			const room = roomsData.find((r: any) => r.id === item.classRoomId);
			return {
				...item,
				subjectName: subject
					? {
							en: subject.enName || subject.name?.en || "",
							bn: subject.bnName || subject.name?.bn || "",
						}
					: item.subjectId,
				roomNumber: room?.roomNo || item.roomNumber || "",
			};
		});

		const key = `${assigningPeriod.day}_${assigningPeriod.period.id}`;
		setAssignments((current) => ({
			...current,
			[key]: enrichedData,
		}));
		setAssigningPeriod(null);
	};

	const handleDeleteAssignment = (day: string, id: string) => {
		const key = `${day}_${id}`;
		setAssignments((current) => {
			const next = { ...current };
			delete next[key];
			return next;
		});
		setAssigningPeriod(null);
		toast.success("Assignment cleared");
	};

	const handleSaveTimetable = async () => {
		if (!sessionId || !selectedClass) return;

		setIsSaving(true);
		try {
			await saveTimetable({
				sessionId,
				classId: selectedClass,
				sectionIds: sections.length ? selectedSectionIds : undefined,
				columns: periods,
				cells: assignments,
			});
			toast.success(t("saveSuccess"));
		} catch {
			// Global axios interceptor handles the error toast.
		} finally {
			setIsSaving(false);
		}
	};

	const handlePrintTimetable = async () => {
		if (!sessionId || !selectedClass) return;

		setIsPrinting(true);
		try {
			await downloadTimetablePdf({
				sessionId,
				classId: selectedClass,
				sectionIds: sections.length ? selectedSectionIds : undefined,
				locale,
				fileName: "class-timetable.pdf",
			});
		} catch {
			// Global axios interceptor handles non-blob errors.
		} finally {
			setIsPrinting(false);
		}
	};

	return (
		<div className="flex w-full min-w-0 flex-col gap-6">
			<ClassesSelection
				classes={serializedClasses}
				selectedClass={selectedClass}
				onSelectClass={(id) => {
					setSelectedClass(id);
					setSelectedSectionIds([]);
				}}
			/>

			<Card className="w-full min-w-0 gap-0 overflow-hidden border p-0 shadow-none ring-0">
				<TimetableHeader
					sections={sections}
					selectedSections={selectedSectionIds}
					onToggleSection={handleToggleSection}
					onAddColumn={handleAddColumn}
					historyHref={historyHref}
					onPrint={handlePrintTimetable}
					disableActions={disableActions}
					onSave={handleSaveTimetable}
					isSaving={isSaving}
					isPrinting={isPrinting}
				/>

				<CardContent className="p-0">
					{!selectedClass ? (
						<EmptyState />
					) : isSectionSelectionRequired ? (
						<div className="text-muted-foreground flex h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<div>
								<h3 className="text-foreground font-semibold">
									{t("selectASection")}
								</h3>
								<p className="mt-1 text-sm">{t("selectASectionDesc")}</p>
							</div>
						</div>
					) : (
						<TimetableGrid
							periods={periods}
							assignments={assignments}
							onEditColumn={setEditingColumn}
							onDeleteColumn={handleDeleteColumn}
							onAssignPeriod={(day, period, assignment) =>
								setAssigningPeriod({ day, period, assignment })
							}
							onReorderPeriods={(draggedId, targetId) => {
								const oldIndex = periods.findIndex((p) => p.id === draggedId);
								const newIndex = periods.findIndex((p) => p.id === targetId);
								if (oldIndex !== -1 && newIndex !== -1) {
									const newPeriods = [...periods];
									const [removed] = newPeriods.splice(oldIndex, 1);
									newPeriods.splice(newIndex, 0, removed);
									setPeriods(newPeriods);
								}
							}}
						/>
					)}
				</CardContent>
			</Card>

			<EditColumnDialog
				open={!!editingColumn}
				column={editingColumn}
				onClose={() => setEditingColumn(null)}
				onChange={setEditingColumn}
				onSave={handleSaveColumn}
				onDelete={handleDeleteColumn}
			/>

			<AssignPeriodDialog
				open={!!assigningPeriod}
				assigningPeriod={assigningPeriod}
				onClose={() => setAssigningPeriod(null)}
				onChange={setAssigningPeriod}
				onAssign={handleAssignPeriod}
				onDelete={handleDeleteAssignment}
			/>
		</div>
	);
}
