"use client";

import { Button } from "@/shared/components/ui/button";
import InputField from "@/shared/components/form/InputField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SyllabusDetail } from "../dto/syllabus.dto";

const syllabusSchema = z.object({
	subject: z.string().min(1, "Subject is required"),
	term: z.string().min(1, "Term is required"),
	topics: z.string().min(1, "Topics are required"),
	completionDate: z.string().min(1, "Completion date is required"),
	status: z.enum(["In Progress", "Completed", "Pending"]),
});

type SyllabusFormValues = z.infer<typeof syllabusSchema>;

interface SyllabusFormProps {
	initialData?: SyllabusDetail;
	onSuccess: (data: SyllabusFormValues) => void;
	onCancel: () => void;
}

export default function SyllabusForm({ initialData, onSuccess, onCancel }: SyllabusFormProps) {
	const t = useTranslations("Syllabus");
	const tf = useTranslations("Forms");

	const form = useForm<SyllabusFormValues>({
		resolver: zodResolver(syllabusSchema),
		defaultValues: {
			subject: initialData?.subject || "",
			term: initialData?.term || "",
			topics: initialData?.topics || "",
			completionDate: initialData?.completionDate || "",
			status: initialData?.status || "Pending",
		},
	});

	const onSubmit = (data: SyllabusFormValues) => {
		onSuccess(data);
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
			<InputField
				control={form.control}
				name="subject"
				label={t("subject")}
				placeholder="e.g. Bangla"
				type="text"
			/>

			<InputField
				control={form.control}
				name="term"
				label={t("term")}
				placeholder="e.g. Half Yearly Exam"
				type="text"
			/>

			<InputField
				control={form.control}
				name="topics"
				label={t("topics")}
				placeholder="e.g. Chapter 1-5"
				type="text"
			/>

			<div className="grid grid-cols-2 gap-4">
				<InputField
					control={form.control}
					name="completionDate"
					label={t("completionDate")}
					type="date"
				/>

				<InputField
					control={form.control}
					name="status"
					label={t("status")}
					type="select"
					placeholder="Select status"
					options={[
						{ label: "Pending", value: "Pending" },
						{ label: "In Progress", value: "In Progress" },
						{ label: "Completed", value: "Completed" },
					]}
				/>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					{tf("cancel")}
				</Button>
				<Button type="submit">{t("save")}</Button>
			</div>
		</form>
	);
}

