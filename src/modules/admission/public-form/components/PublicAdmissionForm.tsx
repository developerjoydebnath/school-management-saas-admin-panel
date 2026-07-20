"use client";

import InputField from "@/shared/components/form/InputField";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { appConfig } from "@/shared/configs/app.config";
import axios from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";
import { uploadDocument, uploadImage } from "@/shared/services/uploadApi";
import {
	AlertCircle,
	CheckCircle2,
	FileText,
	Loader2,
	School,
	UploadCloud,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type Option = {
	label: string;
	value: string;
	bnLabel?: string | null;
	[key: string]: any;
};

type PortalField = {
	id: string;
	fieldKey: string;
	section: string;
	label: string;
	labelBn?: string | null;
	fieldType: string;
	placeholder?: string | null;
	options?: any;
	dependsOnFieldKey?: string | null;
	isSystem?: boolean;
	isSystemLocked?: boolean;
	sortOrder?: number;
	portal?: {
		isShown?: boolean;
		isRequired?: boolean;
	};
	isShown?: boolean;
	isRequired?: boolean;
};

type PortalConfig = {
	sessionId: string;
	defaultAdmissionFee?: number | string | null;
	referenceEnabled?: boolean;
	fields: PortalField[];
	classes: Array<Option & { sections?: Option[] }>;
	shifts: Option[];
	divisions: Option[];
	districts: Option[];
	upazilas: Option[];
};

const SECTION_ORDER = [
	"student_info",
	"academic_info",
	"parent_info",
	"guardian_info",
	"address",
	"health_info",
	"documents",
	"additional_info",
];

const SECTION_TITLES: Record<string, string> = {
	student_info: "Student Info",
	academic_info: "Academic Info",
	parent_info: "Parent Info",
	guardian_info: "Guardian Info",
	address: "Address",
	health_info: "Health Info",
	documents: "Documents",
	additional_info: "Additional Info",
};

const HIDDEN_PUBLIC_FIELDS = new Set(["sessionId", "session", "sessionYear"]);
const HIDDEN_PUBLIC_SECTIONS = new Set(["payment"]);

const DEFAULT_OPTIONS: Record<string, Option[]> = {
	gender: [
		{ label: "Male", value: "male" },
		{ label: "Female", value: "female" },
		{ label: "Other", value: "other" },
	],
	admissionType: [
		{ label: "New Admission", value: "new" },
		{ label: "Transfer", value: "transfer" },
		{ label: "Re-admission", value: "re_admission" },
	],
	bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => ({
		label: value,
		value,
	})),
	religion: [
		{ label: "Islam", value: "islam" },
		{ label: "Hinduism", value: "hinduism" },
		{ label: "Christianity", value: "christianity" },
		{ label: "Buddhism", value: "buddhism" },
		{ label: "Other", value: "other" },
	],
	specialQuota: [
		{ label: "None", value: "none" },
		{ label: "Freedom Fighter", value: "freedom_fighter" },
		{ label: "Indigenous", value: "indigenous" },
		{ label: "Disability", value: "disability" },
		{ label: "Sibling", value: "sibling" },
		{ label: "Other", value: "other" },
	],
	mediumOrVersion: [
		{ label: "Bangla", value: "bangla" },
		{ label: "English", value: "english" },
		{ label: "Both", value: "both" },
	],
	groupOrDept: [
		{ label: "General", value: "general" },
		{ label: "Science", value: "science" },
		{ label: "Business Studies", value: "business_studies" },
		{ label: "Humanities", value: "humanities" },
	],
};

function unwrap<T>(response: any): T {
	return (response?.data?.data ?? response?.data) as T;
}

function fieldName(field: PortalField) {
	return field.fieldKey || field.id;
}

function normalizeOptions(options: any): Option[] {
	const source = Array.isArray(options) ? options : options?.options;
	if (!Array.isArray(source)) return [];
	return source
		.map((item: any) => {
			if (typeof item === "string") return { label: item, value: item };
			return {
				label: item.label || item.name || item.title || item.value,
				value: String(item.value ?? item.id ?? item.key ?? item.label ?? ""),
			};
		})
		.filter((item: Option) => item.label && item.value);
}

function sectionTitle(section: string) {
	return SECTION_TITLES[section] || section.replace(/_/g, " ");
}

function fileSize(size?: number | string | null) {
	const value = Number(size || 0);
	if (!value) return "";
	if (value < 1024) return `${value} B`;
	if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
	return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
		return url;
	}
	const base = appConfig.API_URL?.replace(/\/$/, "") || "";
	return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function isPhotoField(field: PortalField) {
	const key = fieldName(field).toLowerCase();
	const label = String(field.label || "").toLowerCase();
	return key.includes("photo") || label.includes("photo");
}

