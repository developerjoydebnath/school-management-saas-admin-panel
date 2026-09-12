"use client";

import InputField from "@/shared/components/form/InputField";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { PATHS } from "@/shared/configs/paths.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	difficultyOptions,
	FIXED_MARK_TYPES,
	QuestionBankFormValues,
	QuestionBankItem,
	questionBankSchema,
	QuestionDifficultyEnum,
	QuestionStatusEnum,
	QuestionTypeEnum,
	questionTypeOptions,
	sectionOptions,
	statusOptions,
} from "../dto/question-bank.dto";
import { scaffoldForType } from "../dto/question-templates";
import { createQuestion, updateQuestion } from "../hooks/use-question-bank-mutations";
import QuestionPreview from "./QuestionPreview";
import QuestionStructureEditor from "./QuestionStructureEditor";
import QuestionTemplateGallery from "./QuestionTemplateGallery";

type Props = {
	question?: QuestionBankItem | null;
	/** Prefills class/subject when arriving from a filtered list. */
	defaults?: { classId?: string; subjectId?: string; chapter?: string };
};

const buildDefaults = (
	question?: QuestionBankItem | null,
	prefill?: Props["defaults"],
	sessionId?: string
): QuestionBankFormValues => ({
	sessionId: question?.sessionId || sessionId || "",
	classId: question?.classId || prefill?.classId || "",
	subjectId: question?.subjectId || prefill?.subjectId || "",
	chapter: question?.chapter || prefill?.chapter || "",
	section: question?.section || "",
	type: question?.type || QuestionTypeEnum.MCQ,
	difficulty: question?.difficulty || QuestionDifficultyEnum.MEDIUM,
	status: question?.status || QuestionStatusEnum.DRAFT,
	stimulus: question?.stimulus || "",
	body: question?.body || "",
	answer: question?.answer || "",
	notes: question?.notes || "",
	// Normalised on the way in: the schema applies defaults, so its output type
	// has these required while the stored shape leaves them optional.
	options: (question?.options || []).map((option) => ({
		key: option.key,
		text: option.text || "",
		isCorrect: !!option.isCorrect,
	})),
	statements: (question?.statements || []).map((statement) => ({
		label: statement.label,
		text: statement.text || "",
	})),
	subQuestions: (question?.subQuestions || []).map((sub) => ({
		label: sub.label,
		text: sub.text || "",
		marks: Number(sub.marks || 0),
		answer: sub.answer || "",
	})),
	pairs: (question?.pairs || []).map((pair) => ({
		left: pair.left || "",
		right: pair.right || "",
	})),
	marks: question?.marks ?? 1,
	source: question?.source || "",
	boardYear: question?.boardYear ?? undefined,
	tags: question?.tags || [],
});

