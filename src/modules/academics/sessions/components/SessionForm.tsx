"use client";

import { SESSION_FORM_FIELDS } from "@/modules/academics/sessions/constants/session.constant";
import { SessionFormValues, sessionSchema } from "@/modules/academics/sessions/dto/session.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { z } from "zod";

interface SessionFormProps {
	onSuccess?: () => void;
	initialData?: SessionFormValues & { id?: string };
}

export default function SessionForm({ onSuccess, initialData }: SessionFormProps) {
	const { mutate } = useSWRConfig();
	const t = useTranslations("Forms");
	const ts = useTranslations("Sessions");

	const form = useForm<z.input<typeof sessionSchema>, any, SessionFormValues>({
		resolver: zodResolver(sessionSchema),
		defaultValues: {
			name: initialData?.name || "",
			year: initialData?.year || new Date().getFullYear(),
			status: initialData?.status || "ACTIVE",
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				name: initialData.name,
				year: initialData.year,
				status: initialData.status,
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: SessionFormValues) => {
		try {
			if (initialData?.id) {
				await axios.patch(`/sessions/${initialData.id}`, data);
				toast.success("Session updated successfully");
			} else {
				await axios.post("/sessions", data);
				toast.success("Session added successfully");
			}
			form.reset();
			mutate("/sessions");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(
				`An error occurred while ${initialData?.id ? "updating" : "adding"} the session. Please try again.`
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
			{SESSION_FORM_FIELDS.map((field) => (
				<InputField
					key={field.name}
					control={form.control}
					{...(field as any)}
					label={field.name === "name" ? ts("sessionName") : field.name === "year" ? ts("sessionYear") : ts("status")}
				/>
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
