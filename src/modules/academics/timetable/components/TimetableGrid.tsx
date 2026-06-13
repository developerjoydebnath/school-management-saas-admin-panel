"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { getLocalizedName } from "@/shared/utils/localization";
import { GripHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { DAYS } from "../types";

interface TimetableGridProps {
	periods: any[];
	assignments: Record<string, any>;
	onEditColumn: (period: any) => void;
	onDeleteColumn: (id: string) => void;
	onAssignPeriod: (day: string, period: any, assignment?: any) => void;
	onReorderPeriods: (draggedId: string, targetId: string) => void;
}

export function TimetableGrid({
	periods,
	assignments,
	onEditColumn,
	onDeleteColumn,
	onAssignPeriod,
	onReorderPeriods,
}: TimetableGridProps) {
	const t = useTranslations("Timetable");
	const locale = useLocale();
	const [draggedPeriodId, setDraggedPeriodId] = useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent, id: string) => {
		setDraggedPeriodId(id);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", id);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, targetId: string) => {
		e.preventDefault();
		if (draggedPeriodId && draggedPeriodId !== targetId) {
			onReorderPeriods(draggedPeriodId, targetId);
		}
		setDraggedPeriodId(null);
	};

	return (
		<div className="custom-scrollbar overflow-x-auto">
			<table className="w-full min-w-[1000px] border-collapse text-left text-sm">
				<thead className="bg-accent/30 text-muted-foreground sticky top-0 z-10 font-medium">
					<tr>
						<th className="bg-background text-foreground sticky left-0 z-20 w-[100px] border-r border-b p-3 text-center font-bold">
							{t("day")}
						</th>
						{periods.map((p) => (
							<th
								key={p.id}
								draggable
								onDragStart={(e) => handleDragStart(e, p.id)}
								onDragOver={handleDragOver}
								onDrop={(e) => handleDrop(e, p.id)}
								onDragEnd={() => setDraggedPeriodId(null)}
								className={cn(
									"group relative min-w-[140px] cursor-grab border-r border-b p-2 text-center align-top transition-colors last:border-r-0 active:cursor-grabbing",
									draggedPeriodId === p.id && "bg-accent/50 opacity-50"
								)}
							>
								<div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-30">
									<GripHorizontal className="h-3 w-3" />
								</div>
								<div className="mt-1.5 mb-1 flex flex-col items-center justify-center gap-1">
									<span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
										{getLocalizedName(p.name, locale)}
									</span>
									<span className="text-muted-foreground bg-accent rounded-full px-2 py-0.5 text-[10px] font-medium">
										{p.startTime}-{p.endTime}
									</span>
								</div>

								<div className="mt-1 flex justify-center gap-1">
									<Button
										variant="outline"
										size="icon-xs"
										className="h-5 w-5"
										onClick={() => onEditColumn(p)}
									>
										<Pencil className="size-2.5" />
									</Button>
									<ConfirmationModal
										onConfirm={() => onDeleteColumn(p.id)}
										title={t("deleteColumn")}
										description={t("deleteColumnDesc")}
										confirmText={t("delete")}
										variant="destructive"
									>
										<AlertDialogTrigger
											render={
												<Button
													variant="destructive"
													size="icon-xs"
													className="h-5 w-5"
												>
													<Trash2 className="size-3" />
												</Button>
											}
										/>
									</ConfirmationModal>
								</div>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{DAYS.map((day, dayIndex) => (
						<tr key={day} className="hover:bg-accent/5 group border-b last:border-0">
							<td className="bg-background text-muted-foreground group-hover:text-foreground sticky left-0 z-10 border-r p-2 text-center text-[11px] font-bold tracking-widest uppercase shadow-[1px_0_0_0_hsl(var(--border))] transition-colors">
								{t(day.toLowerCase()) || day}
							</td>
							{periods.map((p) => {
								const assignmentList = assignments[`${day}_${p.id}`] || [];

								if (
									p.type === "Break" ||
									p.type === "Lunch" ||
									p.type === "Assembly"
								) {
									if (dayIndex === 0) {
										return (
											<td
												key={p.id}
												rowSpan={DAYS.length}
												className="bg-accent/5 text-muted-foreground w-[100px] border-r p-2 text-center align-middle"
											>
												<div className="flex h-full items-center justify-center">
													<div className="flex flex-col items-center gap-4">
														<div
															className={cn(
																"h-10 w-1 rounded-full",
																p.type === "Break"
																	? "bg-orange-200"
																	: p.type === "Lunch"
																		? "bg-green-200"
																		: "bg-blue-200"
															)}
														/>
														<span
															className="text-muted-foreground/40 text-[9px] font-black tracking-[0.4em] uppercase"
															style={{
																writingMode: "vertical-lr",
																transform: "rotate(180deg)",
															}}
														>
															{getLocalizedName(p.name, locale)}
														</span>
														<div
															className={cn(
																"h-10 w-1 rounded-full",
																p.type === "Break"
																	? "bg-orange-200"
																	: p.type === "Lunch"
																		? "bg-green-200"
																		: "bg-blue-200"
															)}
														/>
													</div>
												</div>
											</td>
										);
									}
									return null;
								}

								return (
									<td
										key={p.id}
										className="group/cell relative min-h-[80px] border-r p-1.5 align-top last:border-r-0"
									>
										{assignmentList.length > 0 ? (
											<div
												onClick={() =>
													onAssignPeriod(day, p, assignmentList)
												}
												className="bg-accent/30 border-primary/20 hover:border-primary/60 hover:bg-accent/60 group/item relative flex h-full min-h-[70px] w-full cursor-pointer flex-col gap-1.5 overflow-hidden rounded-lg border p-2 transition-all"
											>
												{assignmentList.map(
													(assignment: any, idx: number) => (
														<div
															key={idx}
															className={cn(
																"flex flex-col",
																idx > 0 && "mt-0.5 border-t pt-1.5"
															)}
														>
															<div className="flex items-start justify-between gap-1">
																<span className="text-foreground line-clamp-1 text-xs leading-tight font-bold">
																	{getLocalizedName(
																		assignment.subjectName,
																		locale
																	)}
																</span>
																{assignment.roomNumber && (
																	<span className="bg-accent text-muted-foreground rounded px-2 py-1 text-xs leading-none font-semibold whitespace-nowrap">
																		Room -{" "}
																		{assignment.roomNumber}
																	</span>
																)}
															</div>
															<div className="mt-1 flex items-center gap-1.5">
																<div className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
																	{getLocalizedName(
																		assignment.teacherName,
																		locale
																	)
																		?.substring(0, 2)
																		.toUpperCase() || "?"}
																</div>
																<span className="text-muted-foreground line-clamp-1 text-[12px] leading-none font-medium">
																	{getLocalizedName(
																		assignment.teacherName,
																		locale
																	)}
																</span>
															</div>
														</div>
													)
												)}
											</div>
										) : (
											<div
												onClick={() => onAssignPeriod(day, p)}
												className="hover:border-primary/30 hover:bg-accent/60 text-foreground/20 hover:text-foreground/50 bg-accent/10 group/empty flex h-full min-h-[70px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-transparent transition-all"
											>
												<Plus className="h-5 w-5" />
											</div>
										)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
