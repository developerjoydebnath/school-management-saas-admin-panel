"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import HomeworkAttachments from "@/modules/academics/homework/components/HomeworkAttachments";
import { GRADED_TYPES, homeworkTypeOptions } from "@/modules/academics/homework/dto/homework.dto";
import { BookOpenCheck, ClipboardList, FolderKanban, NotebookPen, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import {
	HomeworkTypeEnum,
	LessonPlanFormValues,
	LessonWorkItemValues,
} from "../dto/lesson-plan.dto";

const workTypeIcons: Record<HomeworkTypeEnum, typeof BookOpenCheck> = {
	[HomeworkTypeEnum.HOMEWORK]: BookOpenCheck,
	[HomeworkTypeEnum.ASSIGNMENT]: ClipboardList,
	[HomeworkTypeEnum.CLASSWORK]: NotebookPen,
	[HomeworkTypeEnum.PROJECT]: FolderKanban,
};

/** Typed builder for the dynamic `homeworkItems.<TYPE>.<field>` paths react-hook-form needs. */
function workField<K extends keyof LessonWorkItemValues>(type: HomeworkTypeEnum, key: K) {
	return `homeworkItems.${type}.${key}` as `homeworkItems.${HomeworkTypeEnum}.${K}`;
}

interface LessonWorkSectionProps {
	form: UseFormReturn<LessonPlanFormValues>;
	homeworkTypes: HomeworkTypeEnum[];
	toggleWorkType: (type: HomeworkTypeEnum) => void;
	lessonDate: string;
}

export default function LessonWorkSection({
	form,
	homeworkTypes,
	toggleWorkType,
	lessonDate,
}: LessonWorkSectionProps) {
	const t = useTranslations("LessonPlans");
	const th = useTranslations("Homework");

	return (
		<Card className="shadow-none ring-0">
			<CardHeader>
				<CardTitle>{t("attachWorkSection")}</CardTitle>
				<CardDescription>{t("attachWorkSectionDescription")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex flex-wrap gap-2">
					{homeworkTypeOptions.map((option) => {
						const type = option.value;
						const Icon = workTypeIcons[type];
						const active = homeworkTypes.includes(type);
						return (
							<Button
								key={type}
								type="button"
								variant={active ? "default" : "outline"}
								onClick={() => toggleWorkType(type)}
							>
								<Icon className="size-4" />
								{option.label}
							</Button>
						);
					})}
				</div>

				{homeworkTypes.map((type) => {
					const label = homeworkTypeOptions.find((option) => option.value === type)?.label || type;
					const isGraded = GRADED_TYPES.includes(type);
					const attachments = form.watch(workField(type, "attachments")) || [];

					return (
						<div key={type} className="bg-card/70 space-y-4 rounded-md border p-4">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold">{label}</h3>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => toggleWorkType(type)}
								>
									<X className="size-3.5" />
									{t("removeWork")}
								</Button>
							</div>

							<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
								<InputField
									control={form.control}
									name={workField(type, "title")}
									label={th("homeworkTitle")}
									type="text"
									required
								/>
								<InputField
									control={form.control}
									name={workField(type, "titleBn")}
									label={th("titleBn")}
									type="text"
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
								<InputField
									control={form.control}
									name={workField(type, "dueDate")}
									label={th("dueDate")}
									type="date"
									min={lessonDate || undefined}
									required
								/>
								<InputField
									control={form.control}
									name={workField(type, "totalMarks")}
									label={th("totalMarks")}
									type="number"
									min={0}
									required={isGraded}
									helperText={isGraded ? undefined : th("totalMarksHint")}
								/>
							</div>

							<div className="space-y-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{th("instructions")}
									<span>(Optional)</span>
								</Label>
								<InputField
									control={form.control}
									name={workField(type, "instructions")}
									type="textEditor"
									enableTables
									enableVoiceInput
								/>
							</div>

							<div className="space-y-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{th("attachmentsSection")}
									<span>(Optional)</span>
								</Label>
								<HomeworkAttachments
									value={attachments}
									onChange={(next) => {
										const currentItems = form.getValues("homeworkItems");
										form.setValue(
											"homeworkItems",
											{
												...currentItems,
												[type]: { ...currentItems[type], attachments: next },
											},
											{ shouldDirty: true }
										);
									}}
								/>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
