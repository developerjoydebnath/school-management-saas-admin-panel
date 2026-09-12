"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import InputField from "@/shared/components/form/InputField";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { Subject } from "@/shared/models/subject.model";
import { getLocalizedName } from "@/shared/utils/localization";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, ListTree, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	SyllabusFormValues,
	SyllabusModeEnum,
	SyllabusStatusEnum,
	syllabusSchema,
} from "../dto/syllabus.dto";
import { createSyllabus, updateSyllabus } from "../hooks/use-syllabus-mutations";

type Props = {
	id?: string;
	defaultValues: SyllabusFormValues;
	isEdit?: boolean;
};

const statusOptions = Object.values(SyllabusStatusEnum).map((value) => ({
	label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
	value,
}));

const createEmptyTopic = () => ({
	title: "",
	titleBn: "",
	description: "",
	estimatedClasses: 1,
	weightPercent: 100,
	progressPercent: 0,
	isCompleted: false,
});

const createEmptyChapter = (chapterNo = 1) => ({
	chapterNo,
	title: "",
	titleBn: "",
	pageRange: "",
	learningOutcome: "",
	weightPercent: 100,
	topics: [createEmptyTopic()],
});

const createEmptySubject = () => ({
	subjectId: "",
	teacherId: "",
	chapters: [createEmptyChapter()],
});

const normalizeOptionalString = (value?: string) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const normalizeSyllabusPayload = (data: SyllabusFormValues): SyllabusFormValues => ({
	...data,
	title: normalizeOptionalString(data.title),
	// A manual syllabus is a document only — never ship the (possibly
	// half-filled) subject scaffold the form keeps around for mode switching.
	content: data.mode === SyllabusModeEnum.MANUAL ? data.content : undefined,
	subjects: (data.mode === SyllabusModeEnum.MANUAL ? [] : data.subjects).map((subject) => ({
		...subject,
		teacherId: normalizeOptionalString(subject.teacherId),
		chapters: subject.chapters.map((chapter) => ({
			...chapter,
			titleBn: normalizeOptionalString(chapter.titleBn),
			pageRange: normalizeOptionalString(chapter.pageRange),
			learningOutcome: normalizeOptionalString(chapter.learningOutcome),
			topics: chapter.topics.map((topic) => ({
				...topic,
				titleBn: normalizeOptionalString(topic.titleBn),
				description: normalizeOptionalString(topic.description),
				weightPercent: Number(topic.weightPercent || 0),
				progressPercent: Number(topic.progressPercent || 0),
			})),
		})),
	})),
});

function SectionSelection({
	classId,
	sessionId,
	value,
	onChange,
}: {
	classId: string;
	sessionId?: string;
	value: string[];
	onChange: (value: string[]) => void;
}) {
	const { data: response, isLoading } = useSWR(
		classId && sessionId ? "/session-class-sections/setup" : null,
		{ classId, sessionId }
	);
	const setup = response?.data || response || null;
	const sections = useMemo(
		() =>
			(setup?.items || [])
				.filter((item: any) => item.sectionId && item.section && item.status !== "INACTIVE")
				.map((item: any) => ({
					id: item.sectionId,
					label: item.section?.name || item.section?.bnName || "Section",
					value: item.sectionId,
				})),
		[setup]
	);
	const sectionKey = sections.map((section: any) => section.id).join(",");

	useEffect(() => {
		if (isLoading) return;
		if (!value.length) return;
		const next = value.filter((id) => sections.some((section: any) => section.id === id));
		if (next.length !== value.length) onChange(next);
	}, [isLoading, onChange, sectionKey, sections, value]);

	if (!classId || !sessionId) {
		return (
			<p className="text-muted-foreground text-sm">
				Select a session and class to load available sections.
			</p>
		);
	}

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Loading sections...</p>;
	}

	if (!setup?.hasSections || sections.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No section selection is needed for this class.
			</p>
		);
	}

	return (
		<div className="flex flex-wrap gap-2">
			{sections.map((section: any) => {
				const selected = value.includes(section.id);
				return (
					<Button
						key={section.id}
						type="button"
						variant={selected ? "default" : "outline"}
						size="sm"
						className="h-8"
						onClick={() =>
							onChange(
								selected
									? value.filter((id) => id !== section.id)
									: [...value, section.id]
							)
						}
					>
						{section.label || section.name}
					</Button>
				);
			})}
		</div>
	);
}

