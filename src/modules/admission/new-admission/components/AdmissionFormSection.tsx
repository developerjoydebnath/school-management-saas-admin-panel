"use client";

import InputField from "@/shared/components/form/InputField";
import { appConfig } from "@/shared/configs/app.config";
import { cn } from "@/shared/lib/utils";
import { uploadDocument, uploadImage } from "@/shared/services/uploadApi";
import {
	AlertCircle,
	CheckCircle2,
	CreditCard,
	Database,
	FileText,
	Info,
	Loader2,
	MapPin,
	UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface AdmissionFormSectionProps {
	category: string;
	admissionFields: any[];
	fieldRequired: Record<string, boolean>;
	control: Control<any>;
	setValue: UseFormSetValue<any>;
	admissionMode: "fast" | "full";
	selectedClassId?: string;
	beforeFields?: ReactNode;
}

function getMediaUrl(url?: string | null) {
	if (!url) return undefined;
	if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
	return `${appConfig.API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function AdmissionPhotoField({
	control,
	field,
	required,
	setValue,
}: {
	control: Control<any>;
	field: any;
	required?: boolean;
	setValue: UseFormSetValue<any>;
}) {
	const [isUploading, setIsUploading] = useState(false);
	const fieldKey = field.fieldKey || field.id;
	const photoValue = useWatch({ control, name: fieldKey });
	const photoUrl = useWatch({ control, name: "photoUrl" });
	const placeholder = useWatch({ control, name: "photoPlaceholder" });
	const previewValue =
		typeof photoValue === "string" && photoValue
			? photoValue
			: typeof photoUrl === "string" && photoUrl
				? photoUrl
				: undefined;

	useEffect(() => {
		if (!(photoValue instanceof File)) return;

		let cancelled = false;

		async function upload() {
			setIsUploading(true);
			try {
				const response = await uploadImage(photoValue, "student_photo");
				if (cancelled) return;
				setValue(fieldKey, response.url, { shouldDirty: true, shouldValidate: true });
				setValue("photoUrl", response.url, { shouldDirty: true, shouldValidate: true });
				setValue("photoPlaceholder", response.placeholder, { shouldDirty: true });
				setValue("photoMediaId", response.mediaId, { shouldDirty: true });
			} catch (error) {
				if (!cancelled) {
					toast.error("Failed to upload student photo.");
					setValue(fieldKey, "", { shouldDirty: true, shouldValidate: true });
				}
			} finally {
				if (!cancelled) setIsUploading(false);
			}
		}

		upload();

		return () => {
			cancelled = true;
		};
	}, [fieldKey, photoValue, setValue]);

	return (
		<div className="relative">
			<InputField
				control={control}
				name={fieldKey}
				label={field.label}
				type="file"
				placeholder={field.placeholder || `Upload ${field.label}`}
				required={required}
				defaultPreview={
					previewValue ? getMediaUrl(previewValue) : undefined
				}
				placeholderBase64={placeholder}
				className="h-44 sm:h-52"
			/>
			{isUploading && (
				<div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm">
					<Loader2 className="h-5 w-5 animate-spin" />
				</div>
			)}
		</div>
	);
}

function AdmissionDocumentField({
	control,
	field,
	required,
	setValue,
}: {
	control: Control<any>;
	field: any;
	required?: boolean;
	setValue: UseFormSetValue<any>;
}) {
	const [isUploading, setIsUploading] = useState(false);
	const fieldKey = field.fieldKey || field.id;
	const documentValue = useWatch({ control, name: fieldKey });

	useEffect(() => {
		if (!(documentValue instanceof File)) return;

		let cancelled = false;

		async function upload() {
			setIsUploading(true);
			try {
				const isImage = documentValue.type.startsWith("image/");
				const response = isImage
					? await uploadImage(documentValue, "student_document")
					: await uploadDocument(documentValue, "student_document");
				if (cancelled) return;
				setValue(
					fieldKey,
					{
						type: fieldKey,
						label: field.label,
						mediaId: response.mediaId,
						url: response.url,
						placeholder: response.placeholder,
						originalName: documentValue.name,
						mimeType: documentValue.type,
						fileSize: documentValue.size,
						uploadedAt: new Date().toISOString(),
					},
					{ shouldDirty: true, shouldValidate: true }
				);
			} catch (error) {
				if (!cancelled) {
					toast.error(`Failed to upload ${field.label}.`);
					setValue(fieldKey, null, { shouldDirty: true, shouldValidate: true });
				}
			} finally {
				if (!cancelled) setIsUploading(false);
			}
		}

		upload();

		return () => {
			cancelled = true;
		};
	}, [documentValue, field.label, fieldKey, setValue]);

	return (
		<div className="relative">
			<InputField
				control={control}
				name={fieldKey}
				label={field.label}
				type="document-single"
				placeholder={field.placeholder || `Upload ${field.label}`}
				required={required}
			/>
			{isUploading && (
				<div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm">
					<Loader2 className="h-5 w-5 animate-spin" />
				</div>
			)}
		</div>
	);
}

function AdmissionConfiguredField({
	control,
	field,
	required,
	setValue,
	selectedClassId,
	category,
	permanentSameAsPresent,
}: {
	control: Control<any>;
	field: any;
	required?: boolean;
	setValue: UseFormSetValue<any>;
	selectedClassId?: string;
	category: string;
	permanentSameAsPresent?: boolean;
}) {
	const fieldKey = field.fieldKey || field.id;
	const fieldType = field.fieldType || field.type;
	const label = field.label;
	const lowerKey = fieldKey.toLowerCase();
	const selectedSessionIdValue = useWatch({ control, name: "sessionId" });
	const selectedSessionValue = useWatch({ control, name: "session" });
	const selectedSessionYearValue = useWatch({ control, name: "sessionYear" });
	const selectedSessionId = (selectedSessionIdValue ||
		selectedSessionValue ||
		selectedSessionYearValue) as string | undefined;
	const isPermanentAddressField = [
		"permanentAddress",
		"permanentDivisionId",
		"permanentDistrictId",
		"permanentUpazilaId",
	].includes(fieldKey);
	const fallbackDependsOnFieldKey =
		fieldKey === "presentDistrictId"
			? "presentDivisionId"
			: fieldKey === "presentUpazilaId"
				? "presentDistrictId"
				: fieldKey === "permanentDistrictId"
					? "permanentDivisionId"
					: fieldKey === "permanentUpazilaId"
						? "permanentDistrictId"
						: undefined;
	const dependencyValue = useWatch({
		control,
		name: field.dependsOnFieldKey || fallbackDependsOnFieldKey || "__unused_dependency",
	});

	let options = undefined;
	if (Array.isArray(field.options)) {
		options = field.options;
	} else if (Array.isArray(field.options?.options)) {
		options = field.options.options;
	} else if (fieldKey === "gender") {
		options = [
			{ label: "Male", value: "male" },
			{ label: "Female", value: "female" },
			{ label: "Other", value: "other" },
		];
	} else if (fieldKey === "admissionType") {
		options = [
			{ label: "New Admission", value: "new" },
			{ label: "Transfer", value: "transfer" },
		];
	} else if (fieldKey === "religion") {
		options = [
			{ label: "Islam", value: "islam" },
			{ label: "Hinduism", value: "hinduism" },
			{ label: "Christianity", value: "christianity" },
			{ label: "Buddhism", value: "buddhism" },
			{ label: "Other", value: "other" },
		];
	} else if (fieldKey === "bloodGroup") {
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
	} else if (fieldKey === "quota" || fieldKey === "specialQuota") {
		options = [
			{ label: "None", value: "none" },
			{ label: "Sibling Quota", value: "sibling" },
			{ label: "Teacher Child Quota", value: "teacher_child" },
			{ label: "Committee Member Quota", value: "committee_member" },
			{ label: "Freedom Fighter Quota", value: "freedom_fighter" },
			{ label: "Other", value: "other" },
		];
	}

	let inputType: string = fieldType === "phone" ? "tel" : fieldType;
	const optionSource = field.options?.source;
	if (
		fieldKey === "class" ||
		fieldKey === "classId" ||
		fieldKey === "applyingClassId" ||
		optionSource === "classes"
	) {
		inputType = "classSelect";
	}
	if (
		fieldKey === "section" ||
		fieldKey === "sectionId" ||
		optionSource === "sections_by_class"
	) {
		inputType = "sectionSelect";
	}
	if (
		fieldKey === "session" ||
		fieldKey === "sessionId" ||
		optionSource === "sessions"
	) {
		inputType = "sessionSelect";
	}
	if (optionSource === "divisions") {
		inputType = "divisionSelect";
	}
	if (optionSource === "districts_by_division") {
		inputType = "districtSelect";
	}
	if (optionSource === "upazilas_by_district") {
		inputType = "upazilaSelect";
	}
	if (fieldKey === "shift" || fieldKey === "shiftId" || optionSource === "shifts") {
		inputType = "shiftSelect";
	}
	if (fieldKey === "paymentMethod" || optionSource === "payment_methods") {
		inputType = "paymentMethodSelect";
	}

	const shouldSpanFull =
		category !== "documents" &&
		(fieldType === "textarea" ||
			(fieldType === "file" && lowerKey.includes("photo")) ||
			fieldKey?.toLowerCase().includes("address") ||
			fieldKey === "previousSchool" ||
			fieldKey === "previousSchoolName" ||
			fieldKey === "conditions" ||
			fieldKey === "guardianDetails");

	const dependencyId =
		fieldKey === "section" || fieldKey === "sectionId"
			? selectedClassId
			: fieldKey === "class" ||
				  fieldKey === "classId" ||
				  fieldKey === "applyingClassId" ||
				  optionSource === "classes"
				? selectedSessionId
			: field.dependsOnFieldKey || fallbackDependsOnFieldKey
				? (dependencyValue as string | undefined)
				: undefined;

	return (
		<div className={cn("col-span-1", shouldSpanFull && "sm:col-span-2")}>
			{fieldType === "file" && lowerKey.includes("photo") ? (
				<AdmissionPhotoField
					control={control}
					field={field}
					required={required}
					setValue={setValue}
				/>
			) : fieldType === "file" ? (
				<AdmissionDocumentField
					control={control}
					field={field}
					required={required}
					setValue={setValue}
				/>
			) : (
				<InputField
					control={control}
					name={fieldKey}
					label={label}
					type={inputType}
					placeholder={
						field.placeholder ||
						(fieldType === "select" || fieldType === "dynamic_select"
							? `Select ${label}`
							: `Enter ${label}`)
					}
					required={required}
					options={options}
					helperText={
						fieldKey === "admissionFeeAmount"
							? "Amount collected now. Any remaining payable amount will be recorded as due."
							: undefined
					}
					dependencyId={dependencyId}
					sessionId={
						fieldKey === "section" || fieldKey === "sectionId"
							? selectedSessionId
							: undefined
					}
					disabled={isPermanentAddressField && !!permanentSameAsPresent}
				/>
			)}
		</div>
	);
}

function getAdmissionFieldKey(field: any) {
	return field.fieldKey || field.id;
}

function getAcademicFieldOrder(field: any) {
	const fieldKey = getAdmissionFieldKey(field);
	const optionSource = field.options?.source;

	if (fieldKey === "session" || fieldKey === "sessionId" || fieldKey === "sessionYear" || optionSource === "sessions") {
		return 0;
	}
	if (
		fieldKey === "class" ||
		fieldKey === "classId" ||
		fieldKey === "applyingClassId" ||
		optionSource === "classes"
	) {
		return 1;
	}
	if (fieldKey === "section" || fieldKey === "sectionId" || optionSource === "sections_by_class") {
		return 2;
	}
	if (fieldKey === "admissionType") return 3;
	if (fieldKey === "mediumOrVersion") return 4;
	if (fieldKey === "shift" || fieldKey === "shiftId" || optionSource === "shifts") return 5;
	if (fieldKey === "group" || fieldKey === "department" || fieldKey === "groupDepartment") return 6;

	return 100 + (field.sortOrder || 0);
}

export default function AdmissionFormSection({
	category,
	admissionFields,
	fieldRequired,
	control,
	setValue,
	admissionMode,
	selectedClassId,
	beforeFields,
}: AdmissionFormSectionProps) {
	const tc = useTranslations("AdmissionSettings.categories");
	const fieldsInCategory = admissionFields
		.filter((f) => f.category === category)
		.sort((a, b) => {
			if (category === "academic_info") {
				return getAcademicFieldOrder(a) - getAcademicFieldOrder(b);
			}
			return (a.sortOrder || 0) - (b.sortOrder || 0);
		});
	const presentDivisionId = useWatch({ control, name: "presentDivisionId" });
	const presentDistrictId = useWatch({ control, name: "presentDistrictId" });
	const permanentDivisionId = useWatch({ control, name: "permanentDivisionId" });
	const permanentDistrictId = useWatch({ control, name: "permanentDistrictId" });
	const permanentSameAsPresent = useWatch({ control, name: "permanentSameAsPresent" });
	const hasHydratedAddressValues = useRef(false);
	const previousAddressValues = useRef({
		presentDivisionId,
		presentDistrictId,
		permanentDivisionId,
		permanentDistrictId,
	});

	useEffect(() => {
		if (category !== "address") return;
		if (!hasHydratedAddressValues.current) {
			hasHydratedAddressValues.current = true;
			previousAddressValues.current = {
				presentDivisionId,
				presentDistrictId,
				permanentDivisionId,
				permanentDistrictId,
			};
			return;
		}
		const previous = previousAddressValues.current;
		if (previous.presentDivisionId !== presentDivisionId) {
			setValue("presentDistrictId", "", { shouldDirty: true, shouldValidate: true });
			setValue("presentUpazilaId", "", { shouldDirty: true, shouldValidate: true });
		}
		if (previous.presentDistrictId !== presentDistrictId) {
			setValue("presentUpazilaId", "", { shouldDirty: true, shouldValidate: true });
		}
		if (previous.permanentDivisionId !== permanentDivisionId) {
			setValue("permanentDistrictId", "", { shouldDirty: true, shouldValidate: true });
			setValue("permanentUpazilaId", "", { shouldDirty: true, shouldValidate: true });
		}
		if (previous.permanentDistrictId !== permanentDistrictId) {
			setValue("permanentUpazilaId", "", { shouldDirty: true, shouldValidate: true });
		}
		previousAddressValues.current = {
			presentDivisionId,
			presentDistrictId,
			permanentDivisionId,
			permanentDistrictId,
		};
	}, [
		category,
		permanentDistrictId,
		permanentDivisionId,
		presentDistrictId,
		presentDivisionId,
		setValue,
	]);

	useEffect(() => {
		if (category !== "address" || !permanentSameAsPresent) return;
		setValue("permanentAddress", "", { shouldDirty: true, shouldValidate: true });
		setValue("permanentDivisionId", "", { shouldDirty: true, shouldValidate: true });
		setValue("permanentDistrictId", "", { shouldDirty: true, shouldValidate: true });
		setValue("permanentUpazilaId", "", { shouldDirty: true, shouldValidate: true });
	}, [category, permanentSameAsPresent, setValue]);

	if (fieldsInCategory.length === 0) return null;

	const renderField = (field: any) => {
		const fieldKey = field.fieldKey || field.id;
		return (
			<AdmissionConfiguredField
				key={fieldKey}
				control={control}
				field={field}
				required={fieldRequired[fieldKey]}
				setValue={setValue}
				selectedClassId={selectedClassId}
				category={category}
				permanentSameAsPresent={!!permanentSameAsPresent}
			/>
		);
	};

	const renderAddressFields = () => {
		const presentFields = fieldsInCategory.filter((field) => {
			const key = field.fieldKey || field.id;
			return key.startsWith("present");
		});
		const permanentSameAsPresentField = fieldsInCategory.find(
			(field) => (field.fieldKey || field.id) === "permanentSameAsPresent"
		);
		const permanentFields = fieldsInCategory.filter((field) => {
			const key = field.fieldKey || field.id;
			return key.startsWith("permanent") && key !== "permanentSameAsPresent";
		});

		return (
			<div className="space-y-6">
				<div className="rounded-lg border p-4">
					<h4 className="text-foreground mb-4 text-sm font-semibold">
						Present Address
					</h4>
					<div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
						{presentFields.map(renderField)}
					</div>
				</div>

				<div className="rounded-lg border p-4">
					<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h4 className="text-foreground text-sm font-semibold">
							Permanent Address
						</h4>
						{permanentSameAsPresentField && (
							<InputField
								control={control}
								name={permanentSameAsPresentField.fieldKey || permanentSameAsPresentField.id}
								label={permanentSameAsPresentField.label}
								type="checkbox"
								placeholder={permanentSameAsPresentField.placeholder || "Use present address"}
								required={fieldRequired[permanentSameAsPresentField.fieldKey || permanentSameAsPresentField.id]}
								fieldClass="sm:ml-auto"
							/>
						)}
					</div>
					<div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
						{permanentFields.map(renderField)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div key={category} className="space-y-5">
			{admissionMode === "fast" && (
				<div className="flex items-center gap-3 border-b pb-2">
					<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
						{category === "student_info" && <FileText className="h-4 w-4" />}
						{category === "academic_info" && <CheckCircle2 className="h-4 w-4" />}
						{category === "parent_info" && <UserPlus className="h-4 w-4" />}
						{category === "guardian_info" && <UserPlus className="h-4 w-4" />}
						{category === "payment" && <CreditCard className="h-4 w-4" />}
						{category === "health_info" && <AlertCircle className="h-4 w-4" />}
						{category === "documents" && <Database className="h-4 w-4" />}
						{category === "address" && <MapPin className="h-4 w-4" />}
						{category === "additional_info" && <Info className="h-4 w-4" />}
					</div>
					<h3 className="text-foreground text-sm font-bold tracking-tight uppercase">
						{tc(category)}
					</h3>
				</div>
			)}

			{beforeFields}

			{category === "address" ? (
				renderAddressFields()
			) : (
				<div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
					{fieldsInCategory.map(renderField)}
				</div>
			)}
		</div>
	);
}
