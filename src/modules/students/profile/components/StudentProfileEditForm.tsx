"use client";

import AdmissionFormSection from "@/modules/admission/new-admission/components/AdmissionFormSection";
import AdmissionPreview from "@/modules/admission/new-admission/components/AdmissionPreview";
import AdmissionStepper from "@/modules/admission/new-admission/components/AdmissionStepper";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type StudentProfileEditFormProps = {
	studentId: string;
	initialData: any;
	onSuccess?: () => void;
};

type FieldConfig = {
	id: string;
	fieldKey: string;
	category: string;
	section?: string;
	label: string;
	labelBn?: string | null;
	fieldType?: string;
	type?: string;
	options?: any;
	placeholder?: string | null;
	showInFastMode?: boolean;
	showInFullMode?: boolean;
	requiredInFastMode?: boolean;
	requiredInFullMode?: boolean;
	isShown?: boolean;
	isRequired?: boolean;
	sortOrder?: number;
};

const CATEGORY_ORDER = [
	"student_info",
	"academic_info",
	"parent_info",
	"guardian_info",
	"address",
	"health_info",
	"documents",
	"additional_info",
];

const STUDENT_PROFILE_EXCLUDED_FIELDS = new Set([
	"admissionFeeAmount",
	"paymentStatus",
	"paymentMethod",
	"transactionId",
	"paidAt",
	"paymentSlipDocument",
	"payment_slip",
	"paymentSlip",
]);

const normalizeFieldIdentity = (value?: string | null) =>
	String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

const canonicalFieldKey = (field: Partial<FieldConfig>) => {
	if (field.section !== "documents" && field.category !== "documents") {
		return `${field.section || field.category}:${field.fieldKey || field.id}`;
	}
	const documentAliases: Record<string, string> = {
		birth_registration: "birthRegistrationDocument",
		birth_registration_document: "birthRegistrationDocument",
		birth_certificate: "birthRegistrationDocument",
		documents: "documents",
		document: "documents",
		previous_school_testimonial: "previousSchoolTestimonial",
		testimonial: "previousSchoolTestimonial",
		transfer_certificate: "transferCertificateDocument",
		transfer_certificate_document: "transferCertificateDocument",
		father_nid: "fatherNidDocument",
		father_nid_document: "fatherNidDocument",
		mother_nid: "motherNidDocument",
		mother_nid_document: "motherNidDocument",
		guardian_nid: "guardianNidDocument",
		guardian_nid_document: "guardianNidDocument",
		medical_document: "medicalDocument",
		payment_slip: "paymentSlipDocument",
		payment_slip_document: "paymentSlipDocument",
		other_document: "otherDocument",
	};
	const fieldKey = normalizeFieldIdentity(field.fieldKey || field.id);
	const labelKey = normalizeFieldIdentity(field.label);
	return `documents:${documentAliases[fieldKey] || documentAliases[labelKey] || field.fieldKey || field.id}`;
};

function dedupeFields(fields: FieldConfig[]) {
	const byKey = new Map<string, FieldConfig>();
	for (const field of fields) {
		byKey.set(canonicalFieldKey(field), field);
	}
	return Array.from(byKey.values());
}

function isStudentProfileField(field: FieldConfig) {
	const category = field.category || field.section;
	const fieldKey = field.fieldKey || field.id;
	return (
		category !== "payment" &&
		field.section !== "payment" &&
		!STUDENT_PROFILE_EXCLUDED_FIELDS.has(fieldKey)
	);
}

function compactUndefined(data: Record<string, any>) {
	return Object.fromEntries(
		Object.entries(data).filter(([, value]) => value !== undefined)
	);
}

function emptyToNull(value: any) {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	}
	return value;
}

function emptyToNumberOrNull(value: any) {
	const normalized = emptyToNull(value);
	if (normalized === undefined) return undefined;
	if (normalized === null) return null;
	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
}

