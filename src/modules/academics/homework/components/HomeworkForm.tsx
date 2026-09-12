"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { PATHS } from "@/shared/configs/paths.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	GRADED_TYPES,
	Homework,
	HomeworkFormValues,
	HomeworkStatusEnum,
	HomeworkTypeEnum,
	LessonPlanShortListItem,
	homeworkSchema,
	homeworkStatusOptions,
	homeworkTypeOptions,
} from "../dto/homework.dto";
import { createHomework, updateHomework } from "../hooks/use-homework-mutations";
import HomeworkAttachments from "./HomeworkAttachments";
import LessonPlanSelect from "./LessonPlanSelect";

const today = () => new Date().toISOString().slice(0, 10);

export default function HomeworkForm({
	initialData,
	isEdit = false,
}: {
	initialData?: Homework | null;
	isEdit?: boolean;
}) {
	const t = useTranslations("Homework");
	const ft = useTranslations("Forms");
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();

	const form = useForm<HomeworkFormValues>({
		resolver: zodResolver(homeworkSchema as any),
		shouldFocusError: false,
		defaultValues: {
			sessionId: initialData?.sessionId || selectedSessionId || "",
			classId: initialData?.classId || "",
			sectionId: initialData?.sectionId || "",
			subjectId: initialData?.subjectId || "",
			teacherId: initialData?.teacherId || "",
			lessonPlanId: initialData?.lessonPlanId || "",
			title: initialData?.title || "",
			titleBn: initialData?.titleBn || "",
			instructions: initialData?.instructions || "",
			type: initialData?.type || HomeworkTypeEnum.HOMEWORK,
			status: initialData?.status || HomeworkStatusEnum.DRAFT,
			assignedDate: initialData?.assignedDate?.slice(0, 10) || today(),
			dueDate: initialData?.dueDate?.slice(0, 10) || today(),
			totalMarks: initialData?.totalMarks ? Number(initialData.totalMarks) : undefined,
			attachments: initialData?.attachments || [],
		},
	});

	const sessionId = form.watch("sessionId");
	const classId = form.watch("classId");
	const sectionId = form.watch("sectionId");
	const subjectId = form.watch("subjectId");
	const assignedDate = form.watch("assignedDate");
	const type = form.watch("type");
	const attachments = form.watch("attachments") || [];
	const isGraded = GRADED_TYPES.includes(type);

	// Section and subject lists are scoped to the class, so a stale pick from a
	// previous class must be cleared. Errors are cleared rather than validated,
	// since validating a field we just emptied would leave a message the user's
	// own next selection cannot dismiss before the first submit.
	const previousClassId = useRef(classId);
	useEffect(() => {
		if (previousClassId.current && previousClassId.current !== classId) {
			form.setValue("sectionId", "");
			form.setValue("subjectId", "");
			form.clearErrors(["sectionId", "subjectId"]);
		}
		previousClassId.current = classId;
	}, [classId, form]);

	// The linked-lesson list is scoped to session/class/section/subject, so a
	// stale pick from a previous scope must be cleared rather than silently
	// kept pointed at a lesson outside the new scope.
	const previousLessonScope = useRef(`${sessionId}|${classId}|${sectionId}|${subjectId}`);
	useEffect(() => {
		const scope = `${sessionId}|${classId}|${sectionId}|${subjectId}`;
		if (previousLessonScope.current !== scope) {
			form.setValue("lessonPlanId", "");
		}
		previousLessonScope.current = scope;
	}, [sessionId, classId, sectionId, subjectId, form]);

	const handleSelectLesson = (lesson: LessonPlanShortListItem | null) => {
		if (!lesson) return;
		const typeLabel = homeworkTypeOptions.find((option) => option.value === type)?.label || "";
		form.setValue("title", typeLabel ? `${lesson.title} - ${typeLabel}` : lesson.title, {
			shouldDirty: true,
		});
		form.setValue("assignedDate", lesson.lessonDate.slice(0, 10), { shouldDirty: true });
	};

	const onSubmit = async (values: HomeworkFormValues) => {
		try {
			if (isEdit && initialData?.id) {
				await updateHomework(initialData.id, values);
				toast.success(t("updateSuccess"));
			} else {
				await createHomework(values);
				toast.success(t("addSuccess"));
			}
			router.push(PATHS.ACADEMICS.HOMEWORK.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editHomeworkTitle") : t("addHomeworkTitle")}</CardTitle>
					<CardDescription>{t("formDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="sessionId"
						label={t("session")}
						type="sessionSelect"
						placeholder={t("selectSession")}
						required
					/>
					<InputField
						control={form.control}
						name="classId"
						label={t("class")}
						type="classSelect"
						placeholder={t("selectClass")}
						dependencyId={sessionId}
						required
					/>
					<InputField
						control={form.control}
						name="sectionId"
						label={t("section")}
						type="sectionSelect"
						placeholder={t("allSections")}
						dependencyId={classId}
						sessionId={sessionId}
					/>
					<InputField
						control={form.control}
						name="subjectId"
						label={t("subject")}
						type="subjectSingleSelect"
						placeholder={t("selectSubject")}
						dependencyId={classId}
						required
					/>
					<InputField
						control={form.control}
						name="teacherId"
						label={t("teacher")}
						type="teacherSelect"
						placeholder={t("selectTeacher")}
					/>
					<InputField
						control={form.control}
						name="type"
						label={t("type")}
						type="select"
						placeholder={t("selectType")}
						options={homeworkTypeOptions}
						required
					/>
					<div className="flex w-full flex-col gap-2">
						<Label className="text-muted-foreground text-sm font-medium">
							{t("lesson")}
							<span>(Optional)</span>
						</Label>
						<LessonPlanSelect
							value={form.watch("lessonPlanId")}
							onChange={(value) => form.setValue("lessonPlanId", value, { shouldDirty: true })}
							onSelectLesson={handleSelectLesson}
							sessionId={sessionId}
							classId={classId}
							sectionId={sectionId}
							subjectId={subjectId}
							placeholder={t("selectLesson")}
							noneLabel={t("noLessonOption")}
						/>
						<p className="text-muted-foreground text-xs">{t("lessonHint")}</p>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("detailsSection")}</CardTitle>
					<CardDescription>{t("detailsSectionDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="title"
							label={t("homeworkTitle")}
							type="text"
							placeholder="e.g. Chapter 2 exercise 2.1 - 2.3"
							required
						/>
						<InputField
							control={form.control}
							name="titleBn"
							label={t("titleBn")}
							type="text"
							placeholder="যেমন: দ্বিতীয় অধ্যায়ের অনুশীলনী"
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="assignedDate"
							label={t("assignedDate")}
							type="date"
							required
						/>
						<InputField
							control={form.control}
							name="dueDate"
							label={t("dueDate")}
							type="date"
							// The picker itself refuses earlier dates; zod still guards the submit.
							min={assignedDate || undefined}
							required
						/>
						<InputField
							control={form.control}
							name="status"
							label={t("status")}
							type="select"
							placeholder={t("selectStatus")}
							options={homeworkStatusOptions}
							required
						/>
					</div>

					{/* Offered on every type: assignments and projects must carry marks,
					    but a teacher may also want to score ordinary homework. Leaving
					    it empty keeps the work ungraded and disables the marks column
					    on the submissions sheet. */}
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="totalMarks"
							label={t("totalMarks")}
							type="number"
							placeholder="e.g. 20"
							min={0}
							required={isGraded}
							helperText={isGraded ? undefined : t("totalMarksHint")}
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-muted-foreground text-sm font-medium">
							{t("instructions")}
							<span>(Optional)</span>
						</Label>
						{/* Dictation matters most here: typing Bangla instructions for
						    several classes a day is the slow part of a teacher's routine. */}
						<InputField
							control={form.control}
							name="instructions"
							type="textEditor"
							enableTables
							enableVoiceInput
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("attachmentsSection")}</CardTitle>
					<CardDescription>{t("attachmentsSectionDescription")}</CardDescription>
				</CardHeader>
				<CardContent>
					<HomeworkAttachments
						value={attachments}
						onChange={(next) => form.setValue("attachments", next, { shouldDirty: true })}
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.ACADEMICS.HOMEWORK.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting
						? isEdit
							? ft("updateLoading")
							: ft("saveLoading")
						: isEdit
							? ft("update")
							: ft("save")}
				</Button>
			</div>
		</form>
	);
}
