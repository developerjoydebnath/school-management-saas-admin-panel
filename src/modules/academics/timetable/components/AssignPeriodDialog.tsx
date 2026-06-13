"use client";

import SubjectSingleSelection from "@/shared/components/form/SubjectSingleSelection";
import TeacherSelection from "@/shared/components/form/TeacherSelection";
import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getLocalizedName } from "@/shared/utils/localization";

interface AssignPeriodDialogProps {
	open: boolean;
	assigningPeriod: any;
	onClose: () => void;
	onAssign: (data: any) => void;
	onDelete: (day: string, id: string) => void;
	onChange: (data: any) => void;
}

export function AssignPeriodDialog({
	open,
	assigningPeriod,
	onClose,
	onAssign,
	onDelete,
	onChange,
}: AssignPeriodDialogProps) {
	const [localAssignments, setLocalAssignments] = useState<any[]>([]);
	const t = useTranslations("Timetable");
	const locale = useLocale();
	const ft = useTranslations("Forms");

	useEffect(() => {
		if (open && assigningPeriod) {
			const existing = assigningPeriod.assignment;
			if (Array.isArray(existing)) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setLocalAssignments(
					existing.length > 0
						? existing
						: [{ subjectId: "", teacherId: "", roomNumber: "" }]
				);
			} else if (existing) {
				setLocalAssignments([existing]);
			} else {
				setLocalAssignments([{ subjectId: "", teacherId: "", roomNumber: "" }]);
			}
		}
	}, [open, assigningPeriod]);

	if (!assigningPeriod && !open) return null;

	const handleAddMore = () => {
		setLocalAssignments([
			...localAssignments,
			{ subjectId: "", teacherId: "", roomNumber: "" },
		]);
	};

	const handleRemove = (index: number) => {
		setLocalAssignments(localAssignments.filter((_, i) => i !== index));
	};

	const updateAssignment = (index: number, field: string, value: string) => {
		const newAssignments = [...localAssignments];
		newAssignments[index] = { ...newAssignments[index], [field]: value };
		setLocalAssignments(newAssignments);
	};

	const isAssignDisabled = localAssignments.some((a) => !a.subjectId || !a.teacherId);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="gap-0 px-0 py-4 sm:max-w-[500px]">
				<DialogHeader className="border-b px-6 pb-4">
					<DialogTitle>{t("assignPeriod")}</DialogTitle>
					<DialogDescription className="text-muted-foreground text-xs">
						{assigningPeriod?.day} • {getLocalizedName(assigningPeriod?.period?.name, locale)} •{" "}
						{assigningPeriod?.period?.startTime}-{assigningPeriod?.period?.endTime}
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[80vh] px-6 py-6">
					<div className="space-y-4">
						{localAssignments.map((assignment, index) => (
							<div
								key={index}
								className="bg-accent/20 relative rounded-lg border p-4"
							>
								{localAssignments.length > 1 && (
									<Button
										variant="destructive"
										size="icon-xs"
										className="absolute top-1 right-1 h-6 w-6"
										onClick={() => handleRemove(index)}
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								)}
								<div className="space-y-4">
									<div className="space-y-2">
										<Label className="text-xs">Subject</Label>
										<SubjectSingleSelection
											value={assignment.subjectId || ""}
											onChange={(val) =>
												updateAssignment(index, "subjectId", val)
											}
										/>
									</div>
									<div className="grid grid-cols-1 gap-4">
										<div className="space-y-2">
											<Label className="text-xs">Teacher</Label>
											<TeacherSelection
												value={assignment.teacherId || ""}
												onChange={(val) =>
													updateAssignment(index, "teacherId", val)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs">Room Number</Label>
											<Input
												placeholder="e.g. 101"
												value={assignment.roomNumber || ""}
												onChange={(e) =>
													updateAssignment(
														index,
														"roomNumber",
														e.target.value
													)
												}
												className="h-10"
											/>
										</div>
									</div>
								</div>
							</div>
						))}

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handleAddMore}
						>
							<Plus className="h-4 w-4" />
							{t("addSubjectTeacher")}
						</Button>
					</div>
				</ScrollArea>
				<DialogFooter className="flex items-center justify-between border-t px-6 pt-4">
					{assigningPeriod?.assignment && (
						<ConfirmationModal
							onConfirm={() =>
								assigningPeriod &&
								onDelete(assigningPeriod.day, assigningPeriod.period.id)
							}
							title={t("clearAssignment")}
							description={t("clearAssignmentDesc")}
							confirmText={t("clear")}
							variant="destructive"
						>
							<AlertDialogTrigger
								render={
									<Button
										variant="ghost"
										size="sm"
										className="text-red-500 hover:bg-red-50 hover:text-red-600"
									>
										<Trash2 className="mr-2 size-4" /> {t("clearSlot")}
									</Button>
								}
							/>
						</ConfirmationModal>
					)}
					<div className="ml-auto flex gap-2">
						<Button variant="outline" size="sm" onClick={onClose}>
							{ft("cancel")}
						</Button>
						<Button
							size="sm"
							disabled={isAssignDisabled}
							onClick={() => onAssign(localAssignments)}
						>
							{ft("assign")}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
