"use client";

import InputField from "@/shared/components/form/InputField";
import SubjectTeacherSelect from "@/shared/components/form/SubjectTeacherSelect";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { saveSubjectTeacherSetup } from "../hooks/use-subject-teacher-assignment-mutations";
import { useSubjectTeacherSetup } from "../hooks/use-subject-teacher-assignments";

const formSchema = z.object({
	sessionId: z.string().min(1, "Session is required"),
	classId: z.string().min(1, "Class is required"),
	sectionId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const label = (value: unknown, locale: string) =>
	typeof value === "object" && value !== null
		? getLocalizedName(value, locale)
		: String(value ?? "");

export default function SubjectTeacherAssignmentView() {
	const t = useTranslations("SubjectTeacherAssignments");
	const locale = useLocale();
	const selectedSessionId = useSessionStore((state) => state.selectedSessionId);
	// subjectId -> teacherId. Absence of a key means that subject is unassigned.
	const [assignments, setAssignments] = useState<Record<string, string>>({});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema as any),
		defaultValues: { sessionId: selectedSessionId || "", classId: "", sectionId: "" },
	});

	useEffect(() => {
		if (selectedSessionId && !form.getValues("sessionId")) {
			form.setValue("sessionId", selectedSessionId);
		}
	}, [form, selectedSessionId]);

	const sessionId = form.watch("sessionId");
	const classId = form.watch("classId");
	const sectionId = form.watch("sectionId");

	// Section is scoped to the class, so a stale pick from a previous class
	// must be cleared — same reasoning as the homework/lesson-plan forms.
	const previousClassId = useRef(classId);
	useEffect(() => {
		if (previousClassId.current && previousClassId.current !== classId) {
			form.setValue("sectionId", "");
		}
		previousClassId.current = classId;
	}, [classId, form]);

	const { data: subjectsRes } = useSWR(
		classId ? "/subjects/active-list" : null,
		classId ? { classId } : undefined
	);
	const subjects: any[] = subjectsRes?.data || subjectsRes || [];

	const { data: setup, isLoading } = useSubjectTeacherSetup({ sessionId, classId, sectionId });

	useEffect(() => {
		if (!setup) {
			setAssignments({});
			return;
		}
		setAssignments(
			Object.fromEntries(setup.assignments.map((row) => [row.subjectId, row.teacherId]))
		);
	}, [setup]);

	const setTeacher = (subjectId: string, teacherId: string) => {
		setAssignments((current) => {
			if (!teacherId) {
				const next = { ...current };
				delete next[subjectId];
				return next;
			}
			return { ...current, [subjectId]: teacherId };
		});
	};

	const assignedCount = Object.keys(assignments).length;

	const onSubmit = async (values: FormValues) => {
		try {
			await saveSubjectTeacherSetup({
				sessionId: values.sessionId,
				classId: values.classId,
				sectionId: values.sectionId || undefined,
				assignments: subjects.map((subject) => ({
					subjectId: subject.id,
					teacherId: assignments[subject.id] || undefined,
				})),
			});
			toast.success(t("saveSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Users className="size-4" />
						{t("scopeTitle")}
					</CardTitle>
					<CardDescription>{t("scopeDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="sessionId"
						type="sessionSelect"
						label={t("session")}
						placeholder={t("selectSession")}
						required
					/>
					<InputField
						control={form.control}
						name="classId"
						type="classSelect"
						label={t("class")}
						placeholder={t("selectClass")}
						dependencyId={sessionId}
						required
					/>
					<InputField
						control={form.control}
						name="sectionId"
						type="sectionSelect"
						label={t("section")}
						placeholder={t("allSections")}
						dependencyId={classId}
						sessionId={sessionId}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="text-base">{t("assignmentsTitle")}</CardTitle>
					<CardDescription>
						{classId
							? t("assignmentsDescription", { count: assignedCount, total: subjects.length })
							: t("assignmentsEmptyHint")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!sessionId || !classId ? (
						<div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
							{t("selectScopeHint")}
						</div>
					) : isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : !subjects.length ? (
						<div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
							{t("noSubjects")}
						</div>
					) : (
						<div className="overflow-hidden rounded-md border">
							<div className="bg-muted/25 text-muted-foreground grid grid-cols-2 gap-3 border-b px-3 py-2 text-xs font-medium">
								<span>{t("subject")}</span>
								<span>{t("teacher")}</span>
							</div>
							<div className="divide-y">
								{subjects.map((subject) => (
									<div
										key={subject.id}
										className="grid grid-cols-2 items-center gap-3 px-3 py-2"
									>
										<span className="truncate text-sm font-medium">
											{label(subject.name ?? subject.enName, locale)}
										</span>
										<SubjectTeacherSelect
											subjectId={subject.id}
											value={assignments[subject.id] || ""}
											onChange={(value) => setTeacher(subject.id, value)}
											placeholder={t("selectTeacherPlaceholder")}
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end rounded-md p-4 shadow-lg backdrop-blur">
				<Button type="submit" disabled={form.formState.isSubmitting || !classId}>
					<Save className="size-4" />
					{form.formState.isSubmitting ? t("saving") : t("saveAssignments")}
				</Button>
			</div>
		</form>
	);
}
