"use client";

import {
	ExamFormValues,
	ExamStatusEnum,
	examSchema,
	ExamTypeEnum,
} from "@/modules/examinations/schedule/dto/exam.dto";
import { createExam, updateExam } from "@/modules/examinations/schedule/hooks/use-exam-mutations";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	id?: string;
	defaultValues: ExamFormValues;
	isEdit?: boolean;
};

const examTypeOptions = Object.values(ExamTypeEnum).map((value) => ({
	label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
	value,
}));

const statusOptions = Object.values(ExamStatusEnum).map((value) => ({
	label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
	value,
}));

const toDateInputValue = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export default function ExamForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Exams");
	const ft = useTranslations("Forms");
	const today = useMemo(() => toDateInputValue(new Date()), []);

	const form = useForm<ExamFormValues>({
		resolver: zodResolver(examSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const startDate = form.watch("startDate");
	const endDate = form.watch("endDate");

	useEffect(() => {
		if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
			form.setValue("endDate", "", {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [endDate, form, startDate]);

	const onSubmit = async (data: ExamFormValues) => {
		try {
			if (isEdit && id) {
				await updateExam(id, data);
				toast.success(t("updateSuccess"));
			} else {
				await createExam(data);
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.EXAMINATIONS.SCHEDULE.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>
						{isEdit ? t("editDescription") : t("createDescription")}
					</CardDescription>
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
						name="name"
						label="Exam Name"
						type="text"
						placeholder="e.g. Half Yearly Examination"
						required
					/>
					<InputField
						control={form.control}
						name="nameBn"
						label="Bangla Name"
						type="text"
						placeholder="e.g. অর্ধবার্ষিক পরীক্ষা"
					/>
					<InputField
						control={form.control}
						name="type"
						label="Exam Type"
						type="select"
						placeholder="Select exam type"
						options={examTypeOptions}
						required
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
					<InputField
						control={form.control}
						name="gradingScale"
						label="Grading Scale"
						type="text"
						placeholder="e.g. gpa_5"
					/>
					<InputField
						control={form.control}
						name="startDate"
						label="Start Date"
						type="date"
						placeholder="Select start date"
						min={today}
						required
					/>
					<InputField
						control={form.control}
						name="endDate"
						label="End Date"
						type="date"
						placeholder={startDate ? "Select end date" : "Select start date first"}
						min={startDate || undefined}
						disabled={!startDate}
						required
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("classSelection")}</CardTitle>
					<CardDescription>{t("classSelectionDescription")}</CardDescription>
				</CardHeader>
				<CardContent>
					<InputField
						control={form.control}
						name="classIds"
						label="Classes"
						type="classSelection"
						placeholder="Select one or more classes"
						skipLocalization
						required
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("rules")}</CardTitle>
					<CardDescription>{t("rulesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="defaultTotalMarks"
							label="Default Total Marks"
							type="number"
							placeholder="e.g. 100"
						/>
						<InputField
							control={form.control}
							name="defaultPassMarks"
							label="Default Pass Marks"
							type="number"
							placeholder="e.g. 33"
						/>
					</div>
					<InputField
						control={form.control}
						name="instructions"
						label="Instructions"
						type="textEditor"
						placeholder="Add exam instructions"
					/>
					<InputField
						control={form.control}
						name="notes"
						label="Internal Notes"
						type="textarea"
						placeholder="Add internal notes"
					/>
				</CardContent>
			</Card>

			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md bg-background/95 p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.EXAMINATIONS.SCHEDULE.ROOT)}
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
