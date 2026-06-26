"use client";

import { HomeworkFormValues, homeworkSchema } from "@/modules/academics/homework/dto/homework.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface HomeworkFormProps {
	onSuccess?: () => void;
	initialData?: HomeworkFormValues & { id?: string; subjectName?: string; className?: string };
}

export default function HomeworkForm({ onSuccess, initialData }: HomeworkFormProps) {
	const { mutate } = useSWRConfig();
	const t = useTranslations("Homework");
	const ft = useTranslations("Forms");

	const { data: subjectResponse } = useSWR("/subjects/active-list");
	const { data: classesData } = useSWR("/classes");
	const subjectsData = Array.isArray(subjectResponse?.data) ? subjectResponse.data : subjectResponse || [];

	const subjectOptions =
		(subjectsData as any[])?.map((s) => ({
			label: s.enName || s.name?.en || s.name,
			value: s.id,
		})) || [];

	const classOptions =
		(classesData as any[])?.map((c) => ({
			label: c.name?.en || c.name,
			value: c.id,
		})) || [];

	const form = useForm<HomeworkFormValues>({
		resolver: zodResolver(homeworkSchema as any),
		defaultValues: {
			title: initialData?.title || "",
			subjectId: initialData?.subjectId || "",
			classId: initialData?.classId || "",
			assignedDate: initialData?.assignedDate || new Date().toISOString().split("T")[0],
			dueDate: initialData?.dueDate || "",
			status: initialData?.status || "Active",
			description: initialData?.description || "",
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				title: initialData.title,
				subjectId: initialData.subjectId,
				classId: initialData.classId,
				assignedDate: initialData.assignedDate,
				dueDate: initialData.dueDate,
				status: initialData.status,
				description: initialData.description || "",
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: HomeworkFormValues) => {
		try {
			// Find names for mock DB since it stores them
			const subjectName = subjectOptions.find((s) => s.value === data.subjectId)?.label || "";
			const className = classOptions.find((c) => c.value === data.classId)?.label || "";
			const payload = { ...data, subjectName, className };

			if (initialData?.id) {
				await axios.put(`/homework/${initialData.id}`, payload);
				toast.success(t("updateSuccess"));
			} else {
				await axios.post("/homework", payload);
				toast.success(t("addSuccess"));
			}
			form.reset();
			mutate("/homework");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(initialData?.id ? t("updateError") : t("addError"));
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<InputField
				control={form.control}
				name="title"
				label={t("homeworkTitle")}
				placeholder="e.g. Algebra Chapter 1 Exercises"
				type="text"
			/>
			
			<div className="grid grid-cols-2 gap-4">
				<InputField
					control={form.control}
					name="classId"
					label={t("class")}
					type="select"
					options={classOptions}
					placeholder="Select Class"
				/>
				<InputField
					control={form.control}
					name="subjectId"
					label={t("subject")}
					type="select"
					options={subjectOptions}
					placeholder="Select Subject"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<InputField
					control={form.control}
					name="assignedDate"
					label={t("assignedDate")}
					type="date"
				/>
				<InputField
					control={form.control}
					name="dueDate"
					label={t("dueDate")}
					type="date"
				/>
			</div>

			<InputField
				control={form.control}
				name="status"
				label={t("status")}
				type="select"
				options={[
					{ label: t("active"), value: "Active" },
					{ label: t("completed"), value: "Completed" },
					{ label: t("pastDue"), value: "Past Due" },
				]}
			/>

			<InputField
				control={form.control}
				name="description"
				label={t("descriptionLabel")}
				type="textarea"
				placeholder="Add detailed instructions..."
			/>

			<Button
				type="submit"
				className="mt-4 h-10 w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting
					? ft("saveLoading")
					: initialData?.id
						? t("update")
						: t("save")}
			</Button>
		</form>
	);
}
