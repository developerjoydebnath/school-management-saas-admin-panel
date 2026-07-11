"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useAdmissionFormDraft } from "../hooks/useAdmissionFormDraft";
import AdmissionFormSection from "./AdmissionFormSection";
import AdmissionPreview from "./AdmissionPreview";
import AdmissionStepper from "./AdmissionStepper";
import AdmissionSuccessView from "./AdmissionSuccessView";
import DraftRestorationBanner from "./DraftRestorationBanner";

// Extracted impure logic outside the component to satisfy purity rules
const generateStudentId = () => `STU${Math.floor(1000 + Math.random() * 9000)}`;

type AdmissionFieldConfig = {
	id: string;
	fieldKey: string;
	category: string;
	section: string;
	label: string;
	labelBn?: string | null;
	type: string;
	fieldType: string;
	options?: any;
	placeholder?: string | null;
	isRequired?: boolean;
	isShown?: boolean;
	showInFastMode?: boolean;
	showInFullMode?: boolean;
	requiredInFastMode?: boolean;
	requiredInFullMode?: boolean;
	isCustom?: boolean;
	sortOrder?: number;
};

const normalizeFieldIdentity = (value?: string | null) =>
	String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

const canonicalFieldKey = (field: Partial<AdmissionFieldConfig>) => {
	if (field.section !== "documents" && field.category !== "documents") {
		return `${field.section || field.category}:${field.fieldKey || field.id}`;
	}
	const documentAliases: Record<string, string> = {
		birth_registration: "birthRegistrationDocument",
		birth_registration_document: "birthRegistrationDocument",
		birth_certificate: "birthRegistrationDocument",
		birth_certificate_document: "birthRegistrationDocument",
		documents: "documents",
		document: "documents",
		previous_school_testimonial: "previousSchoolTestimonial",
		testimonial: "previousSchoolTestimonial",
		transfer_certificate: "transferCertificateDocument",
		transfer_certificate_document: "transferCertificateDocument",
		tc_scan: "transferCertificateDocument",
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

function dedupeAdmissionFields(fields: any[]) {
	const byKey = new Map<string, any>();
	for (const field of fields) {
		const key = canonicalFieldKey(field);
		const existing = byKey.get(key);
		if (!existing) {
			byKey.set(key, field);
			continue;
		}
		const existingUpdatedAt = new Date(existing.updatedAt || 0).getTime();
		const fieldUpdatedAt = new Date(field.updatedAt || 0).getTime();
		if (fieldUpdatedAt >= existingUpdatedAt) {
			byKey.set(key, field);
		}
	}
	return Array.from(byKey.values());
}

const manualDiscountTypeOptions = [
	{ label: "Flat Amount", value: "fixed_amount" },
	{ label: "Percentage", value: "percentage" },
];

const manualDiscountScopeOptions = [
	{ label: "Admission Fee Only", value: "admission_fee" },
	{ label: "Required Total", value: "required_total" },
	{ label: "All Shown Fees", value: "shown_total" },
];

function normalizeQuotaValue(value: unknown) {
	if (!value) return undefined;
	if (Array.isArray(value)) return value[0];
	if (typeof value === "object") return (value as any)?.value || (value as any)?.quotaType;
	return String(value);
}

const bangladeshMobileRegex = /^01[3-9]\d{8}$/;
const bangladeshMobileMessage = "Enter a valid Bangladeshi mobile number";
const optionalBangladeshMobileSchema = z
	.string()
	.optional()
	.or(z.literal(""))
	.refine((value) => !value || bangladeshMobileRegex.test(value), {
		message: bangladeshMobileMessage,
	});

function AdmissionExtraControls({
	category,
	control,
	settings,
	feeSummary,
}: {
	category: string;
	control: any;
	settings: any;
	feeSummary: any;
}) {
	if (category === "payment" && settings?.manualDiscountEnabled) {
		return (
			<div className="col-span-full rounded-lg border p-4">
				<div className="mb-4">
					<h3 className="text-sm font-semibold">Admission Discount</h3>
					<p className="text-muted-foreground text-xs">
						Optional manual discount. Final amount is recalculated by the backend.
					</p>
				</div>
				<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
					<InputField
						control={control}
						name="manualDiscountType"
						label="Discount Type"
						type="select"
						options={manualDiscountTypeOptions}
						placeholder="Select discount type"
					/>
					<InputField
						control={control}
						name="manualDiscountScope"
						label="Apply On"
						type="select"
						options={manualDiscountScopeOptions}
						placeholder="Select discount scope"
					/>
					<InputField
						control={control}
						name="manualDiscountValue"
						label="Discount Value"
						type="number"
						placeholder="e.g. 500 or 10"
					/>
					<InputField
						control={control}
						name="manualDiscountReason"
						label="Discount Reason"
						type="text"
						placeholder="Enter discount reason"
					/>
				</div>
			</div>
		);
	}

	if (category === "additional_info" && settings?.referenceEnabled) {
		return (
			<div className="col-span-full rounded-lg border p-4">
				<div className="mb-4">
					<h3 className="text-sm font-semibold">Admission Reference</h3>
					<p className="text-muted-foreground text-xs">
						If the mobile number matches an existing user, the backend will link the reference automatically.
					</p>
				</div>
				<div className="grid gap-5 md:grid-cols-2">
					<InputField
						control={control}
						name="referenceName"
						label="Reference Name"
						type="text"
						placeholder="Enter reference name"
					/>
					<InputField
						control={control}
						name="referenceMobile"
						label="Reference Mobile"
						type="tel"
						placeholder="e.g. 01712345678"
					/>
				</div>
			</div>
		);
	}

	return null;
}

function AdmissionDiscountSummary({ feeSummary }: { feeSummary: any }) {
	if (!feeSummary) return null;

	const requiredTotal = Number(feeSummary.requiredTotal || 0);
	const discountAmount = Number(feeSummary.discountAmount || 0);
	const payableAmount = Number(feeSummary.payableAmount ?? requiredTotal);
	const discountBreakdown = Array.isArray(feeSummary.discountBreakdown)
		? feeSummary.discountBreakdown
		: [];
	const sourceLabels: Record<string, string> = {
		manual: "Manual discount",
		quota: "Quota discount",
		configured: "Default discount",
		settings: "Default discount",
	};
	const sourceLabel = sourceLabels[feeSummary.discountSource] || "Discount";
	const reason = feeSummary.discountReason ? ` (${feeSummary.discountReason})` : "";

	return (
		<div className="col-span-full rounded-lg border bg-muted/20 p-4 text-sm">
			<div className="grid gap-2 md:grid-cols-2">
				<div>
					<span className="text-muted-foreground">Required total: </span>
					<span className="font-semibold">BDT {requiredTotal}</span>
				</div>
				<div>
					<span className="text-muted-foreground">Payable: </span>
					<span className="font-semibold">BDT {payableAmount}</span>
				</div>
			</div>
			{discountAmount > 0 && discountBreakdown.length > 0 ? (
				<div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
					{discountBreakdown.map((rule: any, index: number) => (
						<span key={`${rule.source}-${index}`}>
							{sourceLabels[rule.source] || "Discount"}: BDT {Number(rule.amount || 0)}
						</span>
					))}
					<span className="font-medium text-foreground">Total discount: BDT {discountAmount}</span>
				</div>
			) : (
				<p className="text-muted-foreground mt-2">
					{discountAmount > 0
						? `${sourceLabel} of BDT ${discountAmount} is applied${reason}.`
						: "No admission discount is applied."}
				</p>
			)}
		</div>
	);
}

export default function NewAdmissionForm({
	onSuccess,
	initialData,
	id,
}: {
	onSuccess: () => void;
	initialData?: any;
	id?: string;
}) {
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<"form" | "success">("form");
	const [createdStudent, setCreatedStudent] = useState<any>(null);

	const t = useTranslations("AdmissionNew");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data: settingsResponse, isLoading: isSettingsLoading } = useSWR(
		"/admission/settings/current"
	);
	const settings = settingsResponse?.data;
	const { data: shiftsResponse } = useSWR("/shifts/options");
	const shiftOptions = useMemo(() => {
		const options = shiftsResponse?.data || shiftsResponse || [];
		return Array.isArray(options) ? options : [];
	}, [shiftsResponse]);

	const admissionMode = id ? "full" : (settings?.admissionMode || "fast");

	const allFields = useMemo<AdmissionFieldConfig[]>(() => {
		const fields = dedupeAdmissionFields(settings?.fieldConfigs || []);
		return fields
			.filter((field: any) =>
				id
					? (field.showInFastMode ?? field.isShown) ||
						(field.showInFullMode ?? field.isShown)
					: admissionMode === "fast"
					? (field.showInFastMode ?? field.isShown)
					: (field.showInFullMode ?? field.isShown)
			)
			.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
			.map((field: any) => ({
				...field,
				id: field.fieldKey,
				category: field.section,
				type: field.fieldType,
				label: locale === "bn" && field.labelBn ? field.labelBn : field.label,
			}));
	}, [admissionMode, id, locale, settings]);

	const admissionFields = useMemo<AdmissionFieldConfig[]>(() => {
		return allFields;
	}, [allFields]);

	const fieldRequired = useMemo(() => {
		return allFields.reduce((acc: Record<string, boolean>, field: any) => {
			acc[field.fieldKey || field.id] = Boolean(
				id
					? (field.requiredInFastMode ?? field.isRequired) ||
						(field.requiredInFullMode ?? field.isRequired)
					: admissionMode === "fast"
					? (field.requiredInFastMode ?? field.isRequired)
					: (field.requiredInFullMode ?? field.isRequired)
			);
			return acc;
		}, {});
	}, [admissionMode, allFields, id]);

	const isEmptyValue = (value: any) =>
		value === "" ||
		value === undefined ||
		value === null ||
		(Array.isArray(value) && value.length === 0);

	const hasFileValue = (value: any) =>
		!isEmptyValue(value) &&
		(value instanceof File ||
			typeof value === "string" ||
			typeof value === "object");

	const serializeValue = (value: any) => {
		if (value instanceof File) return undefined;
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			if (value.url || value.imageUrl || value.fileUrl || value.path) {
				return value.url || value.imageUrl || value.fileUrl || value.path;
			}
		}
		return value;
	};

	const formatInputDate = (value: any) => {
		if (!value) return "";
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return date.toISOString().slice(0, 10);
	};

	const getInitialFieldValue = (field: AdmissionFieldConfig, fieldKey: string) => {
		if (!initialData) return undefined;
		const fieldType = field.fieldType || field.type;
		const normalizedFieldKey = normalizeFieldIdentity(fieldKey);
		const isPhotoField =
			normalizedFieldKey.includes("photo") ||
			normalizeFieldIdentity(field.label).includes("photo");

		const resolveShiftValue = (value: any) => {
			if (!value) return value;
			const raw = String(value);
			const matchedShift = shiftOptions.find(
				(shift: any) =>
					shift.value === raw ||
					String(shift.label || "").toLowerCase() === raw.toLowerCase()
			);
			return matchedShift?.value || raw;
		};

		if (field.isCustom) {
			try {
				const custom =
					typeof initialData.customData === "string"
						? JSON.parse(initialData.customData || "{}")
						: initialData.customData || {};
				return custom[fieldKey];
			} catch (e) {
				return undefined;
			}
		}

		if (fieldType === "file") {
			const documents = Array.isArray(initialData.documents)
				? initialData.documents
				: [];
			const document = documents.find(
				(item: any) =>
					item?.fieldKey === fieldKey ||
					item?.type === fieldKey ||
					item?.documentType === fieldKey
			);
			if (document) return document;

			if (isPhotoField && initialData.photoUrl) {
				return initialData.photoUrl;
			}
		}

		const aliases: Record<string, any> = {
			fullName: initialData.studentNameEn,
			dob: initialData.dateOfBirth,
			class: initialData.applyingClassId || initialData.classId,
			classId: initialData.applyingClassId || initialData.classId,
			section: initialData.sectionId,
			session: initialData.sessionId,
			sessionYear: initialData.sessionId,
			mobile: initialData.fatherMobile,
			shift: resolveShiftValue(initialData.shiftId || initialData.shift),
			shiftId: resolveShiftValue(initialData.shiftId || initialData.shift),
			specialQuota: normalizeQuotaValue(initialData.specialQuota),
			quota: normalizeQuotaValue(initialData.specialQuota || initialData.quota),
			photo: initialData.photoUrl,
			studentPhoto: initialData.photoUrl,
			photoUrl: initialData.photoUrl,
		};

		const value = aliases[fieldKey] ?? initialData[fieldKey];
		if (fieldType === "date") return formatInputDate(value);
		return value;
	};

	const categories = useMemo(() => {
		const cats = Array.from(
			new Set(admissionFields.map((field: AdmissionFieldConfig) => field.category))
		) as string[];
		const order = [
			"student_info",
			"academic_info",
			"parent_info",
			"guardian_info",
			"address",
			"health_info",
			"payment",
			"documents",
			"additional_info",
		];
		return cats.sort((a, b) => {
			const aIndex = order.indexOf(a);
			const bIndex = order.indexOf(b);
			return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
		});
	}, [admissionFields]);

	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const draftKey = useMemo(
		() => `admission-form-draft:${settings?.sessionId || "current"}`,
		[settings?.sessionId]
	);

	const isPreviewStep = admissionMode === "full" && currentStepIndex === categories.length;

	// Generate dynamic schema and default values
	const { schema, defaultValues } = useMemo(() => {
		const shape: Record<string, any> = {};
		const defaults: Record<string, any> = {};

		admissionFields.forEach((field: AdmissionFieldConfig) => {
			let fieldSchema: any;
			const fieldKey = field.fieldKey || field.id;
			const fieldType = field.fieldType || field.type;
			const isReq = fieldRequired[fieldKey];

			if (fieldType === "checkbox") {
				fieldSchema = z.boolean().optional();
			} else if (fieldType === "file") {
				fieldSchema = z.any();
				if (isReq) {
					fieldSchema = fieldSchema.refine(hasFileValue, {
						message: `${field.label} is required`,
					});
				} else {
					fieldSchema = fieldSchema.optional();
				}
			} else if (fieldType === "phone") {
				fieldSchema = isReq
					? z.string().regex(bangladeshMobileRegex, bangladeshMobileMessage)
					: optionalBangladeshMobileSchema;
			} else if (fieldType === "number" || fieldType === "dynamic_select") {
				fieldSchema = z.union([z.string(), z.number()]);
				if (isReq) {
					fieldSchema = fieldSchema.refine(
						(val: any) => val !== "" && val !== undefined && val !== null,
						{
							message: `${field.label} is required`,
						}
					);
				} else {
					fieldSchema = fieldSchema.optional();
				}
			} else {
				if (isReq) {
					fieldSchema = z.string().min(1, `${field.label} is required`);
				} else {
					fieldSchema = z.string().optional().or(z.literal(""));
				}
			}

			shape[fieldKey] = fieldSchema;
			let val: any = fieldType === "checkbox" ? false : "";
			if (initialData) {
				val = getInitialFieldValue(field, fieldKey);
				if (val === undefined || val === null) val = fieldType === "checkbox" ? false : "";
			}
			defaults[fieldKey] = val;
		});

		shape.photoPlaceholder = shape.photoPlaceholder || z.string().optional().or(z.literal(""));
		shape.photoMediaId = shape.photoMediaId || z.string().optional().or(z.literal(""));
		shape.photoUrl = shape.photoUrl || z.string().optional().or(z.literal(""));
		shape.manualDiscountType = z.string().optional().or(z.literal(""));
		shape.manualDiscountScope = z.string().optional().or(z.literal(""));
		shape.manualDiscountValue = z.union([z.string(), z.number()]).optional();
		shape.manualDiscountReason = z.string().optional().or(z.literal(""));
		shape.referenceName = z.string().optional().or(z.literal(""));
		shape.referenceMobile = optionalBangladeshMobileSchema;
		defaults.photoPlaceholder =
			initialData?.photoPlaceholder || "";
		defaults.photoMediaId = initialData?.photoMediaId || "";
		defaults.photoUrl = initialData?.photoUrl || "";
		const isManualDiscount = initialData?.discountSource === "manual";
		defaults.manualDiscountType =
			initialData?.manualDiscountType ||
			(isManualDiscount ? initialData?.discountType : undefined) ||
			"fixed_amount";
		defaults.manualDiscountScope =
			initialData?.manualDiscountScope ||
			(isManualDiscount ? initialData?.discountScope : undefined) ||
			"required_total";
		defaults.manualDiscountValue =
			initialData?.manualDiscountValue ??
			(isManualDiscount ? initialData?.discountValue : undefined) ??
			(settings?.manualDiscountEnabled ? "0" : "");
		defaults.manualDiscountReason =
			initialData?.manualDiscountReason ||
			(isManualDiscount ? initialData?.discountReason : undefined) ||
			"";
		defaults.referenceName = initialData?.referenceName || "";
		defaults.referenceMobile =
			initialData?.referenceMobile || "";

		return {
			schema: z.object(shape),
			defaultValues: defaults,
		};
	}, [admissionFields, fieldRequired, initialData, shiftOptions]);

	const form = useForm({
		resolver: zodResolver(schema as any),
		defaultValues,
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	useEffect(() => {
		const pendingValidation = new Map<string, number>();
		const subscription = form.watch((_value, info) => {
			if (!info.name) return;
			const fieldState = form.getFieldState(info.name);
			if (!fieldState.error) return;

			form.clearErrors(info.name);
			const previousTimer = pendingValidation.get(info.name);
			if (previousTimer) window.clearTimeout(previousTimer);

			const timer = window.setTimeout(() => {
				form.trigger(info.name as any);
				pendingValidation.delete(info.name as string);
			}, 150);
			pendingValidation.set(info.name, timer);
		});

		return () => {
			subscription.unsubscribe();
			pendingValidation.forEach((timer) => window.clearTimeout(timer));
		};
	}, [form]);

	// Reset form when defaultValues changes (important for async settings/initialData)
	useEffect(() => {
		if (initialData || !form.formState.isDirty) {
			form.reset(defaultValues);
		}
	}, [defaultValues, form, initialData]);

	useEffect(() => {
		if (admissionMode !== "full" || categories.length === 0) return;
		const stepParam = Number(searchParams.get("step"));
		if (!Number.isFinite(stepParam) || stepParam <= 0) return;
		setCurrentStepIndex(Math.min(Math.max(stepParam - 1, 0), categories.length));
	}, [admissionMode, categories.length, searchParams]);

	const updateStepParam = useCallback(
		(index: number) => {
			if (admissionMode !== "full") return;
			const params = new URLSearchParams(searchParams.toString());
			params.set("step", String(index + 1));
			const query = params.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
		},
		[admissionMode, pathname, router, searchParams]
	);

	const { draft, clearDraft, hideDraftBanner, restoreDraft, saveDraftNow } = useAdmissionFormDraft({
		form,
		draftKey,
		ready: Boolean(settings && !isSettingsLoading),
		enabled: Boolean(settings?.draftEnabled && !initialData && !id),
		step: currentStepIndex,
	});

	const handleRestoreDraft = useCallback(() => {
		const storedDraft = restoreDraft();
		if (!storedDraft) return;
		form.reset(storedDraft.values || {});
		const nextStep = Math.min(
			Math.max(Number(storedDraft.step || 0), 0),
			categories.length
		);
		setCurrentStepIndex(nextStep);
		updateStepParam(nextStep);
		hideDraftBanner();
		saveDraftNow(storedDraft.values || {}, nextStep);
	}, [
		categories.length,
		form,
		hideDraftBanner,
		restoreDraft,
		saveDraftNow,
		updateStepParam,
	]);

	const applyingClassId = useWatch({ control: form.control, name: "applyingClassId" });
	const classValue = useWatch({ control: form.control, name: "class" });
	const classIdValue = useWatch({ control: form.control, name: "classId" });
	const sessionIdValue = useWatch({ control: form.control, name: "sessionId" });
	const sessionValue = useWatch({ control: form.control, name: "session" });
	const sessionYearValue = useWatch({ control: form.control, name: "sessionYear" });
	const specialQuotaValue = useWatch({ control: form.control, name: "specialQuota" });
	const quotaValue = useWatch({ control: form.control, name: "quota" });
	const manualDiscountType = useWatch({ control: form.control, name: "manualDiscountType" }) as string | undefined;
	const manualDiscountScope = useWatch({ control: form.control, name: "manualDiscountScope" }) as string | undefined;
	const manualDiscountValue = useWatch({ control: form.control, name: "manualDiscountValue" }) as string | number | undefined;
	const manualDiscountReason = useWatch({ control: form.control, name: "manualDiscountReason" }) as string | undefined;
	const selectedClassId = (applyingClassId || classValue || classIdValue) as string | undefined;
	const selectedSessionId = (sessionIdValue || sessionValue || sessionYearValue) as
		| string
		| undefined;
	const effectiveSessionId = selectedSessionId || settings?.sessionId;
	const selectedQuotaType = normalizeQuotaValue(specialQuotaValue || quotaValue);
	const previousCalculatedPayableRef = useRef<number | null>(null);
	const { data: admissionFeeResponse } = useSWR(
		effectiveSessionId
			? "/admission/settings/fee/calculate"
			: null,
		{
			sessionId: effectiveSessionId,
			classId: selectedClassId,
			manualDiscountType,
			manualDiscountScope,
			manualDiscountValue,
			manualDiscountReason,
			quotaType: selectedQuotaType,
		}
	);

	useEffect(() => {
		if (!settings?.manualDiscountEnabled) {
			form.setValue("manualDiscountValue", "", {
				shouldDirty: false,
				shouldValidate: true,
			});
		}
	}, [form, settings?.manualDiscountEnabled]);

	useEffect(() => {
		const calculatedFee =
			admissionFeeResponse?.data?.payableAmount ??
			admissionFeeResponse?.data?.requiredTotal;
		if (calculatedFee !== undefined && calculatedFee !== null) {
			const nextPayable = Number(calculatedFee);
			const currentPaid = form.getValues("admissionFeeAmount");
			const currentPaidNumber = Number(currentPaid || 0);
			const previousPayable = previousCalculatedPayableRef.current;
			const shouldAutofill =
				currentPaid === undefined ||
				currentPaid === null ||
				currentPaid === "" ||
				previousPayable === null ||
				currentPaidNumber === previousPayable;
			if (shouldAutofill) {
				form.setValue("admissionFeeAmount", String(nextPayable), {
					shouldDirty: false,
					shouldValidate: true,
				});
			}
			previousCalculatedPayableRef.current = nextPayable;
		}
	}, [
		admissionFeeResponse?.data?.payableAmount,
		admissionFeeResponse?.data?.requiredTotal,
		form,
	]);

	useEffect(() => {
		if (!settings?.manualDiscountEnabled) return;
		const maxDiscount = Number(admissionFeeResponse?.data?.requiredTotal || 0);
		const nonManualDiscount = Array.isArray(admissionFeeResponse?.data?.discountBreakdown)
			? admissionFeeResponse.data.discountBreakdown
				.filter((rule: any) => rule.source !== "manual")
				.reduce((sum: number, rule: any) => sum + Number(rule.amount || 0), 0)
			: 0;
		const numericValue = Number(manualDiscountValue || 0);
		const maxValue =
			manualDiscountType === "percentage"
				? 100
				: Math.max(maxDiscount - nonManualDiscount, 0);
		if (!maxValue || !numericValue || numericValue <= maxValue) return;
		form.setValue("manualDiscountValue", String(maxValue), {
			shouldDirty: true,
			shouldValidate: true,
		});
	}, [
		admissionFeeResponse?.data?.discountBreakdown,
		admissionFeeResponse?.data?.requiredTotal,
		form,
		manualDiscountType,
		manualDiscountValue,
		settings?.manualDiscountEnabled,
	]);

	const handleNext = async () => {
		const fieldsInCurrentStep = admissionFields
			.filter((field: AdmissionFieldConfig) => field.category === categories[currentStepIndex])
			.map((field: AdmissionFieldConfig) => field.id);
		const isValid = await form.trigger(fieldsInCurrentStep as any);
		if (isValid) {
			const nextIndex = currentStepIndex + 1;
			setCurrentStepIndex(nextIndex);
			updateStepParam(nextIndex);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handlePrev = () => {
		const prevIndex = Math.max(currentStepIndex - 1, 0);
		setCurrentStepIndex(prevIndex);
		updateStepParam(prevIndex);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const onSubmit = useCallback(
		async (values: any) => {
			// Prevent accidental submission if not in preview step in full mode
			if (admissionMode === "full" && !isPreviewStep) {
				return;
			}
			setLoading(true);
			try {
				const fixedData: Record<string, any> = {};
				const customData: Record<string, any> = {};
				const documentFields = allFields.filter(
					(field) =>
						field.category === "documents" &&
						(field.fieldType || field.type) === "file"
				);
				const documentFieldKeys = new Set(
					documentFields.map((field) => field.fieldKey || field.id)
				);
				const documentsPayload: any[] = [];

				Object.entries(values).forEach(([key, value]) => {
					const field = allFields.find((f) => f.id === key);
					const serializedValue = serializeValue(value);
					if (serializedValue === undefined) return;
					if (documentFieldKeys.has(key)) {
						if (value && typeof value === "object" && !(value instanceof File)) {
							const uploadedDocument = value as Record<string, any>;
							documentsPayload.push({
								fieldKey: key,
								documentType: key,
								type: uploadedDocument.type || key,
								label: uploadedDocument.label || field?.label || key,
								mediaId: uploadedDocument.mediaId,
								url: uploadedDocument.url || serializedValue,
								placeholder: uploadedDocument.placeholder,
								originalName: uploadedDocument.originalName,
								mimeType: uploadedDocument.mimeType,
								fileSize: uploadedDocument.fileSize,
								uploadedAt: uploadedDocument.uploadedAt,
							});
						} else if (serializedValue) {
							documentsPayload.push({
								fieldKey: key,
								documentType: key,
								type: key,
								label: field?.label || key,
								url: serializedValue,
							});
						}
						return;
					}
					if (field?.isCustom) {
						customData[key] = serializedValue;
					} else {
						fixedData[key] = serializedValue;
					}
				});

				if (Array.isArray(values.documents)) {
					documentsPayload.push(
						...values.documents
							.map((document: any) => {
								const file = document?.file;
								if (!file) return null;
								return {
									fieldKey: document.type || "other",
									documentType: document.type || "other",
									type: document.type || "other",
									mediaId: file.mediaId,
									url: file.url,
									placeholder: file.placeholder,
									originalName: file.originalName,
									uploadedAt: file.uploadedAt,
								};
							})
							.filter(Boolean)
					);
				}

				if (documentsPayload.length > 0) {
					fixedData.documents = documentsPayload;
				}

				const payload = {
					...fixedData,
					specialQuota: selectedQuotaType || fixedData.specialQuota || fixedData.quota || null,
					customData: JSON.stringify(customData),
					status: initialData?.status || "pending",
					date: initialData?.date || new Date().toISOString(),
					admissionMode,
					completionPercent: admissionMode === "full" ? 100 : 42,
				};

				console.log("Submitting Admission Payload:", payload);

				if (id) {
					await axios.patch(`/admissions/${id}`, payload);
					toast.success("Application updated successfully!");
				} else {
					const response = await axios.post("/admissions", payload);
					clearDraft();
					setCreatedStudent({
						id: response.data?.data?.id || response.data?.id || generateStudentId(),
						name: values.studentNameEn || values.fullName,
						class: values.applyingClassId || values.class,
						completion: admissionMode === "full" ? 100 : 42,
					});
					setStep("success");
					toast.success("Student admission successful!");
				}

				onSuccess?.();
			} catch (err) {
				console.error("Error saving admission:", err);
				toast.error("Failed to save application. Please try again.");
			} finally {
				setLoading(false);
			}
		},
		[
			allFields,
			onSuccess,
			admissionMode,
			id,
			initialData,
			isPreviewStep,
			clearDraft,
			selectedQuotaType,
		]
	);

	if (step === "success" && createdStudent) {
		return (
			<AdmissionSuccessView
				student={createdStudent}
				onReset={() => {
					setStep("form");
					setCurrentStepIndex(0);
					updateStepParam(0);
					form.reset();
				}}
			/>
		);
	}

	if (isSettingsLoading) {
		return (
			<div className="mx-auto w-full max-w-7xl space-y-4">
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-96 rounded-lg" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl">
			<Card className="gap-0 overflow-hidden py-0 shadow-none ring-0">
				<CardHeader className="space-y-1 border-b py-6 text-center">
					<CardTitle className="text-2xl font-bold">{t("formTitle")}</CardTitle>
					<CardDescription>{t("formDescription")}</CardDescription>
				</CardHeader>

				<CardContent className="py-6">
					{draft && (
						<DraftRestorationBanner
							savedAt={draft.savedAt}
							onRestore={handleRestoreDraft}
							onDiscard={clearDraft}
						/>
					)}

					{admissionMode === "full" && (
						<AdmissionStepper
							categories={categories}
							currentStepIndex={currentStepIndex}
							isPreviewStep={isPreviewStep}
							isEditMode={!!id}
							onStepClick={(index) => {
								setCurrentStepIndex(index);
								updateStepParam(index);
								window.scrollTo({ top: 0, behavior: "smooth" });
							}}
						/>
					)}

					<form
						onSubmit={form.handleSubmit(onSubmit)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && admissionMode === "full" && !isPreviewStep) {
								e.preventDefault();
								handleNext();
							}
						}}
						className="space-y-8"
					>
						<div className="space-y-10">
							{admissionMode === "fast" ? (
								categories.map((category) => (
									<Card key={category} className="rounded-xl p-0 bg-card/70 shadow-none">
										<CardContent className="space-y-5 p-4">
											<AdmissionFormSection
												category={category}
												admissionFields={admissionFields}
												fieldRequired={fieldRequired}
												control={form.control}
												setValue={form.setValue}
												admissionMode={admissionMode}
												selectedClassId={selectedClassId}
												beforeFields={
													category === "payment" ? (
														<AdmissionExtraControls
															category={category}
															control={form.control}
															settings={settings}
															feeSummary={admissionFeeResponse?.data}
														/>
													) : null
												}
											/>
											{category !== "payment" && (
												<AdmissionExtraControls
													category={category}
													control={form.control}
													settings={settings}
													feeSummary={admissionFeeResponse?.data}
												/>
											)}
										</CardContent>
									</Card>
								))
							) : isPreviewStep ? (
								<AdmissionPreview
									fields={admissionFields}
									values={form.getValues()}
									feeSummary={admissionFeeResponse?.data}
									onEditStep={(category) => {
										const index = categories.indexOf(category);
										if (index !== -1) {
											setCurrentStepIndex(index);
											updateStepParam(index);
											window.scrollTo({ top: 0, behavior: "smooth" });
										}
									}}
								/>
							) : (
								<>
									<AdmissionFormSection
										category={categories[currentStepIndex]}
										admissionFields={admissionFields}
										fieldRequired={fieldRequired}
										control={form.control}
										setValue={form.setValue}
										admissionMode={admissionMode}
										selectedClassId={selectedClassId}
										beforeFields={
											categories[currentStepIndex] === "payment" ? (
												<AdmissionExtraControls
													category={categories[currentStepIndex]}
													control={form.control}
													settings={settings}
													feeSummary={admissionFeeResponse?.data}
												/>
											) : null
										}
									/>
									{categories[currentStepIndex] !== "payment" && (
										<AdmissionExtraControls
											category={categories[currentStepIndex]}
											control={form.control}
											settings={settings}
											feeSummary={admissionFeeResponse?.data}
										/>
									)}
								</>
							)}
						</div>

						{admissionMode === "fast" && (
							<AdmissionDiscountSummary feeSummary={admissionFeeResponse?.data} />
						)}

						{admissionMode === "fast" && (
							<div className="border-primary/10 bg-primary/5 flex gap-3 rounded-xl border p-4">
								<Info className="text-primary h-5 w-5 shrink-0" />
								<p className="text-primary/80 text-xs leading-relaxed">
									<strong>{t("fastEnrollmentMode")}</strong>{" "}
									{t("fastEnrollmentDesc")}
								</p>
							</div>
						)}

						<div className="flex flex-col items-stretch gap-4 sm:flex-row">
							{admissionMode === "full" && currentStepIndex > 0 && (
								<Button
									key="prev-button"
									type="button"
									variant="outline"
									onClick={handlePrev}
									className="h-12 flex-1 text-base font-semibold"
								>
									Previous
								</Button>
							)}
							{admissionMode === "full" && !isPreviewStep ? (
								<Button
									key="next-button"
									type="button"
									onClick={handleNext}
									className="h-12 flex-1 text-base font-semibold"
								>
									Next Step
									<ArrowRight className="h-5 w-5" />
								</Button>
							) : (
								<Button
									key="submit-button"
									type="submit"
									disabled={loading}
									className={cn(
										"h-12 flex-1 text-base font-semibold",
										admissionMode === "full" ? "bg-green-600 hover:bg-green-700" : ""
									)}
								>
									{loading ? (
										<>
											<Loader2 className="h-5 w-5 animate-spin" />
											{t("processingAdmission")}
										</>
									) : admissionMode === "full" ? (
										"Complete Admission"
									) : (
										<>
											{t("completeAdmission")}
											<ArrowRight className="h-5 w-5" />
										</>
									)}
								</Button>
							)}
							{isPreviewStep && (
								<Button
									key="cancel-button"
									type="button"
									variant="destructive"
									onClick={() => {
										form.reset();
										setCurrentStepIndex(0);
										updateStepParam(0);
										clearDraft();
									}}
									className="h-12 flex-1 text-base font-semibold"
								>
									Cancel Admission
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
