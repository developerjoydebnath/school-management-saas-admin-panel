"use client";

import InputField from "@/shared/components/form/InputField";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	SyllabusFormValues,
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
	subjects: data.subjects.map((subject) => ({
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
	value,
	onChange,
}: {
	classId: string;
	value: string[];
	onChange: (value: string[]) => void;
}) {
	const { data: response } = useSWR("/classes/active-list");
	const classes = response?.data || response || [];
	const selectedClass = classes.find((item: any) => item.id === classId);
	const sections = selectedClass?.sections || [];

	if (!classId || sections.length === 0) {
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
						{section.name}
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

	const classId = form.watch("classId");
	const sectionIds = form.watch("sectionIds") || [];
	const subjects = form.watch("subjects") || [];
	const previousClassId = useRef(classId);

	useEffect(() => {
		if (previousClassId.current && previousClassId.current !== classId) {
			form.setValue("sectionIds", [], { shouldValidate: true });
			form.setValue(
				"subjects",
				form.getValues("subjects").map((subject) => ({
					...subject,
					subjectId: "",
					teacherId: "",
				})),
				{ shouldValidate: true }
			);
		}
		previousClassId.current = classId;
	}, [classId, form]);

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
						required
						disabled={isEdit}
					/>
					<InputField
						control={form.control}
						name="examId"
						label="Exam"
						type="examSelect"
						placeholder="Select exam"
						dependencyId={form.watch("sessionId")}
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
						value={sectionIds}
						onChange={(value) =>
							form.setValue("sectionIds", value, { shouldValidate: true })
						}
					/>
				</CardContent>
			</Card>

			<div className="space-y-4">
				{fields.map((field, subjectIndex) => (
					<Card key={field.id} className="shadow-none ring-0">
						<CardHeader className="flex-row items-start justify-between gap-4">
							<div>
								<CardTitle>{t("subjectPlan")}</CardTitle>
								<CardDescription>{t("subjectPlanDescription")}</CardDescription>
							</div>
							<Button
								type="button"
								variant="destructive"
								size="icon-sm"
								disabled={fields.length === 1}
								onClick={() => remove(subjectIndex)}
							>
								<Trash2 className="size-4" />
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
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
										<Button
											type="button"
											variant="outline"
											size="icon-sm"
											disabled={subjects[subjectIndex].chapters.length === 1}
											onClick={() => removeChapter(subjectIndex, chapterIndex)}
										>
											<Trash2 className="size-4" />
										</Button>
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
													<Button
														type="button"
														variant="outline"
														size="icon-sm"
														disabled={chapter.topics.length === 1}
														onClick={() =>
															removeTopic(subjectIndex, chapterIndex, topicIndex)
														}
													>
														<Trash2 className="size-4" />
													</Button>
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
						</CardContent>
					</Card>
				))}
				<Button
					type="button"
					variant="outline"
					onClick={() => append(createEmptySubject())}
				>
					<Plus className="size-4" />
					Add Subject
				</Button>
			</div>

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
