"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { IncidentFormValues, incidentSchema } from "../dto/incident.dto";

interface IncidentFormProps {
	onSuccess?: () => void;
	initialData?: any;
}

export default function IncidentForm({ onSuccess, initialData }: IncidentFormProps) {
	const { mutate } = useSWRConfig();
	const t = useTranslations("StudentBehavior");
	const ft = useTranslations("Forms");

	const form = useForm<IncidentFormValues>({
		resolver: zodResolver(incidentSchema),
		defaultValues: {
			studentId: initialData?.studentId || "",
			type: initialData?.type || "negative",
			date: initialData?.date || new Date().toISOString().split("T")[0],
			category: initialData?.category || "",
			actionTaken: initialData?.actionTaken || "",
			remarks: initialData?.remarks || "",
			guardianCallRequired: initialData?.guardianCallRequired || false,
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				studentId: initialData.studentId || "",
				type: initialData.type || "negative",
				date: initialData.date || new Date().toISOString().split("T")[0],
				category: initialData.category || "",
				actionTaken: initialData.actionTaken || "",
				remarks: initialData.remarks || "",
				guardianCallRequired: initialData.guardianCallRequired || false,
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: IncidentFormValues) => {
		try {
			// Mocking studentName and class for the demo
			const payload = {
				...data,
				studentName: "Demo Student", // Replace with real lookup in production
				class: "Class 8", // Replace with real lookup in production
				status: "pending",
			};

			if (initialData?.id) {
				await axios.put(`/behaviorIncidents/${initialData.id}`, payload);
				toast.success(t("dialog.updateSuccess") || "Incident updated successfully");
			} else {
				await axios.post("/behaviorIncidents", payload);
				toast.success(t("dialog.addSuccess") || "Incident added successfully");
			}
			mutate("/behaviorIncidents");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(
				ft("error") ||
					`An error occurred while ${initialData?.id ? "updating" : "adding"} the incident.`
			);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-0">
			<div className="space-y-4">
				<InputField
					control={form.control}
					name="studentId"
					label={t("dialog.studentLabel")}
					placeholder={t("dialog.studentPlaceholder")}
					type="text"
				/>

				<div className="grid grid-cols-2 gap-4">
					<InputField
						control={form.control}
						name="type"
						label={t("dialog.typeLabel")}
						type="select"
						options={[
							{ label: t("filters.negative"), value: "negative" },
							{ label: t("filters.positive"), value: "positive" },
							{ label: t("filters.neutral"), value: "neutral" },
						]}
					/>
					<InputField
						control={form.control}
						name="date"
						label={t("dialog.dateLabel")}
						type="date"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<InputField
						control={form.control}
						name="category"
						label={t("dialog.categoryLabel")}
						placeholder={t("dialog.categoryPlaceholder")}
						type="select"
						options={[
							{ label: t("categories.uniform"), value: "uniform" },
							{ label: t("categories.tardiness"), value: "tardiness" },
							{ label: t("categories.contraband"), value: "contraband" },
							{ label: t("categories.homework"), value: "homework" },
							{ label: t("categories.disruption"), value: "disruption" },
							{ label: t("categories.excellence"), value: "excellence" },
							{ label: t("categories.helpfulness"), value: "helpfulness" },
							{ label: t("categories.other"), value: "other" },
						]}
					/>
					<InputField
						control={form.control}
						name="actionTaken"
						label={t("dialog.actionLabel")}
						placeholder={t("dialog.actionPlaceholder")}
						type="select"
						options={[
							{ label: t("actions.warning"), value: "warning" },
							{ label: t("actions.writtenWarning"), value: "writtenWarning" },
							{ label: t("actions.parentsCalled"), value: "parentsCalled" },
							{ label: t("actions.parentsMeeting"), value: "parentsMeeting" },
							{ label: t("actions.suspension"), value: "suspension" },
							{ label: t("actions.appreciation"), value: "appreciation" },
							{ label: t("actions.none"), value: "none" },
						]}
					/>
				</div>

				<InputField
					control={form.control}
					name="remarks"
					label={t("dialog.remarksLabel")}
					placeholder={t("dialog.remarksPlaceholder")}
					type="textarea"
					className="h-24"
					required={false}
				/>

				<div className="flex items-center pt-2">
					<InputField
						control={form.control}
						name="guardianCallRequired"
						type="switch"
						className="mr-2"
						required={false}
					/>
					<span
						className="cursor-pointer text-sm"
						onClick={() =>
							form.setValue(
								"guardianCallRequired",
								!form.getValues("guardianCallRequired")
							)
						}
					>
						{t("dialog.guardianCallRequired")}
					</span>
				</div>
			</div>

			<Button type="submit" className="h-10 w-full" disabled={form.formState.isSubmitting}>
				{form.formState.isSubmitting
					? initialData?.id
						? ft("updating") || "Updating..."
						: ft("saving") || "Saving..."
					: initialData?.id
						? ft("update") || "Update"
						: t("dialog.save") || "Save"}
			</Button>
		</form>
	);
}
