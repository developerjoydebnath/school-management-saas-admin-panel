"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { homeworkTypeOptions } from "@/modules/academics/homework/dto/homework.dto";
import {
	LESSON_PLAN_STATUS_TRANSITIONS,
	LessonPlan,
	LessonPlanFormValues,
	LessonPlanStatusEnum,
	HomeworkTypeEnum,
	lessonPlanSchema,
	lessonPlanStatusOptions,
	teachingMethodOptions,
} from "../dto/lesson-plan.dto";
import { createLessonPlan, updateLessonPlan } from "../hooks/use-lesson-plan-mutations";
import LessonWorkSection from "./LessonWorkSection";

const today = () => new Date().toISOString().slice(0, 10);

export default function LessonPlanForm({
	initialData,
	isEdit = false,
}: {
	initialData?: LessonPlan | null;
	isEdit?: boolean;
}) {
	const t = useTranslations("LessonPlans");
	const ft = useTranslations("Forms");
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();

	const form = useForm<LessonPlanFormValues>({
		resolver: zodResolver(lessonPlanSchema as any),
		shouldFocusError: false,
		defaultValues: {
			sessionId: initialData?.sessionId || selectedSessionId || "",
			classId: initialData?.classId || "",
			sectionId: initialData?.sectionId || "",
			subjectId: initialData?.subjectId || "",
			teacherId: initialData?.teacherId || "",
			title: initialData?.title || "",
			topic: initialData?.topic || "",
			lessonDate: initialData?.lessonDate?.slice(0, 10) || today(),
			startTime: initialData?.startTime || "",
			endTime: initialData?.endTime || "",
			learningOutcomes: initialData?.learningOutcomes || "",
			priorKnowledge: initialData?.priorKnowledge || "",
			teachingAids: initialData?.teachingAids || "",
			teachingMethods: initialData?.teachingMethods || [],
			introduction: initialData?.introduction || "",
			mainActivity: initialData?.mainActivity || "",
			evaluation: initialData?.evaluation || "",
			homeworkNote: initialData?.homeworkNote || "",
			teacherReflection: initialData?.teacherReflection || "",
			status: initialData?.status || LessonPlanStatusEnum.DRAFT,
			homeworkTypes: [],
			homeworkItems: {},
		},
	});

	const sessionId = form.watch("sessionId");
	const classId = form.watch("classId");
	const startTime = form.watch("startTime");
	const lessonDate = form.watch("lessonDate");
	const lessonTitle = form.watch("title");
	const homeworkTypes = form.watch("homeworkTypes");
	const previousStatus = initialData?.status ?? LessonPlanStatusEnum.DRAFT;

	// Only offered when creating a brand-new plan — editing an existing one
	// doesn't attach new work items through this form.
	const toggleWorkType = (type: HomeworkTypeEnum) => {
		const currentItems = form.getValues("homeworkItems");
		if (homeworkTypes.includes(type)) {
			form.setValue(
				"homeworkTypes",
				homeworkTypes.filter((t) => t !== type)
			);
			form.setValue("homeworkItems", { ...currentItems, [type]: undefined });
			return;
		}

		const typeLabel = homeworkTypeOptions.find((option) => option.value === type)?.label || "";
		form.setValue("homeworkTypes", [...homeworkTypes, type]);
		form.setValue("homeworkItems", {
			...currentItems,
			[type]: {
				title: lessonTitle && typeLabel ? `${lessonTitle} - ${typeLabel}` : "",
				titleBn: "",
				dueDate: lessonDate || today(),
				totalMarks: undefined,
				instructions: "",
				attachments: [],
			},
		});
	};

	// The status control only ever offers what the backend will actually
	// accept: the current value (a no-op) plus its allowed next states. A
	// brand-new plan starts from Draft's own transitions since create()
	// enforces the same rule.
	const allowedStatuses = [previousStatus, ...LESSON_PLAN_STATUS_TRANSITIONS[previousStatus]];
	const statusOptions = lessonPlanStatusOptions.filter((option) =>
		allowedStatuses.includes(option.value)
	);

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

	const onSubmit = async (values: LessonPlanFormValues) => {
		try {
			if (isEdit && initialData?.id) {
				await updateLessonPlan(initialData.id, values);
				toast.success(t("updateSuccess"));
			} else {
				await createLessonPlan(values);
				toast.success(t("addSuccess"));
			}
			router.push(PATHS.ACADEMICS.LESSON_PLANS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editLessonPlanTitle") : t("addLessonPlanTitle")}</CardTitle>
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
						name="status"
						label={t("status")}
						type="select"
						options={statusOptions}
						required
					/>
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
							label={t("lessonTitle")}
							type="text"
							placeholder="e.g. Photosynthesis - Lesson 1"
							required
						/>
						<InputField
							control={form.control}
							name="topic"
							label={t("topic")}
							type="text"
							placeholder="e.g. Chapter 3: Life Processes"
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="lessonDate"
							label={t("date")}
							type="date"
							required
						/>
						<InputField
							control={form.control}
							name="startTime"
							label={t("startTime")}
							type="time"
							required
						/>
						<InputField
							control={form.control}
							name="endTime"
							label={t("endTime")}
							type="time"
							min={startTime || undefined}
							required
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("preparationSection")}</CardTitle>
					<CardDescription>{t("preparationSectionDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="learningOutcomes"
							label={t("learningOutcomes")}
							type="textarea"
							placeholder={t("learningOutcomesPlaceholder")}
						/>
						<InputField
							control={form.control}
							name="priorKnowledge"
							label={t("priorKnowledge")}
							type="textarea"
							placeholder={t("priorKnowledgePlaceholder")}
						/>
					</div>
					<InputField
						control={form.control}
						name="teachingAids"
						label={t("teachingAids")}
						type="textarea"
						placeholder={t("teachingAidsPlaceholder")}
					/>
					<InputField
						control={form.control}
						name="teachingMethods"
						label={t("teachingMethods")}
						type="multi-checkbox"
						options={teachingMethodOptions}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("deliverySection")}</CardTitle>
					<CardDescription>{t("deliverySectionDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<InputField
						control={form.control}
						name="introduction"
						label={t("introduction")}
						type="textarea"
						placeholder={t("introductionPlaceholder")}
					/>
					<InputField
						control={form.control}
						name="mainActivity"
						label={t("mainActivity")}
						type="textarea"
						placeholder={t("mainActivityPlaceholder")}
					/>
					<InputField
						control={form.control}
						name="evaluation"
						label={t("evaluation")}
						type="textarea"
						placeholder={t("evaluationPlaceholder")}
					/>
				</CardContent>
			</Card>

			{isEdit ? (
				<Card className="shadow-none ring-0">
					<CardHeader>
						<CardTitle>{t("wrapUpSection")}</CardTitle>
						<CardDescription>{t("wrapUpSectionDescription")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<InputField
							control={form.control}
							name="homeworkNote"
							label={t("homeworkNote")}
							type="textarea"
							placeholder={t("homeworkNotePlaceholder")}
						/>
						<InputField
							control={form.control}
							name="teacherReflection"
							label={t("teacherReflection")}
							type="textarea"
							helperText={t("teacherReflectionHint")}
							placeholder={t("teacherReflectionPlaceholder")}
						/>
					</CardContent>
				</Card>
			) : (
				<LessonWorkSection
					form={form}
					homeworkTypes={homeworkTypes}
					toggleWorkType={toggleWorkType}
					lessonDate={lessonDate}
				/>
			)}

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.ACADEMICS.LESSON_PLANS.ROOT)}
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