export default function QuestionBankForm({ question, defaults }: Props) {
	const t = useTranslations("QuestionBank");
	const ft = useTranslations("Forms");
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();
	const isEdit = !!question;

	const form = useForm<QuestionBankFormValues>({
		resolver: zodResolver(questionBankSchema as any),
		shouldFocusError: false,
		defaultValues: buildDefaults(question, defaults, selectedSessionId || undefined),
	});

	// An existing question already has its shape; the gallery is for starting
	// a new one, so it opens collapsed when editing.
	const [templateId, setTemplateId] = useState<string | null>(null);
	const [showTemplates, setShowTemplates] = useState(!isEdit);

	const type = form.watch("type");
	const classId = form.watch("classId");
	const subQuestions = form.watch("subQuestions");
	const derivedMarks =
		type === QuestionTypeEnum.CREATIVE
			? (subQuestions || []).reduce((sum, sub) => sum + Number(sub.marks || 0), 0)
			: type === QuestionTypeEnum.MCQ || type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION
				? 1
				: null;

	/**
	 * Applies a template's scaffolding without touching the teacher's context.
	 * Class, subject, chapter and section survive switching template — losing
	 * them on every click would make the gallery hostile to use.
	 */
	const applyScaffold = (patch: Partial<QuestionBankFormValues>) => {
		Object.entries(patch).forEach(([key, value]) => {
			form.setValue(key as keyof QuestionBankFormValues, value as never, {
				shouldDirty: true,
			});
		});
	};

	const onSubmit = async (values: QuestionBankFormValues) => {
		try {
			if (isEdit && question) {
				await updateQuestion(question.id, values);
				toast.success(t("updateSuccess"));
			} else {
				await createQuestion(values);
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.EXAMINATIONS.QUESTION_BANK.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
			<Card className="shadow-none">
				<CardHeader className="flex flex-row items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="flex items-center gap-2 text-base">
							<Sparkles className="text-muted-foreground size-4" />
							{t("templatesTitle")}
						</CardTitle>
						<p className="text-muted-foreground text-sm">{t("templatesDescription")}</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setShowTemplates((open) => !open)}
					>
						{showTemplates ? t("hideTemplates") : t("showTemplates")}
					</Button>
				</CardHeader>
				{showTemplates && (
					<CardContent>
						<QuestionTemplateGallery
							activeId={templateId}
							onPick={(template) => {
								setTemplateId(template.id);
								applyScaffold(template.build());
							}}
						/>
					</CardContent>
				)}
			</Card>

			<div className="grid grid-cols-1 gap-6 @5xl/page:grid-cols-[1fr_380px] @5xl/page:items-start">
				<div className="min-w-0 space-y-6">
					<Card className="shadow-none">
						<CardHeader>
							<CardTitle className="text-base">{t("sectionPlacement")}</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
							<InputField
								control={form.control}
								name="classId"
								label={t("class")}
								type="classSelect"
								// `classSelect` scopes by session, not by class — its
								// dependencyId is the sessionId.
								dependencyId={selectedSessionId || undefined}
								required
							/>
							<InputField
								control={form.control}
								name="subjectId"
								label={t("subject")}
								type="subjectSingleSelect"
								dependencyId={classId}
								required
							/>
							<InputField
								control={form.control}
								name="chapter"
								label={t("chapter")}
								type="text"
								placeholder={t("chapterPlaceholder")}
								helperText={t("chapterHint")}
							/>
							<InputField
								control={form.control}
								name="section"
								label={t("paperSection")}
								type="native_select"
								options={[{ label: t("noSection"), value: "" }, ...sectionOptions]}
							/>
						</CardContent>
					</Card>

					<Card className="shadow-none">
						<CardHeader className="flex flex-row items-center justify-between gap-3">
							<CardTitle className="text-base">{t("sectionQuestion")}</CardTitle>
							{derivedMarks !== null && (
								<Badge variant="secondary" className="font-normal">
									{t("autoMarks", { total: derivedMarks })}
								</Badge>
							)}
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
								{/* A Controller rather than InputField: choosing a type has to
								    re-scaffold the structure below, and that side effect has
								    nowhere to live in the shared field component. */}
								<Controller
									control={form.control}
									name="type"
									render={({ field, fieldState }) => (
										<div className="flex w-full flex-col gap-2">
											<Label className="text-muted-foreground w-full gap-0 text-sm font-medium">
												{t("type")}
												<span className="text-destructive">*</span>
											</Label>
											<NativeSelect
												name={field.name}
												value={field.value}
												onChange={(event) => {
													const next = event.target.value as QuestionTypeEnum;
													field.onChange(next);
													// Without this the editor keeps the previous
													// type's shape — an MCQ's options sitting under
													// a creative question.
													setTemplateId(null);
													applyScaffold(scaffoldForType(next));
												}}
												className={fieldState.error ? "border-destructive" : undefined}
											>
												{questionTypeOptions.map((option) => (
													<NativeSelectOption key={option.value} value={option.value}>
														{t(`typeValue.${option.value}`)}
													</NativeSelectOption>
												))}
											</NativeSelect>
											{fieldState.error && (
												<p className="text-destructive text-sm">
													{fieldState.error.message}
												</p>
											)}
										</div>
									)}
								/>
								<InputField
									control={form.control}
									name="difficulty"
									label={t("difficulty")}
									type="native_select"
									options={difficultyOptions.map((option) => ({
										label: t(`difficultyValue.${option.value}`),
										value: option.value,
									}))}
								/>
							</div>

							{/* The উদ্দীপক. Rich text because a stimulus is a real passage,
							    often with formatting the paper must preserve. */}
							<InputField
								control={form.control}
								name="stimulus"
								label={t("stimulus")}
								type="textEditor"
								helperText={t("stimulusHint")}
							/>

							<InputField
								control={form.control}
								name="body"
								label={t("body")}
								type="textEditor"
								helperText={t("bodyHint")}
								required
							/>

							<QuestionStructureEditor form={form} type={type} />

							{!FIXED_MARK_TYPES.has(type) && (
								<InputField
									control={form.control}
									name="marks"
									label={t("marks")}
									type="number"
									min={1}
									max={200}
								/>
							)}
						</CardContent>
					</Card>

					<Card className="shadow-none">
						<CardHeader>
							<CardTitle className="text-base">{t("sectionAnswer")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* True/false writes `answer` from its own control, so the free
							    text box would fight it. */}
							{type !== QuestionTypeEnum.TRUE_FALSE && (
								<InputField
									control={form.control}
									name="answer"
									label={t("answer")}
									type="textEditor"
									helperText={t("answerHint")}
								/>
							)}
							<InputField
								control={form.control}
								name="notes"
								label={t("notes")}
								type="textarea"
								placeholder={t("notesPlaceholder")}
							/>
						</CardContent>
					</Card>

					<Card className="shadow-none">
						<CardHeader>
							<CardTitle className="text-base">{t("sectionMeta")}</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
							<InputField
								control={form.control}
								name="source"
								label={t("source")}
								type="text"
								placeholder={t("sourcePlaceholder")}
								helperText={t("sourceHint")}
							/>
							<InputField
								control={form.control}
								name="boardYear"
								label={t("boardYear")}
								type="number"
								min={1900}
								max={2200}
							/>
							<InputField
								control={form.control}
								name="tags"
								label={t("tags")}
								type="tags"
								helperText={t("tagsHint")}
								fieldClass="col-span-full"
							/>
							<InputField
								control={form.control}
								name="status"
								label={t("status")}
								type="native_select"
								options={statusOptions.map((option) => ({
									label: t(`statusValue.${option.value}`),
									value: option.value,
								}))}
								helperText={t("statusHint")}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Live preview: the paper is the deliverable, so seeing the question
				    as it will print is worth a permanent column. */}
				<div className="min-w-0 @5xl/page:sticky @5xl/page:top-4">
					<Card className="shadow-none">
						<CardHeader>
							<CardTitle className="text-base">{t("previewTitle")}</CardTitle>
							<p className="text-muted-foreground text-sm">{t("previewDescription")}</p>
						</CardHeader>
						<CardContent>
							<QuestionPreview values={form.watch()} />
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="bg-background/80 sticky bottom-4 z-[1200] flex justify-end gap-3 rounded-lg border p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.EXAMINATIONS.QUESTION_BANK.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
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
