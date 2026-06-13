"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdmissionField } from "../constants/admission-fields";
import { ADD_CUSTOM_FIELD_FORM_FIELDS } from "../constants/admission-settings.constant";
import { CustomFieldFormValues, customFieldSchema } from "../dto/admission-settings.dto";
import { useAdmissionSettingsStore } from "../stores/admission-settings-store";

const generateCustomFieldId = (label: string) => {
	return `custom_${label.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
};

export function AddCustomFieldDialog() {
	const { addCustomField } = useAdmissionSettingsStore();
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslations("AdmissionSettings");

	const form = useForm<CustomFieldFormValues>({
		resolver: zodResolver(customFieldSchema),
		defaultValues: {
			label: "",
			category: "student_info",
			type: "text",
			isStep1: false,
		},
	});

	const onSubmit = useCallback(
		(data: CustomFieldFormValues) => {
			const id = generateCustomFieldId(data.label);

			addCustomField({
				...data,
				id,
				isCustom: true,
			} as AdmissionField);

			form.reset();
			setIsOpen(false);
			toast.success(t("addSuccess"));
		},
		[addCustomField, form, t]
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger
				render={
					<Button variant="outline">
						<Plus className="h-4 w-4" />
						{t("addCustomField")}
					</Button>
				}
			></DialogTrigger>
			<DialogContent className="gap-4">
				<DialogHeader>
					<DialogTitle>{t("addCustomFieldTitle")}</DialogTitle>
					<DialogDescription>{t("addCustomFieldDesc")}</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid gap-4">
						{ADD_CUSTOM_FIELD_FORM_FIELDS.map((field) => (
							<InputField
								key={field.name}
								control={form.control}
								{...(field as any)}
							/>
						))}
					</div>

					<DialogFooter>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? t("adding") : t("addField")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