export default function SyllabusForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Syllabus");
	const ft = useTranslations("Forms");

	const form = useForm<SyllabusFormValues>({
		resolver: zodResolver(syllabusSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "subjects",
	});

	// Editing an existing syllabus can mean a dozen subjects with dozens of
	// chapters each, so those start collapsed. A brand-new syllabus starts
	// with a single empty subject the user is about to fill in, so that one
	// starts open. Either way, newly appended subjects auto-open below.
	const [openSubjects, setOpenSubjects] = useState<string[]>(() =>
		isEdit ? [] : fields.map((f) => f.id)
	);
	const previousFieldsLength = useRef(fields.length);
	useEffect(() => {
		if (fields.length > previousFieldsLength.current) {
			const newField = fields[fields.length - 1];
			if (newField) setOpenSubjects((current) => [...current, newField.id]);
		}
		previousFieldsLength.current = fields.length;
	}, [fields]);

	const classId = form.watch("classId");
	const sessionId = form.watch("sessionId");
	const sectionIds = form.watch("sectionIds") || [];
	const subjects = form.watch("subjects") || [];
	const mode = form.watch("mode");
	const isManual = mode === SyllabusModeEnum.MANUAL;

	// Same option source SubjectSingleSelection uses, kept here just to
	// resolve each subject's picked name for the accordion header — the
	// select itself only ever gives the form a raw subjectId.
	const locale = useLocale();
	const { data: subjectListResponse } = useSWR(
		classId ? "/subjects/active-list" : null,
		{ classId }
	);
	const subjectNameById = useMemo(() => {
		const list = subjectListResponse?.data || subjectListResponse || [];
		const map = new Map<string, string>();
		for (const raw of list) {
			const subject = new Subject(raw);
			map.set(subject.id, getLocalizedName(subject.name, locale));
		}
		return map;
	}, [subjectListResponse, locale]);

	const previousClassId = useRef(classId);
	const previousSessionId = useRef(sessionId);

	useEffect(() => {
		if (
			(previousClassId.current && previousClassId.current !== classId) ||
			(previousSessionId.current && previousSessionId.current !== sessionId)
		) {
			// Deliberately no `shouldValidate` here. The form validates on submit
			// (reValidateMode only kicks in once submitted), so validating a field
			// we just programmatically emptied raises an error that the user's own
			// next selection cannot clear — the field would keep reading
			// "Exam is required" with a valid exam picked. Clear stale errors
			// instead and let submit do the validating.
			form.setValue("sectionIds", []);
			// The exam list is scoped by session + class, so a previously picked
			// exam may no longer be on offer.
			form.setValue("examId", "");
			form.setValue(
				"subjects",
				form.getValues("subjects").map((subject) => ({
					...subject,
					subjectId: "",
					teacherId: "",
				}))
			);
			form.clearErrors(["examId", "sectionIds", "subjects"]);
		}
		previousClassId.current = classId;
		previousSessionId.current = sessionId;
	}, [classId, sessionId, form]);

	console.log(form.formState.errors)

	const onSubmit = async (data: SyllabusFormValues) => {
		try {
			const payload = normalizeSyllabusPayload(data);
			if (isEdit && id) {
				await updateSyllabus(id, payload);
				toast.success(t("updateSuccess"));
			} else {
				await createSyllabus(payload);
				toast.success(t("addSuccess"));
			}
			router.push(PATHS.ACADEMICS.SYLLABUS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	const addChapter = (subjectIndex: number) => {
		const next = structuredClone(subjects);
		next[subjectIndex].chapters = [
			...(next[subjectIndex].chapters || []),
			{
				...createEmptyChapter((next[subjectIndex].chapters?.length || 0) + 1),
				weightPercent: 0,
			},
		];
		form.setValue("subjects", next, { shouldValidate: true });
	};

	const removeChapter = (subjectIndex: number, chapterIndex: number) => {
		const next = structuredClone(subjects);
		next[subjectIndex].chapters = next[subjectIndex].chapters.filter(
			(_: any, index: number) => index !== chapterIndex
		);
		form.setValue("subjects", next, { shouldValidate: true });
	};

	const addTopic = (subjectIndex: number, chapterIndex: number) => {
		const next = structuredClone(subjects);
		next[subjectIndex].chapters[chapterIndex].topics = [
			...(next[subjectIndex].chapters[chapterIndex].topics || []),
			{ ...createEmptyTopic(), weightPercent: 0 },
		];
		form.setValue("subjects", next, { shouldValidate: true });
	};

	const removeTopic = (
		subjectIndex: number,
		chapterIndex: number,
		topicIndex: number
	) => {
		const next = structuredClone(subjects);
		next[subjectIndex].chapters[chapterIndex].topics = next[subjectIndex].chapters[
			chapterIndex
		].topics.filter((_: any, index: number) => index !== topicIndex);
		form.setValue("subjects", next, { shouldValidate: true });
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editSyllabusTitle") : t("addSyllabusTitle")}</CardTitle>
					<CardDescription>{t("formDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="sessionId"
						label="Session"
						type="sessionSelect"
						placeholder="Select session"
						required
					/>
					<InputField
						control={form.control}
						name="classId"
						label="Class"
						type="classSelect"
						placeholder="Select class"
						dependencyId={sessionId}
						required
						disabled={isEdit}
					/>
					{/* Exams carry both a session and a class list, so the picker is
					    scoped by the two selected above — a Class 9 syllabus should
					    never offer an exam that Class 9 does not sit. */}
					<InputField
						control={form.control}
						name="examId"
						label="Exam"
						type="examSelect"
						placeholder={
							!sessionId || !classId ? "Select session and class first" : "Select exam"
						}
						dependencyId={sessionId}
						classId={classId}
						disabled={!sessionId || !classId}
						required
					/>
					<InputField
						control={form.control}
						name="title"
						label="Title"
						type="text"
						placeholder="e.g. Half Yearly syllabus"
					/>
					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						placeholder="Select status"
						options={statusOptions}
						required
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sections")}</CardTitle>
					<CardDescription>{t("sectionsDescription")}</CardDescription>
				</CardHeader>
				<CardContent>
					<SectionSelection
						classId={classId}
						sessionId={sessionId}
						value={sectionIds}
						onChange={(value) =>
							form.setValue("sectionIds", value, { shouldValidate: true })
						}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("syllabusMode")}</CardTitle>
					<CardDescription>{t("syllabusModeDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-3 @3xl/page:grid-cols-2">
					{[
						{
							value: SyllabusModeEnum.STRUCTURED,
							icon: ListTree,
							title: t("modeStructured"),
							description: t("modeStructuredDescription"),
						},
						{
							value: SyllabusModeEnum.MANUAL,
							icon: FileText,
							title: t("modeManual"),
							description: t("modeManualDescription"),
						},
					].map((option) => {
						const selected = mode === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => form.setValue("mode", option.value, { shouldValidate: true })}
								className={cn(
									"flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
									selected
										? "border-primary bg-primary/5"
										: "hover:bg-accent/5 border-border"
								)}
							>
								<span
									className={cn(
										"flex size-9 shrink-0 items-center justify-center rounded-md",
										selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
									)}
								>
									<option.icon className="size-4" />
								</span>
								<span className="min-w-0">
									<span className="block text-sm font-semibold">{option.title}</span>
									<span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
										{option.description}
									</span>
								</span>
							</button>
						);
					})}
				</CardContent>
			</Card>

			{isManual ? (
				<Card className="shadow-none ring-0">
					<CardHeader>
						<CardTitle>{t("syllabusDocument")}</CardTitle>
						<CardDescription>{t("syllabusDocumentDescription")}</CardDescription>
					</CardHeader>
					<CardContent>
						<InputField
							control={form.control}
							name="content"
							type="textEditor"
							documentMode
						/>
					</CardContent>
				</Card>
			) : (
				<Accordion
					type="multiple"
					value={openSubjects}
					onValueChange={setOpenSubjects}
					className="gap-4"
				>
					{fields.map((field, subjectIndex) => (
						<AccordionItem key={field.id} value={field.id} className="bg-card rounded-md border">
							<div className="has-data-[state=open]:border-b flex items-center gap-2 px-6 py-4">
								{/* AccordionTrigger's own Header wrapper has no width of its own —
							    without an explicit flex-1 ancestor it shrinks to fit the label,
							    trapping the chevron (which is ml-auto'd *inside* the trigger)
							    right next to the badge instead of at the row's far edge. */}
								<div className="min-w-0 flex-1">
									<AccordionTrigger className="py-0 hover:no-underline">
										<div className="flex min-w-0 items-center gap-2">
											<CardTitle className="min-w-0 truncate">
												{subjectNameById.get(subjects[subjectIndex]?.subjectId) || t("subjectPlan")}
											</CardTitle>
											<Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[11px] font-normal">
												{subjects[subjectIndex]?.chapters?.length || 0} ch
											</Badge>
										</div>
									</AccordionTrigger>
								</div>
								<ConfirmationModal
									onConfirm={() => remove(subjectIndex)}
									title="Remove subject?"
									description="This removes the subject along with all its chapters and topics from this syllabus."
									variant="destructive"
								>
									<AlertDialogTrigger asChild>
										<Button
											type="button"
											variant="destructive"
											size="icon-sm"
											className="shrink-0"
											disabled={fields.length === 1}
										>
											<Trash2 className="size-4" />
										</Button>
									</AlertDialogTrigger>
								</ConfirmationModal>
							</div>
							<AccordionContent className="space-y-4 px-6 pt-1 pb-6">
								<CardDescription>{t("subjectPlanDescription")}</CardDescription>
								<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
									<InputField
										control={form.control}
										name={`subjects.${subjectIndex}.subjectId`}
										label="Subject"
										type="subjectSingleSelect"
										placeholder="Select subject"
										dependencyId={classId}
										required
									/>
									<InputField
										control={form.control}
										name={`subjects.${subjectIndex}.teacherId`}
										label="Teacher"
										type="teacherSelect"
										placeholder="Select teacher"
									/>
								</div>

								{subjects[subjectIndex]?.chapters?.map((chapter: any, chapterIndex: number) => (
									<div
										key={`${subjectIndex}-${chapterIndex}`}
										className="space-y-4 rounded-md border p-4"
									>
										<div className="flex items-center justify-between gap-4">
											<p className="text-sm font-medium">
												Chapter {chapterIndex + 1}
											</p>
											<ConfirmationModal
												onConfirm={() => removeChapter(subjectIndex, chapterIndex)}
												title="Remove chapter?"
												description="This removes the chapter along with all its topics from this subject."
												variant="destructive"
											>
												<AlertDialogTrigger asChild>
													<Button
														type="button"
														variant="outline"
														size="icon-sm"
														disabled={subjects[subjectIndex].chapters.length === 1}
													>
														<Trash2 className="size-4" />
													</Button>
												</AlertDialogTrigger>
											</ConfirmationModal>
										</div>
										<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-5">
											<InputField
												control={form.control}
												name={`subjects.${subjectIndex}.chapters.${chapterIndex}.chapterNo`}
												label="Chapter No"
												type="number"
												placeholder="e.g. 1"
												required
											/>
											<InputField
												control={form.control}
												name={`subjects.${subjectIndex}.chapters.${chapterIndex}.title`}
												label="Chapter Title"
												type="text"
												placeholder="e.g. Algebra"
												required
											/>
											<InputField
												control={form.control}
												name={`subjects.${subjectIndex}.chapters.${chapterIndex}.titleBn`}
												label="Bangla Title"
												type="text"
												placeholder="e.g. বীজগণিত"
											/>
											<InputField
												control={form.control}
												name={`subjects.${subjectIndex}.chapters.${chapterIndex}.pageRange`}
												label="Page Range"
												type="text"
												placeholder="e.g. 12-24"
											/>
											<InputField
												control={form.control}
												name={`subjects.${subjectIndex}.chapters.${chapterIndex}.weightPercent`}
												label="Chapter Weight"
												type="number"
												placeholder="e.g. 40"
												required
											/>
										</div>
										<InputField
											control={form.control}
											name={`subjects.${subjectIndex}.chapters.${chapterIndex}.learningOutcome`}
											label="Learning Outcome"
											type="textarea"
											placeholder="Write expected learning outcomes"
										/>

										<div className="space-y-3">
											{chapter.topics?.map((_: any, topicIndex: number) => (
												<div
													key={`${subjectIndex}-${chapterIndex}-${topicIndex}`}
													className={cn(
														"grid grid-cols-1 gap-4 rounded-md bg-muted/30 p-3 @3xl/page:grid-cols-[1fr_120px_120px_auto]"
													)}
												>
													<InputField
														control={form.control}
														name={`subjects.${subjectIndex}.chapters.${chapterIndex}.topics.${topicIndex}.title`}
														label="Topic"
														type="text"
														placeholder="e.g. Linear equation"
														required
													/>
													<InputField
														control={form.control}
														name={`subjects.${subjectIndex}.chapters.${chapterIndex}.topics.${topicIndex}.estimatedClasses`}
														label="Classes"
														type="number"
														placeholder="e.g. 2"
														required
													/>
													<InputField
														control={form.control}
														name={`subjects.${subjectIndex}.chapters.${chapterIndex}.topics.${topicIndex}.weightPercent`}
														label="Weight"
														type="number"
														placeholder="e.g. 30"
														required
													/>
													<div className="flex items-end">
														<ConfirmationModal
															onConfirm={() => removeTopic(subjectIndex, chapterIndex, topicIndex)}
															title="Remove topic?"
															description="This removes the topic from this chapter."
															variant="destructive"
														>
															<AlertDialogTrigger asChild>
																<Button
																	type="button"
																	variant="outline"
																	size="icon-sm"
																	disabled={chapter.topics.length === 1}
																>
																	<Trash2 className="size-4" />
																</Button>
															</AlertDialogTrigger>
														</ConfirmationModal>
													</div>
												</div>
											))}
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => addTopic(subjectIndex, chapterIndex)}
											>
												<Plus className="size-4" />
												Add Topic
											</Button>
										</div>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() => addChapter(subjectIndex)}
								>
									<Plus className="size-4" />
									Add Chapter
								</Button>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}

			{!isManual ? (
				<div className="mt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => append(createEmptySubject())}
					>
						<Plus className="size-4" />
						Add Subject
					</Button>
				</div>
			) : null}

			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md bg-background/95 p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.ACADEMICS.SYLLABUS.ROOT)}
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
