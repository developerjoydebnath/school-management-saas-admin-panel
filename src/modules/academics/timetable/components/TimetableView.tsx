"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { ClassModel } from "@/shared/models/class.model";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssignPeriodDialog } from "./AssignPeriodDialog";
import { ClassesSelection } from "./ClassesSelection";
import { EditColumnDialog } from "./EditColumnDialog";
import { EmptyState } from "./EmptyState";
import { TimetableGrid } from "./TimetableGrid";
import { TimetableHeader } from "./TimetableHeader";

const DEFAULT_PERIODS = [
	{ id: "1", name: "Period 1", startTime: "08:00", endTime: "08:45", type: "Period" },
	{ id: "2", name: "Period 2", startTime: "08:45", endTime: "09:30", type: "Period" },
	{ id: "3", name: "Period 3", startTime: "09:30", endTime: "10:15", type: "Period" },
	{ id: "4", name: "Break", startTime: "10:15", endTime: "10:30", type: "Break" },
	{ id: "5", name: "Period 4", startTime: "10:30", endTime: "11:15", type: "Period" },
];

export default function TimetableView() {
	const { data: classes } = useSWR("/classes");
	const { data: timetables, mutate: mutateTimetables } = useSWR("/timetables");
	const t = useTranslations("Timetable");
	const ft = useTranslations("Forms");

	const [selectedClass, setSelectedClass] = useState<string | null>("");
	const [selectedSection, setSelectedSection] = useState<string | null>("ALL");

	// Periods State
	const [periods, setPeriods] = useState<any[]>(DEFAULT_PERIODS);

	// Assignments State (Day_PeriodId -> [{subject, teacher, roomNumber}])
	const [assignments, setAssignments] = useState<Record<string, any>>({});

	// Dialog States
	const [editingColumn, setEditingColumn] = useState<any | null>(null);
	const [assigningPeriod, setAssigningPeriod] = useState<any | null>(null);

	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [selectedSectionsToApply, setSelectedSectionsToApply] = useState<string[]>([]);

	const serializedClasses: ClassModel[] = classes?.map((cls: any) => new ClassModel(cls)) || [];
	const activeClass = serializedClasses?.find((c: ClassModel) => c.id === selectedClass);
	const sections = activeClass?.sections || [];

	const isSectionSelectionRequired = sections.length > 0 && selectedSection === "ALL";
	const disableActions = !selectedClass || isSectionSelectionRequired;

	useEffect(() => {
		if (selectedClass && timetables && !isSectionSelectionRequired) {
			const timetable = timetables.find((t: any) => {
				const matchesClass = t.classId === selectedClass;
				const matchesSection =
					selectedSection === "ALL"
						? t.section === null ||
							t.section === undefined ||
							(Array.isArray(t.section) && t.section.length === 0)
						: t.section === selectedSection ||
							(Array.isArray(t.section) && t.section.includes(selectedSection));
				return matchesClass && matchesSection;
			});

			if (timetable) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setPeriods(timetable.periods || DEFAULT_PERIODS);
				setAssignments(timetable.assignments || {});
			} else {
				setPeriods(DEFAULT_PERIODS);
				setAssignments({});
			}
		} else {
			setPeriods(DEFAULT_PERIODS);
			setAssignments({});
		}
	}, [selectedClass, selectedSection, timetables, isSectionSelectionRequired]);

	const handleAddColumn = () => {
		setEditingColumn({
			id: `new-${Date.now()}`,
			name: "",
			startTime: "",
			endTime: "",
			type: "Period",
		});
	};

	const handleSaveColumn = (data: any) => {
		if (periods.find((p) => p.id === data.id)) {
			setPeriods(periods.map((p) => (p.id === data.id ? data : p)));
		} else {
			setPeriods([...periods, data]);
		}
		setEditingColumn(null);
	};

	const handleDeleteColumn = (id: string) => {
		setPeriods(periods.filter((p) => p.id !== id));
		setEditingColumn(null);
		toast.success("Column deleted");
	};

	const { data: subjectsData } = useSWR("/subjects");
	const { data: teachersData } = useSWR("/teachers");

	const handleAssignPeriod = (data: any[]) => {
		if (!assigningPeriod) return;

		const enrichedData = data.map((item) => {
			const subject = subjectsData?.find((s: any) => s.id === item.subjectId);
			const teacher = teachersData?.find((t: any) => t.id === item.teacherId);
			return {
				...item,
				subjectName: subject?.name || item.subjectId,
				teacherName: teacher?.name || item.teacherId,
			};
		});

		const key = `${assigningPeriod.day}_${assigningPeriod.period.id}`;
		setAssignments({
			...assignments,
			[key]: enrichedData,
		});
		setAssigningPeriod(null);
	};

	const handleDeleteAssignment = (day: string, id: string) => {
		const key = `${day}_${id}`;
		const newAssignments = { ...assignments };
		delete newAssignments[key];
		setAssignments(newAssignments);
		setAssigningPeriod(null);
		toast.success("Assignment cleared");
	};

	const handleSaveTimetable = () => {
		if (sections.length > 0) {
			setSelectedSectionsToApply([selectedSection!]);
			setSaveDialogOpen(true);
		} else {
			saveTimetableDirectly();
		}
	};

	const saveTimetableDirectly = async () => {
		try {
			const payload = {
				classId: selectedClass,
				section: null,
				periods,
				assignments,
			};

			const existingTimetable = timetables?.find(
				(t: any) =>
					t.classId === selectedClass && (t.section === null || t.section === undefined)
			);

			if (existingTimetable) {
				await axios.put(`/timetables/${existingTimetable.id}`, {
					...payload,
					id: existingTimetable.id,
				});
			} else {
				await axios.post("/timetables", payload);
			}
			mutateTimetables();
			toast.success("Timetable saved successfully");
		} catch (error) {
			toast.error("Failed to save timetable");
		}
	};

	const handleConfirmSave = async () => {
		try {
			for (const sec of selectedSectionsToApply) {
				const payload = {
					classId: selectedClass,
					section: sec,
					periods,
					assignments,
				};

				// Look for existing single-section or multi-section matches to overwrite properly
				let existingTimetable = timetables?.find(
					(t: any) => t.classId === selectedClass && t.section === sec
				);

				if (!existingTimetable) {
					existingTimetable = timetables?.find(
						(t: any) =>
							t.classId === selectedClass &&
							Array.isArray(t.section) &&
							t.section.includes(sec)
					);
				}

				if (existingTimetable) {
					await axios.put(`/timetables/${existingTimetable.id}`, {
						...payload,
						id: existingTimetable.id,
					});
				} else {
					await axios.post("/timetables", payload);
				}
			}
			mutateTimetables();
			setSaveDialogOpen(false);
			toast.success(`Timetable saved for sections: ${selectedSectionsToApply.join(", ")}`);
		} catch (error) {
			toast.error("Failed to save timetable");
		}
	};

	return (
		<div className="flex w-full min-w-0 flex-col gap-6">
			<ClassesSelection
				classes={serializedClasses}
				selectedClass={selectedClass}
				onSelectClass={(id) => {
					setSelectedClass(id);
					setSelectedSection("ALL");
				}}
			/>

			<Card className="w-full min-w-0 gap-0 overflow-hidden border p-0 shadow-none ring-0">
				<TimetableHeader
					sections={sections}
					selectedSection={selectedSection}
					onSelectSection={setSelectedSection}
					onAddColumn={handleAddColumn}
					disableActions={disableActions}
					onSave={handleSaveTimetable}
				/>

				<CardContent className="p-0">
					{!selectedClass ? (
						<EmptyState />
					) : isSectionSelectionRequired ? (
						<div className="text-muted-foreground flex h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<div className="bg-accent/50 rounded-full p-4">
								<svg
									className="text-muted-foreground/60 h-8 w-8"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
							</div>
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

			{/* Dialogs */}
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


			{/* Save Apply to Sections Dialog */}
			<Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("saveTimetable")}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm">{t("applyTimeTable")}</p>
						<div className="space-y-2">
							{sections.map((sec: any) => (
								<div key={sec.name} className="flex items-center space-x-2">
									<Checkbox
										id={`sec-${sec.name}`}
										checked={selectedSectionsToApply.includes(sec.name)}
										onCheckedChange={(checked) => {
											if (checked) {
												setSelectedSectionsToApply([
													...selectedSectionsToApply,
													sec.name,
												]);
											} else {
												setSelectedSectionsToApply(
													selectedSectionsToApply.filter(
														(s) => s !== sec.name
													)
												);
											}
										}}
									/>
									<label
										htmlFor={`sec-${sec.name}`}
										className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Section {sec.name}{" "}
										{sec.name === selectedSection && "(Current)"}
									</label>
								</div>
							))}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
							{ft("cancel")}
						</Button>
						<Button
							onClick={handleConfirmSave}
							disabled={selectedSectionsToApply.length === 0}
						>
							{t("saveTimetable")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
