"use client";

import { SubjectFormValues, subjectSchema } from "@/modules/academics/subjects/dto/subject.dto";
import { createSubject, updateSubject } from "@/modules/academics/subjects/hooks/use-subject-mutations";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { StatusEnum, SubjectMarkDivisionEnum, SubjectTypeEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	id?: string;
	defaultValues: SubjectFormValues;
	isEdit?: boolean;
};

const statusOptions = [
	{ label: "Active", value: StatusEnum.ACTIVE },
	{ label: "Inactive", value: StatusEnum.INACTIVE },
];

const subjectTypeOptions = [
	{ label: "Mandatory", value: SubjectTypeEnum.MANDATORY },
	{ label: "Optional", value: SubjectTypeEnum.OPTIONAL },
	{ label: "Practical", value: SubjectTypeEnum.PRACTICAL },
	{ label: "Fourth Subject", value: SubjectTypeEnum.FOURTH_SUBJECT },
	{ label: "Religion", value: SubjectTypeEnum.RELIGION },
	{ label: "Group Based", value: SubjectTypeEnum.GROUP_BASED },
];

const markDivisionOptions = [
	{ label: "Only Written", value: SubjectMarkDivisionEnum.WRITTEN },
	{ label: "Written + MCQ", value: SubjectMarkDivisionEnum.WRITTEN_MCQ },
	{
		label: "Written + MCQ + Practical",
		value: SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL,
	},
];

const groupOptions = [
	{ label: "General", value: "general" },
	{ label: "Science", value: "science" },
	{ label: "Humanities", value: "humanities" },
	{ label: "Business Studies", value: "business_studies" },
];

export default function SubjectForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Subjects");
	const ft = useTranslations("Forms");

	const form = useForm<SubjectFormValues>({
		resolver: zodResolver(subjectSchema as any),
		shouldFocusError: false,
		defaultValues,
	});
	const markDivision = form.watch("markDivision");
	const hasMcq =
		markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ ||
		markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL;
	const hasPractical = markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL;

	const onSubmit = async (data: SubjectFormValues) => {
		try {
			const submitHasMcq =
				data.markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ ||
				data.markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL;
			const submitHasPractical =
				data.markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL;
			const payload: SubjectFormValues = {
				...data,
				theoryMarks: data.writtenMarks || 0,
				mcqMarks: submitHasMcq ? data.mcqMarks || 0 : 0,
				mcqPassMarks: submitHasMcq ? data.mcqPassMarks || 0 : 0,
				practicalMarks: submitHasPractical ? data.practicalMarks || 0 : 0,
				practicalPassMarks: submitHasPractical ? data.practicalPassMarks || 0 : 0,
			};

			if (isEdit && id) {
				await updateSubject(id, payload);
				toast.success("Subject updated successfully");
			} else {
				await createSubject(payload);
				toast.success("Subject created successfully");
			}
			router.push(PATHS.ACADEMICS.SUBJECTS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>{isEdit ? t("editDescription") : t("createDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="enName"
						label="English Name"
						type="text"
						placeholder="e.g. Mathematics"
						required
					/>
					<InputField
						control={form.control}
						name="bnName"
						label="Bangla Name"
						type="text"
						placeholder="e.g. Gonit"
					/>
					<InputField
						control={form.control}
						name="code"
						label="Internal Code"
						type="text"
						placeholder="e.g. MATH-101"
					/>
					<InputField
						control={form.control}
						name="boardCode"
						label="Board Code"
						type="text"
						placeholder="e.g. 109"
					/>
					<InputField
						control={form.control}
						name="type"
						label="Type"
						type="select"
						placeholder="Select subject type"
						options={subjectTypeOptions}
						required
					/>
					<InputField
						control={form.control}
						name="group"
						label="Group"
						type="select"
						placeholder="Select group"
						options={groupOptions}
					/>
					<InputField
						control={form.control}
						name="paperCount"
						label="Paper Count"
						type="number"
						placeholder="e.g. 1"
						required
					/>
					<InputField
						control={form.control}
						name="sortOrder"
						label="Sort Order"
						type="number"
						placeholder="e.g. 1"
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
					<CardTitle>{t("marks")}</CardTitle>
					<CardDescription>{t("marksDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-4">
					<InputField
						control={form.control}
						name="fullMarks"
						label="Full Marks"
						type="number"
						placeholder="e.g. 100"
						required
					/>
					<InputField
						control={form.control}
						name="passMarks"
						label="Pass Marks"
						type="number"
						placeholder="e.g. 33"
						required
					/>
					<InputField
						control={form.control}
						name="markDivision"
						label="Mark Division"
						type="select"
						placeholder="Select mark division"
						options={markDivisionOptions}
						required
					/>
					<InputField
						control={form.control}
						name="writtenMarks"
						label="Written Marks"
						type="number"
						placeholder="e.g. 75"
						required
					/>
					<InputField
						control={form.control}
						name="writtenPassMarks"
						label="Written Pass Marks"
						type="number"
						placeholder="e.g. 25"
						required
					/>
					{hasMcq ? (
						<>
							<InputField
								control={form.control}
								name="mcqMarks"
								label="MCQ Marks"
								type="number"
								placeholder="e.g. 25"
								required
							/>
							<InputField
								control={form.control}
								name="mcqPassMarks"
								label="MCQ Pass Marks"
								type="number"
								placeholder="e.g. 8"
								required
							/>
						</>
					) : null}
					{hasPractical ? (
						<>
							<InputField
								control={form.control}
								name="practicalMarks"
								label="Practical Marks"
								type="number"
								placeholder="e.g. 25"
								required
							/>
							<InputField
								control={form.control}
								name="practicalPassMarks"
								label="Practical Pass Marks"
								type="number"
								placeholder="e.g. 8"
								required
							/>
						</>
					) : null}
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("classAssignmentTitle")}</CardTitle>
					<CardDescription>{t("classAssignmentDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<InputField
						control={form.control}
						name="classIds"
						label="Assigned Classes"
						type="classSelection"
						placeholder="Select the classes that will study this subject"
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("descriptionTitle")}</CardTitle>
				</CardHeader>
				<CardContent>
					<InputField
						control={form.control}
						name="description"
						label="Description"
						type="textarea"
						placeholder="Add syllabus notes, curriculum hints, or internal remarks"
					/>
				</CardContent>
			</Card>

			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md bg-background/95 p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.ACADEMICS.SUBJECTS.ROOT)}
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