function getMediaObject(value: any) {
	if (!value) return {};
	if (typeof value === "string") return { url: value };
	if (typeof value !== "object") return {};
	return {
		url: value.url || value.fileUrl || value.documentUrl,
		placeholder: value.placeholder || value.placeholderUrl || value.imagePlaceholder,
		mediaId: value.mediaId || value.id,
	};
}

function buildStudentUpdatePayload(values: Record<string, any>) {
	const photo = getMediaObject(values.studentPhoto || values.photo || values.photoUrl);
	return compactUndefined({
		fullNameEn: emptyToNull(values.studentNameEn || values.fullNameEn || values.fullName),
		fullNameBn: emptyToNull(values.studentNameBn || values.fullNameBn),
		email: emptyToNull(values.email || values.studentEmail),
		dateOfBirth: emptyToNull(values.dateOfBirth),
		gender: emptyToNull(values.gender),
		birthRegistrationNo: emptyToNull(values.birthRegistrationNo),
		bloodGroup: emptyToNull(values.bloodGroup),
		religion: emptyToNull(values.religion),
		nationality: emptyToNull(values.nationality),
		specialQuota: emptyToNull(values.specialQuota),
		photoUrl: emptyToNull(photo.url || values.photoUrl),
		photoPlaceholder: emptyToNull(photo.placeholder || values.photoPlaceholder),
		photoMediaId: emptyToNull(photo.mediaId || values.photoMediaId),
		classId: emptyToNull(values.applyingClassId || values.classId),
		sectionId: emptyToNull(values.sectionId),
		currentSessionId: emptyToNull(values.sessionId || values.currentSessionId),
		rollNumber: emptyToNull(values.rollNumber || values.roll),
		admissionType: emptyToNull(values.admissionType),
		mediumOrVersion: emptyToNull(values.mediumOrVersion),
		shift: emptyToNull(values.shift),
		groupOrDept: emptyToNull(values.groupOrDept),
		previousSchoolName: emptyToNull(values.previousSchoolName),
		previousSchoolEiin: emptyToNull(values.previousSchoolEiin),
		transferCertificateNo: emptyToNull(values.transferCertificateNo),
		lastClassCompleted: emptyToNull(values.lastClassCompleted),
		lastExamResult: emptyToNull(values.lastExamResult),
		fatherName: emptyToNull(values.fatherName),
		fatherNameBn: emptyToNull(values.fatherNameBn),
		fatherNid: emptyToNull(values.fatherNid),
		fatherOccupation: emptyToNull(values.fatherOccupation),
		fatherMobile: emptyToNull(values.fatherMobile),
		motherName: emptyToNull(values.motherName),
		motherNameBn: emptyToNull(values.motherNameBn),
		motherNid: emptyToNull(values.motherNid),
		motherOccupation: emptyToNull(values.motherOccupation),
		motherMobile: emptyToNull(values.motherMobile),
		monthlyFamilyIncome: emptyToNumberOrNull(values.monthlyFamilyIncome),
		guardianName: emptyToNull(values.guardianName),
		guardianRelation: emptyToNull(values.guardianRelation),
		guardianNid: emptyToNull(values.guardianNid),
		guardianMobile: emptyToNull(values.guardianMobile),
		localGuardianName: emptyToNull(values.localGuardianName),
		localGuardianMobile: emptyToNull(values.localGuardianMobile),
		localGuardianAddress: emptyToNull(values.localGuardianAddress),
		emergencyContactName: emptyToNull(values.emergencyContactName),
		emergencyContactPhone: emptyToNull(values.emergencyContactPhone),
		presentAddress: emptyToNull(values.presentAddress),
		presentDivisionId: emptyToNumberOrNull(values.presentDivisionId),
		presentDistrictId: emptyToNumberOrNull(values.presentDistrictId),
		presentUpazilaId: emptyToNumberOrNull(values.presentUpazilaId),
		permanentSameAsPresent: Boolean(values.permanentSameAsPresent),
		permanentAddress: emptyToNull(values.permanentAddress),
		permanentDivisionId: emptyToNumberOrNull(values.permanentDivisionId),
		permanentDistrictId: emptyToNumberOrNull(values.permanentDistrictId),
		permanentUpazilaId: emptyToNumberOrNull(values.permanentUpazilaId),
		allergies: emptyToNull(values.allergies),
		medicalConditions: emptyToNull(values.medicalConditions),
		disabilityType: emptyToNull(values.disabilityType),
		immunizationComplete:
			values.immunizationComplete === undefined
				? undefined
				: Boolean(values.immunizationComplete),
		documents: values.documents ?? undefined,
		customData: values.customData ?? undefined,
		notes: emptyToNull(values.notes || values.internalNotes),
	});
}

