"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	IncidentDetails,
	IncidentFormValues,
	INCIDENT_ACTION_OPTIONS,
	INCIDENT_CATEGORY_OPTIONS,
	INCIDENT_STATUS_OPTIONS,
	INCIDENT_TYPE_OPTIONS,
	incidentSchema,
} from "../dto/incident.dto";
import { createIncident, updateIncident } from "../hooks/use-behavior-incident-mutations";
import StudentIncidentCombobox, { StudentIncidentOption } from "./StudentIncidentCombobox";

const todayStr = () => new Date().toISOString().slice(0, 10);

interface IncidentFormProps {
	initialData?: IncidentDetails;
	isEdit?: boolean;
}

export default function IncidentForm({ initialData, isEdit = false }: IncidentFormProps) {
	const t = useTranslations("StudentBehavior");
	const ft = useTranslations("Forms");
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<IncidentFormValues>({
		resolver: zodResolver(incidentSchema as any),
		defaultValues: {
			studentId: initialData?.studentId || "",
			studentLabel: initialData?.studentName || "",
			type: initialData?.type || "negative",
			category: initialData?.category || "",
			actionTaken: initialData?.actionTaken || "",
			date: initialData?.date ? initialData.date.slice(0, 10) : todayStr(),
			remarks: initialData?.remarks || "",
			guardianCallRequired: initialData?.guardianCallRequired || false,
			status: initialData?.status || "pending",
		},
	});

	const handleStudentChange = (value: string, option?: StudentIncidentOption) => {
		form.setValue("studentId", value, { shouldValidate: true });
		form.setValue("studentLabel", option?.label || "");
	};

	const onSubmit = async (values: IncidentFormValues) => {
		setIsSubmitting(true);
		try {
			if (isEdit && initialData?.id) {
				// PATCH doesn't accept studentId -- a record can't be reassigned
				// to a different student.
				await updateIncident(initialData.id, {
					type: values.type,
					category: values.category,
					actionTaken: values.actionTaken,
					date: values.date,
					remarks: values.remarks,
					guardianCallRequired: values.guardianCallRequired,
					status: values.status,
				});
				toast.success(t("dialog.updateSuccess"));
			} else {
				await createIncident({
					studentId: values.studentId,
					type: values.type,
					category: values.category,
					actionTaken: values.actionTaken,
					date: values.date,
					remarks: values.remarks,
					guardianCallRequired: values.guardianCallRequired,
					status: values.status,
				});
				toast.success(t("dialog.addSuccess"));
			}
			router.push(PATHS.STUDENTS.BEHAVIOR.ROOT);
		} finally {
			// Errors are surfaced by the global axios interceptor toast.
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("dialog.studentLabel")}</CardTitle>
					<CardDescription>{t("dialog.studentPlaceholder")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Controller
						control={form.control}
						name="studentId"
						render={({ field, fieldState }) => (
							<div className="space-y-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{t("dialog.studentLabel")} <span className="text-destructive">*</span>
								</Label>
								<StudentIncidentCombobox
									value={field.value}
									onChange={handleStudentChange}
									disabled={isEdit}
									selectedLabel={form.watch("studentLabel")}
									placeholder={t("dialog.studentPlaceholder")}
								/>
								{fieldState.error && (
									<p className="text-destructive text-sm">{fieldState.error.message}</p>
								)}
							</div>
						)}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("dialog.title")}</CardTitle>
					<CardDescription>{t("dialog.description")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2 @4xl/page:grid-cols-4">
						<InputField
							control={form.control}
							name="type"
							label={t("dialog.typeLabel")}
							type="select"
							options={INCIDENT_TYPE_OPTIONS.map((o) => ({
								value: o.value,
								label: t(`filters.${o.value}` as any),
							}))}
							required
						/>
						<InputField
							control={form.control}
							name="category"
							label={t("dialog.categoryLabel")}
							placeholder={t("dialog.categoryPlaceholder")}
							type="select"
							options={INCIDENT_CATEGORY_OPTIONS.map((o) => ({
								value: o.value,
								label: t(`categories.${o.value}` as any),
							}))}
							required
						/>
						<InputField
							control={form.control}
							name="actionTaken"
							label={t("dialog.actionLabel")}
							placeholder={t("dialog.actionPlaceholder")}
							type="select"
							options={INCIDENT_ACTION_OPTIONS.map((o) => ({
								value: o.value,
								label: t(`actions.${o.value}` as any),
							}))}
							required
						/>
						<InputField
							control={form.control}
							name="date"
							label={t("dialog.dateLabel")}
							type="date"
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="status"
							label={t("table.status")}
							type="select"
							options={INCIDENT_STATUS_OPTIONS.map((o) => ({
								value: o.value,
								label: t(`statuses.${o.value}` as any),
							}))}
						/>
						<div className="flex items-end pb-2">
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

					<InputField
						control={form.control}
						name="remarks"
						label={t("dialog.remarksLabel")}
						type="textEditor"
						required={false}
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.STUDENTS.BEHAVIOR.ROOT)}
					disabled={isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? isEdit
							? ft("updateLoading")
							: ft("saveLoading")
						: isEdit
							? ft("update")
							: t("dialog.save")}
				</Button>
			</div>
		</form>
	);
}
