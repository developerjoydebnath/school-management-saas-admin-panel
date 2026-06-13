"use client";

import InputField from "@/shared/components/form/InputField";
import { cn } from "@/shared/lib/utils";
import { AlertCircle, CheckCircle2, CreditCard, Database, FileText, MapPin, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";

interface AdmissionFormSectionProps {
	category: string;
	admissionFields: any[];
	fieldRequired: Record<string, boolean>;
	control: Control<any>;
	admissionMode: "fast" | "full";
	selectedClassId?: string;
}

export default function AdmissionFormSection({
	category,
	admissionFields,
	fieldRequired,
	control,
	admissionMode,
	selectedClassId,
}: AdmissionFormSectionProps) {
	const tc = useTranslations("AdmissionSettings.categories");
	const fieldsInCategory = admissionFields.filter((f) => f.category === category);

	if (fieldsInCategory.length === 0) return null;

	return (
		<div key={category} className="space-y-5">
			{admissionMode === "fast" && (
				<div className="flex items-center gap-3 border-b pb-2">
					<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
						{category === "student_info" && <FileText className="h-4 w-4" />}
						{category === "academic_info" && <CheckCircle2 className="h-4 w-4" />}
						{category === "parent_info" && <UserPlus className="h-4 w-4" />}
						{category === "payment" && <CreditCard className="h-4 w-4" />}
						{category === "health_info" && <AlertCircle className="h-4 w-4" />}
						{category === "documents" && <Database className="h-4 w-4" />}
						{category === "address" && <MapPin className="h-4 w-4" />}
					</div>
					<h3 className="text-foreground text-sm font-bold tracking-tight uppercase">
						{tc(category)}
					</h3>
				</div>
			)}

			<div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
				{fieldsInCategory.map((field) => {
					let options = undefined;
					if (field.id === "gender") {
						options = [
							{ label: "Male", value: "male" },
							{ label: "Female", value: "female" },
							{ label: "Other", value: "other" },
						];
					} else if (field.id === "admissionType") {
						options = [
							{ label: "New Admission", value: "new" },
							{ label: "Transfer", value: "transfer" },
						];
					} else if (field.id === "religion") {
						options = [
							{ label: "Islam", value: "islam" },
							{ label: "Hinduism", value: "hinduism" },
							{ label: "Christianity", value: "christianity" },
							{ label: "Buddhism", value: "buddhism" },
							{ label: "Other", value: "other" },
						];
					} else if (field.id === "bloodGroup") {
						options = [
							{ label: "A+", value: "A+" },
							{ label: "A-", value: "A-" },
							{ label: "B+", value: "B+" },
							{ label: "B-", value: "B-" },
							{ label: "AB+", value: "AB+" },
							{ label: "AB-", value: "AB-" },
							{ label: "O+", value: "O+" },
							{ label: "O-", value: "O-" },
						];
					} else if (field.id === "quota") {
						options = [
							{ label: "None", value: "none" },
							{ label: "Muktijoddha (Freedom Fighter)", value: "muktijoddha" },
							{ label: "Indigenous", value: "indigenous" },
							{ label: "Disability", value: "disability" },
							{ label: "Other", value: "other" },
						];
					}

					let inputType: string = field.type === "file" ? "text" : field.type;
					if (field.id === "class") inputType = "classSelect";
					if (field.id === "section") inputType = "sectionSelect";
					if (field.id === "session") inputType = "sessionSelect";

					const shouldSpanFull =
						field.id?.toLowerCase().includes("address") ||
						field.id === "previousSchool" ||
						field.id === "conditions" ||
						field.id === "guardianDetails" ||
						field.type === "file";

					return (
						<div
							key={field.id}
							className={cn("col-span-1", shouldSpanFull && "sm:col-span-2")}
						>
							<InputField
								control={control}
								name={field.id}
								label={field.label}
								type={inputType}
								placeholder={
									field.type === "select"
										? `Select ${field.label}`
										: `Enter ${field.label}`
								}
								required={fieldRequired[field.id]}
								options={options}
								dependencyId={field.id === "section" ? selectedClassId : undefined}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