function getInitialFieldValue(student: any, field: FieldConfig) {
	const key = field.fieldKey || field.id;
	const aliasMap: Record<string, string[]> = {
		studentNameEn: ["studentNameEn", "fullNameEn", "fullName"],
		fullName: ["fullName", "fullNameEn", "studentNameEn"],
		studentNameBn: ["studentNameBn", "fullNameBn"],
		email: ["email", "studentEmail"],
		studentEmail: ["email", "studentEmail"],
		applyingClassId: ["classId", "applyingClassId", "class"],
		sectionId: ["sectionId"],
		sessionId: ["currentSessionId", "sessionId"],
		studentPhoto: ["studentPhoto", "photoUrl"],
		photo: ["photoUrl", "studentPhoto"],
		rollNumber: ["rollNumber", "roll"],
	};
	const aliases = aliasMap[key] || [key];
	for (const alias of aliases) {
		const value = student?.[alias];
		if (value !== undefined && value !== null) return value;
	}
	if (key.toLowerCase().includes("photo") && student?.photoUrl) return student.photoUrl;
	return "";
}

export default function StudentProfileEditForm({
	studentId,
	initialData,
	onSuccess,
}: StudentProfileEditFormProps) {
	const locale = useLocale();
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [loading, setLoading] = useState(false);

	const { data: settingsResponse, isLoading: settingsLoading } = useSWR(
		"/admission/settings/current"
	);
	const settings = settingsResponse?.data || settingsResponse;
	const rawFields = settings?.fields || settings?.fieldConfigs || [];

	const fields = useMemo<FieldConfig[]>(() => {
		return dedupeFields(rawFields)
			.filter(isStudentProfileField)
			.filter(
				(field) =>
					field.showInFastMode ||
					field.showInFullMode ||
					field.isShown ||
					field.requiredInFastMode ||
					field.requiredInFullMode ||
					field.isRequired
			)
			.map((field) => ({
				...field,
				category: field.category || field.section || "additional_info",
				label: locale === "bn" && field.labelBn ? field.labelBn : field.label,
			}))
			.sort((a, b) => {
				const categoryDiff =
					CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
				if (categoryDiff !== 0) return categoryDiff;
				return (a.sortOrder || 0) - (b.sortOrder || 0);
			});
	}, [locale, rawFields]);

	const categories = useMemo(
		() => CATEGORY_ORDER.filter((category) => fields.some((field) => field.category === category)),
		[fields]
	);
	const isPreviewStep = currentStepIndex === categories.length;

	const fieldRequired = useMemo(() => {
		const required: Record<string, boolean> = {};
		for (const field of fields) {
			const key = field.fieldKey || field.id;
			required[key] = Boolean(
				field.requiredInFastMode || field.requiredInFullMode || field.isRequired
			);
		}
		return required;
	}, [fields]);

	const schema = useMemo(() => {
		const shape: Record<string, z.ZodTypeAny> = {};
		for (const field of fields) {
			const key = field.fieldKey || field.id;
			shape[key] = fieldRequired[key]
				? z.any().refine(
						(value) =>
							value !== undefined &&
							value !== null &&
							!(typeof value === "string" && value.trim() === ""),
						`${field.label} is required`
					)
				: z.any().optional();
		}
		return z.object(shape).passthrough();
	}, [fieldRequired, fields]);

	const defaultValues = useMemo(() => {
		const values: Record<string, any> = {};
		for (const field of fields) {
			values[field.fieldKey || field.id] = getInitialFieldValue(initialData, field);
		}
		values.photoUrl = initialData?.photoUrl || "";
		values.photoPlaceholder = initialData?.photoPlaceholder || "";
		values.photoMediaId = initialData?.photoMediaId || "";
		values.classId = initialData?.classId || initialData?.class?.id || "";
		values.applyingClassId = initialData?.classId || initialData?.class?.id || "";
		values.sectionId = initialData?.sectionId || initialData?.section?.id || "";
		values.sessionId = initialData?.currentSessionId || "";
		values.currentSessionId = initialData?.currentSessionId || "";
		return values;
	}, [fields, initialData]);

	const form = useForm({
		resolver: zodResolver(schema as any),
		defaultValues,
		values: defaultValues,
		mode: "onChange",
	});

	const selectedClassId = form.watch("applyingClassId") || form.watch("classId");

	const validateCurrentStep = async () => {
		if (isPreviewStep) return true;
		const category = categories[currentStepIndex];
		const names = fields
			.filter((field) => field.category === category)
			.map((field) => field.fieldKey || field.id);
		return form.trigger(names);
	};

	const goNext = async () => {
		if (!(await validateCurrentStep())) return;
		setCurrentStepIndex((index) => Math.min(index + 1, categories.length));
	};

	const onSubmit = async (values: Record<string, any>) => {
		setLoading(true);
		try {
			await axios.patch(`/students/${studentId}`, buildStudentUpdatePayload(values));
			toast.success("Student profile updated successfully.");
			onSuccess?.();
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message || "Failed to update student profile."
			);
		} finally {
			setLoading(false);
		}
	};

	if (settingsLoading) {
		return <Skeleton className="h-[560px] w-full rounded-xl" />;
	}

	return (
		<CardShell>
			<div className="border-b p-6 text-center">
				<h2 className="text-2xl font-bold tracking-tight">Student Profile Update Form</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Update the student profile step by step. Admission records will not be changed.
				</p>
			</div>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8 p-6"
				onKeyDown={(event) => {
					if (event.key === "Enter" && !isPreviewStep) {
						event.preventDefault();
						goNext();
					}
				}}
			>
				<AdmissionStepper
					categories={categories}
					currentStepIndex={currentStepIndex}
					isPreviewStep={isPreviewStep}
					onStepClick={setCurrentStepIndex}
					isEditMode
				/>

				{isPreviewStep ? (
					<AdmissionPreview
						fields={fields}
						values={form.getValues()}
						onEditStep={(category) => {
							const index = categories.indexOf(category);
							if (index >= 0) setCurrentStepIndex(index);
						}}
					/>
				) : (
					<AdmissionFormSection
						category={categories[currentStepIndex]}
						admissionFields={fields}
						fieldRequired={fieldRequired}
						control={form.control}
						setValue={form.setValue}
						admissionMode="full"
						selectedClassId={selectedClassId}
					/>
				)}

				<div className="flex gap-4 rounded-lg bg-card p-4">
					{currentStepIndex > 0 && (
						<Button
							type="button"
							variant="outline"
							className="h-12 flex-1"
							onClick={() => setCurrentStepIndex((index) => Math.max(index - 1, 0))}
						>
							Previous
						</Button>
					)}
					{!isPreviewStep ? (
						<Button type="button" className="h-12 flex-1" onClick={goNext}>
							Next Step
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					) : (
						<Button type="submit" className="h-12 flex-1" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Update Student Profile
						</Button>
					)}
				</div>
			</form>
		</CardShell>
	);
}

function CardShell({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto max-w-7xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
			{children}
		</div>
	);
}