function PublicFileField({
	control,
	field,
	required,
}: {
	control: any;
	field: PortalField;
	required: boolean;
}) {
	const name = fieldName(field);
	const {
		field: controllerField,
		fieldState,
	} = useController({
		control,
		name,
		rules: { required: required ? `${field.label} is required` : false },
	});
	const [uploading, setUploading] = useState(false);
	const value = controllerField.value;
	const preview = value?.url || (typeof value === "string" ? value : "");
	const previewUrl = mediaUrl(preview);
	const photoOnly = isPhotoField(field);
	const isImage = String(value?.mimeType || "").startsWith("image/") || photoOnly;

	const handleFile = async (file?: File | null) => {
		if (!file) return;
		if (photoOnly && !file.type.startsWith("image/")) {
			toast.error("Please upload an image file.");
			return;
		}

		setUploading(true);
		try {
			const response = file.type.startsWith("image/")
				? await uploadImage(file, photoOnly ? "student_photo" : "student_document")
				: await uploadDocument(file, "student_document");
			controllerField.onChange({
				type: name,
				label: field.label,
				mediaId: response.mediaId,
				url: response.url,
				placeholder: response.placeholder,
				originalName: file.name,
				mimeType: file.type,
				fileSize: file.size,
				uploadedAt: new Date().toISOString(),
			});
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-2", photoOnly && "md:col-span-2")}>
			<Label className="text-muted-foreground text-sm font-medium">
				{field.label}
				{required ? <span className="text-destructive">*</span> : <span>(Optional)</span>}
			</Label>
			<label
				className={cn(
					"hover:bg-muted/40 flex min-h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed p-4 transition",
					photoOnly && "min-h-48",
					fieldState.error && "border-destructive"
				)}
			>
				<input
					type="file"
					className="hidden"
					accept={photoOnly ? "image/*" : "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"}
					onChange={(event) => handleFile(event.target.files?.[0])}
				/>
				{uploading ? (
					<div className="text-muted-foreground flex items-center gap-2 text-sm">
						<Loader2 className="h-4 w-4 animate-spin" />
						Uploading...
					</div>
				) : preview ? (
					<div className="flex w-full items-center gap-3 rounded-md border p-3">
						{isImage ? (
							<img
								src={previewUrl}
								alt={value?.originalName || field.label}
								className="h-16 w-20 rounded object-cover"
							/>
						) : (
							<FileText className="text-muted-foreground h-8 w-8" />
						)}
						<div className="min-w-0 flex-1">
							<div className="truncate text-sm font-semibold">
								{value?.originalName || field.label}
							</div>
							<div className="text-muted-foreground text-xs">
								{value?.mimeType || "Uploaded file"} {fileSize(value?.fileSize)}
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={(event) => {
								event.preventDefault();
								controllerField.onChange(null);
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="text-muted-foreground text-center text-sm">
						<UploadCloud className="mx-auto mb-2 h-6 w-6" />
						<div>Click or drag file here</div>
						<div className="text-xs">
							{photoOnly ? "Image only" : "Image, PDF, CSV, Excel, Word"}
						</div>
					</div>
				)}
			</label>
			{fieldState.error && (
				<p className="text-destructive text-sm">{fieldState.error.message}</p>
			)}
		</div>
	);
}

function getInputType(field: PortalField) {
	const type = field.fieldType;
	if (type === "textarea") return "textarea";
	if (type === "checkbox") return "checkbox";
	if (type === "number") return "number";
	if (type === "phone") return "tel";
	if (type === "date") return "date";
	if (type === "select" || type === "dynamic_select") return "select";
	return "text";
}

export default function PublicAdmissionForm({
	slug,
	tenant,
}: {
	slug: string;
	tenant?: string;
}) {
	const [config, setConfig] = useState<PortalConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submittedApplication, setSubmittedApplication] = useState<any>(null);

	const form = useForm<Record<string, any>>({
		mode: "onChange",
		defaultValues: {},
	});
	const { control, handleSubmit, reset, setValue } = form;
	const publicRequestConfig = useMemo(
		() =>
			tenant
				? {
					headers: {
						"x-tenant-slug": tenant,
					},
				}
				: undefined,
		[tenant]
	);

	const applyingClassId = useWatch({ control, name: "applyingClassId" });
	const classId = useWatch({ control, name: "classId" });
	const classValue = useWatch({ control, name: "class" });
	const selectedClassId = applyingClassId || classId || classValue;
	const presentDivisionId = useWatch({ control, name: "presentDivisionId" });
	const presentDistrictId = useWatch({ control, name: "presentDistrictId" });
	const permanentDivisionId = useWatch({ control, name: "permanentDivisionId" });
	const permanentDistrictId = useWatch({ control, name: "permanentDistrictId" });
	const permanentSameAsPresent = useWatch({ control, name: "permanentSameAsPresent" });

	useEffect(() => {
		if (!slug) {
			setIsLoading(false);
			return;
		}
		let mounted = true;
		setIsLoading(true);
		axios
			.get(`/public/admission/${slug}/config`, publicRequestConfig)
			.then((response) => {
				if (!mounted) return;
				const data = unwrap<PortalConfig>(response);
				setConfig(data);
				const defaults: Record<string, any> = {
					sessionId: data.sessionId,
					admissionType: "new",
					specialQuota: "none",
					permanentSameAsPresent: false,
				};
				for (const field of data.fields || []) {
					const key = fieldName(field);
					if (defaults[key] === undefined) defaults[key] = field.fieldType === "checkbox" ? false : "";
				}
				defaults.sessionId = data.sessionId;
				reset(defaults);
			})
			.finally(() => {
				if (mounted) setIsLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [slug, publicRequestConfig, reset]);

	useEffect(() => {
		setValue("sectionId", "");
		setValue("section", "");
	}, [selectedClassId, setValue]);

	useEffect(() => {
		setValue("presentDistrictId", "");
		setValue("presentUpazilaId", "");
	}, [presentDivisionId, setValue]);

	useEffect(() => {
		setValue("presentUpazilaId", "");
	}, [presentDistrictId, setValue]);

	useEffect(() => {
		setValue("permanentDistrictId", "");
		setValue("permanentUpazilaId", "");
	}, [permanentDivisionId, setValue]);

	useEffect(() => {
		setValue("permanentUpazilaId", "");
	}, [permanentDistrictId, setValue]);

	useEffect(() => {
		if (permanentSameAsPresent) {
			setValue("permanentAddress", "");
			setValue("permanentDivisionId", "");
			setValue("permanentDistrictId", "");
			setValue("permanentUpazilaId", "");
		}
	}, [permanentSameAsPresent, setValue]);

	const groupedFields = useMemo(() => {
		const groups = new Map<string, PortalField[]>();
		for (const field of config?.fields || []) {
			if (HIDDEN_PUBLIC_FIELDS.has(fieldName(field))) continue;
			if (HIDDEN_PUBLIC_SECTIONS.has(field.section)) continue;
			if (!field.portal?.isShown && !field.isShown) continue;
			const section = field.section || "additional_info";
			groups.set(section, [...(groups.get(section) || []), field]);
		}
		return Array.from(groups.entries()).sort(([a], [b]) => {
			const ai = SECTION_ORDER.indexOf(a);
			const bi = SECTION_ORDER.indexOf(b);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});
	}, [config?.fields]);

	const selectedClass = useMemo(
		() => config?.classes?.find((item) => item.value === selectedClassId),
		[config?.classes, selectedClassId]
	);

	const optionForField = (field: PortalField): Option[] => {
		const key = fieldName(field);
		const source = field.options?.source;
		if (key === "applyingClassId" || key === "classId" || source === "classes") {
			return config?.classes || [];
		}
		if (key === "sectionId" || source === "sections_by_class") {
			return selectedClass?.sections || [];
		}
		if (key === "sessionId" || source === "sessions") {
			return [{ label: "Current Session", value: config?.sessionId || "" }];
		}
		if (key === "shift" || key === "shiftId" || source === "shifts") {
			return config?.shifts || [];
		}
		if (source === "divisions") return config?.divisions || [];
		if (source === "districts_by_division") {
			const divisionId = key.startsWith("permanent") ? permanentDivisionId : presentDivisionId;
			return (config?.districts || []).filter(
				(item) => String(item.divisionId) === String(divisionId)
			);
		}
		if (source === "upazilas_by_district") {
			const districtId = key.startsWith("permanent") ? permanentDistrictId : presentDistrictId;
			return (config?.upazilas || []).filter(
				(item) => String(item.districtId) === String(districtId)
			);
		}
		const configuredOptions = normalizeOptions(field.options);
		return configuredOptions.length > 0 ? configuredOptions : DEFAULT_OPTIONS[key] || [];
	};

	const onSubmit = async (values: Record<string, any>) => {
		if (!config) return;
		setIsSubmitting(true);
		try {
			const documents = (config.fields || [])
				.filter((field) => field.section === "documents" && field.fieldType === "file")
				.map((field) => values[fieldName(field)])
				.filter((value) => value && typeof value === "object" && value.url)
				.map((value) => ({
					fieldKey: value.type,
					documentType: value.type,
					type: value.type,
					label: value.label,
					mediaId: value.mediaId,
					url: value.url,
					placeholder: value.placeholder,
					originalName: value.originalName,
					mimeType: value.mimeType,
					fileSize: value.fileSize,
					uploadedAt: value.uploadedAt,
				}));

			const photoField = (config.fields || []).find((field) => field.fieldType === "file" && isPhotoField(field));
			const photoValue = photoField ? values[fieldName(photoField)] : null;
			const payload: Record<string, any> = {
				...values,
				sessionId: config.sessionId,
				applyingClassId: values.applyingClassId || values.classId || values.class,
				sectionId: values.sectionId || values.section || null,
				studentNameEn: values.studentNameEn || values.fullName || values.studentName || "",
				studentNameBn: values.studentNameBn || values.fullNameBn || "",
				dateOfBirth: values.dateOfBirth || values.dob || "",
				fatherMobile: values.fatherMobile || values.mobile || values.phone || "",
				specialQuota: values.specialQuota === "none" ? null : values.specialQuota,
				customData: "{}",
				documents,
			};

			if (photoValue?.url) {
				payload.photoUrl = photoValue.url;
				payload.photoPlaceholder = photoValue.placeholder || "";
				payload.photoMediaId = photoValue.mediaId || "";
			}

			const response = await axios.post(
				`/public/admission/${slug}/applications`,
				payload,
				publicRequestConfig
			);
			setSubmittedApplication(unwrap<any>(response));
			toast.success("Admission application submitted successfully.");
			window.scrollTo({ top: 0, behavior: "smooth" });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!slug) {
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Admission portal link is missing</AlertTitle>
					<AlertDescription>
						Open this page with a valid portal slug, for example
						`/admission-form?slug=school-admission`.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-6xl space-y-4 p-6">
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-96 rounded-lg" />
			</div>
		);
	}

	if (!config) {
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Admission portal unavailable</AlertTitle>
					<AlertDescription>
						The admission portal is closed, unavailable, or the link is invalid.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (submittedApplication) {
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Card className="w-full text-center">
					<CardHeader>
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
							<CheckCircle2 className="h-7 w-7" />
						</div>
						<CardTitle>Application Submitted</CardTitle>
						<CardDescription>
							Your admission application has been received successfully.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							{submittedApplication.applicationNo && (
								<Badge variant="secondary" className="text-sm">
									Application No: {submittedApplication.applicationNo}
								</Badge>
							)}
						</div>
						<Button onClick={() => window.location.reload()}>Submit Another Application</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<Card className="gap-0 overflow-hidden py-0 shadow-none">
				<CardHeader className="items-center border-b bg-card/80 py-8 text-center">
					<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<School className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">Student Admission Form</CardTitle>
					<CardDescription>
						Please fill in the required details accurately to submit your application.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 p-4 sm:p-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{groupedFields.map(([section, fields]) => (
							<section key={section} className="rounded-lg border bg-card p-4 sm:p-5">
								<div className="mb-5 flex items-center gap-3 border-b pb-4">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
										<FileText className="h-4 w-4" />
									</div>
									<div>
										<h2 className="font-semibold uppercase">{sectionTitle(section)}</h2>
										<p className="text-muted-foreground text-sm">
											Complete the information for this section.
										</p>
									</div>
								</div>
								<div className="grid gap-5 md:grid-cols-2">
									{fields.map((field) => {
										const key = fieldName(field);
										const required = Boolean(field.portal?.isRequired || field.isRequired);
										const type = getInputType(field);
										const disabled =
											key === "sessionId" ||
											(permanentSameAsPresent && key.startsWith("permanent"));
										if (field.fieldType === "file") {
											return (
												<PublicFileField
													key={key}
													control={control}
													field={field}
													required={required}
												/>
											);
										}
										return (
											<InputField
												key={key}
												control={control}
												name={key}
												label={field.label}
												type={type}
												required={required}
												placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
												options={type === "select" ? optionForField(field) : undefined}
												disabled={disabled}
												rules={{
													required: required ? `${field.label} is required` : false,
													pattern:
														type === "tel"
															? {
																value: /^01[3-9]\d{8}$/,
																message: "Enter a valid Bangladeshi mobile number",
															}
															: undefined,
												}}
												fieldClass={
													type === "textarea" || key.includes("Address")
														? "md:col-span-2"
														: undefined
												}
											/>
										);
									})}
								</div>
							</section>
						))}

						<div className="rounded-lg border bg-black p-4">
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
								Submit Admission Application
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
