"use client";

import { SUBJECT_FORM_FIELDS } from "@/modules/academics/subjects/constants/subject.constant";
import { SubjectFormValues, subjectSchema } from "@/modules/academics/subjects/dto/subject.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import axios from "@/shared/lib/axios";
import { StatusEnum, SubjectTypeEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface SubjectFormProps {
	onSuccess?: () => void;
	initialData?: SubjectFormValues & { id?: string };
}

export default function SubjectForm({ onSuccess, initialData }: SubjectFormProps) {
	const { mutate } = useSWRConfig();
	const t = useTranslations("Subjects");
	const ft = useTranslations("Forms");

	const form = useForm<SubjectFormValues>({
		resolver: zodResolver(subjectSchema),
		defaultValues: {
			name: {
				en:
					typeof initialData?.name === "object"
						? initialData?.name?.en
						: initialData?.name || "",
				bn: typeof initialData?.name === "object" ? initialData?.name?.bn : "",
			},
			code: initialData?.code || "",
			type: (initialData?.type as SubjectTypeEnum) || SubjectTypeEnum.MANDATORY,
			status: (initialData?.status as StatusEnum) || StatusEnum.ACTIVE,
			classes: initialData?.classes || [],
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				name: {
					en:
						typeof initialData.name === "object"
							? initialData.name.en
							: initialData.name || "",
					bn: typeof initialData.name === "object" ? initialData.name.bn : "",
				},
				code: initialData.code,
				type: initialData.type as SubjectTypeEnum,
				status: initialData.status as StatusEnum,
				classes: initialData.classes || [],
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: SubjectFormValues) => {
		try {
			if (initialData?.id) {
				await axios.put(`/subjects/${initialData.id}`, data);
				toast.success("Subject updated successfully");
			} else {
				await axios.post("/subjects", data);
				toast.success("Subject added successfully");
			}
			form.reset();
			mutate("/subjects");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(
				`An error occurred while ${
					initialData?.id ? "updating" : "adding"
				} the subject. Please try again.`
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			{SUBJECT_FORM_FIELDS.map((field) => (
				<InputField key={field.name} control={form.control} {...field} />
			))}

			<Button
				type="submit"
				className="mt-4 h-10 w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting
					? initialData?.id
						? ft("updateLoading")
						: ft("saveLoading")
					: initialData?.id
						? t("updateSubject")
						: t("addSubject")}
			</Button>
		</form>
	);
}
