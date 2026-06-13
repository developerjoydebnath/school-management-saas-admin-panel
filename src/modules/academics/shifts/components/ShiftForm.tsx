"use client";

import { SHIFT_FORM_FIELDS } from "@/modules/academics/shifts/constants/shift.constant";
import { ShiftFormValues, shiftSchema } from "@/modules/academics/shifts/dto/shift.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import axios from "@/shared/lib/axios";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface ShiftFormProps {
	onSuccess?: () => void;
	initialData?: ShiftFormValues & { id?: string };
}

export default function ShiftForm({ onSuccess, initialData }: ShiftFormProps) {
	const { mutate } = useSWRConfig();
	const t = useTranslations("Forms");

	const form = useForm<ShiftFormValues>({
		resolver: zodResolver(shiftSchema),
		defaultValues: {
			name: initialData?.name || "",
			startTime: initialData?.startTime || "",
			endTime: initialData?.endTime || "",
			status: initialData?.status || ("" as StatusEnum),
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				name: initialData.name,
				startTime: initialData.startTime,
				endTime: initialData.endTime,
				status: initialData.status,
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: ShiftFormValues) => {
		try {
			if (initialData?.id) {
				await axios.put(`/shifts/${initialData.id}`, data);
				toast.success("Shift updated successfully");
			} else {
				await axios.post("/shifts", data);
				toast.success("Shift added successfully");
			}
			form.reset();
			mutate("/shifts");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(
				`An error occurred while ${initialData?.id ? "updating" : "adding"} the shift. Please try again.`
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
			{SHIFT_FORM_FIELDS.map((field) => (
				<InputField key={field.name} control={form.control} {...(field as any)} />
			))}

			<Button
				type="submit"
				className="mt-4 h-10 w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting
					? initialData?.id
						? t("updateLoading")
						: t("saveLoading")
					: initialData?.id
						? t("update")
						: t("save")}
			</Button>
		</form>
	);
}
