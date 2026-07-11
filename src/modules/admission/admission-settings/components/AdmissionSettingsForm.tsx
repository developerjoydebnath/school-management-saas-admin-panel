"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { Info, LayoutGrid, RotateCcw, Save, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AddCustomFieldDialog } from "./AddCustomFieldDialog";

type AdmissionFieldConfig = {
	id: string;
	fieldKey: string;
	section: string;
	label: string;
	labelBn?: string | null;
	fieldType: string;
	options?: any;
	placeholder?: string | null;
	isSystem: boolean;
	isSystemLocked: boolean;
	isShown: boolean;
	isRequired: boolean;
	showInFastMode?: boolean;
	showInFullMode?: boolean;
	requiredInFastMode?: boolean;
	requiredInFullMode?: boolean;
	isCustom: boolean;
	sortOrder: number;
};

const normalizeFieldIdentity = (value?: string | null) =>
	String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

const canonicalFieldKey = (field: Partial<AdmissionFieldConfig>) => {
	if (field.section !== "documents") return `${field.section}:${field.fieldKey || field.id}`;
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

function dedupeAdmissionFields(fields: AdmissionFieldConfig[]) {
	const byKey = new Map<string, AdmissionFieldConfig>();
	for (const field of fields) {
		const key = canonicalFieldKey(field);
		const existing = byKey.get(key);
		if (!existing) {
			byKey.set(key, field);
			continue;
		}
		const existingUpdatedAt = new Date((existing as any).updatedAt || 0).getTime();
		const fieldUpdatedAt = new Date((field as any).updatedAt || 0).getTime();
		if (fieldUpdatedAt >= existingUpdatedAt) {
			byKey.set(key, field);
		}
	}
	return Array.from(byKey.values());
}

const FieldConfigRow = memo(function FieldConfigRow({
	field,
	locale,
	t,
	tForms,
	onToggle,
	onRemove,
}: {
	field: AdmissionFieldConfig;
	locale: string;
	t: any;
	tForms: any;
	onToggle: (
		fieldId: string,
		flag:
			| "showInFastMode"
			| "requiredInFastMode"
			| "showInFullMode"
			| "requiredInFullMode"
	) => void;
	onRemove: (fieldId: string) => void;
}) {
	const modeCell = (
		flag:
			| "showInFastMode"
			| "requiredInFastMode"
			| "showInFullMode"
			| "requiredInFullMode",
		fallback: boolean,
		positiveClass: string,
		positiveLabel: string,
		negativeLabel: string
	) => {
		const checked = Boolean(field[flag] ?? fallback);
		return (
			<div className="flex items-center gap-3">
				<Switch
					checked={checked}
					onCheckedChange={() => onToggle(field.id, flag)}
					disabled={field.isSystemLocked}
				/>
				<span className={checked ? positiveClass : "text-sm text-gray-400"}>
					{checked ? positiveLabel : negativeLabel}
				</span>
			</div>
		);
	};

	return (
		<TableRow>
			<TableCell className="pl-6 font-medium">
				<div className="flex items-center gap-2">
					{locale === "bn" && field.labelBn ? field.labelBn : field.label}
					{field.isSystem ? (
						<Badge
							variant="secondary"
							className="h-4 border-none bg-gray-100 text-[10px] text-gray-600"
						>
							{t("systemBadge")}
						</Badge>
					) : field.isCustom ? (
						<Badge
							variant="outline"
							className="h-4 border-blue-200 bg-blue-50 text-[10px] text-blue-600"
						>
							{t("customBadge")}
						</Badge>
					) : null}
				</div>
			</TableCell>
			<TableCell className="text-muted-foreground text-sm capitalize">
				{field.fieldType}
			</TableCell>
			<TableCell>
				{modeCell(
					"showInFastMode",
					field.isShown,
					"text-sm font-semibold text-green-600",
					t("shown"),
					t("hidden")
				)}
			</TableCell>
			<TableCell>
				{modeCell(
					"requiredInFastMode",
					field.isRequired,
					"text-sm font-semibold text-blue-600",
					t("mandatory"),
					t("optional")
				)}
			</TableCell>
			<TableCell>
				{modeCell(
					"showInFullMode",
					field.isShown,
					"text-sm font-semibold text-green-600",
					t("shown"),
					t("hidden")
				)}
			</TableCell>
			<TableCell>
				{modeCell(
					"requiredInFullMode",
					field.isRequired,
					"text-sm font-semibold text-blue-600",
					t("mandatory"),
					t("optional")
				)}
			</TableCell>
			<TableCell className="pr-6 text-right">
				{field.isCustom && (
					<ConfirmationModal
						title={t("removeFieldTitle")}
						description={t("removeFieldDesc")}
						onConfirm={() => onRemove(field.id)}
						cancelText={tForms("cancel")}
						confirmText={t("remove")}
						variant="destructive"
					>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</AlertDialogTrigger>
					</ConfirmationModal>
				)}
			</TableCell>
		</TableRow>
	);
});

export default function AdmissionSettingsForm() {
	const t = useTranslations("AdmissionSettings");
	const tForms = useTranslations("Forms");
	const tc = useTranslations("Common");
	const locale = useLocale();
	const { data: settingsResponse, isLoading, mutate } = useSWR("/admission/settings/current");
	const settings = settingsResponse?.data;
	const [admissionMode, setAdmissionMode] = useState<"fast" | "full">("fast");
	const [fields, setFields] = useState<AdmissionFieldConfig[]>([]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.removeItem("admission-settings-v2");
		window.localStorage.removeItem("admission-settings-storage");
	}, []);

	useEffect(() => {
		if (!settings) return;
		setAdmissionMode(settings.admissionMode || "fast");
		setFields(
			dedupeAdmissionFields(
				[...(settings.fieldConfigs || [])].sort((a, b) => a.sortOrder - b.sortOrder)
			)
		);
	}, [settings]);

	const toggleVisibility = (fieldId: string) => {
		setFields((current) =>
			current.map((field) =>
				field.id === fieldId && !field.isSystemLocked
					? { ...field, isShown: !field.isShown }
					: field
			)
		);
	};

	const toggleRequired = (fieldId: string) => {
		setFields((current) =>
			current.map((field) =>
				field.id === fieldId && !field.isSystemLocked
					? { ...field, isRequired: !field.isRequired }
					: field
			)
		);
	};

	const toggleModeFlag = useCallback((
		fieldId: string,
		flag:
			| "showInFastMode"
			| "requiredInFastMode"
			| "showInFullMode"
			| "requiredInFullMode"
	) => {
		setFields((current) =>
			current.map((field) =>
				field.id === fieldId && !field.isSystemLocked
					? { ...field, [flag]: !field[flag] }
					: field
			)
		);
	}, []);

	const persistSettings = async (
		mode: "fast" | "full" = admissionMode,
		overrides: Record<string, any> = {}
	) => {
		if (!settings?.sessionId) return;
		await axios.put(`/admission/settings/${settings.sessionId}`, {
			admissionMode: mode,
			onlinePortalEnabled: settings.onlinePortalEnabled,
			onlinePortalSlug: settings.onlinePortalSlug,
			onlinePortalOpensAt: settings.onlinePortalOpensAt,
			onlinePortalClosesAt: settings.onlinePortalClosesAt,
			draftEnabled: settings.draftEnabled,
			discountEnabled: settings.discountEnabled,
			discountType: settings.discountType,
			discountScope: settings.discountScope,
			discountValue: Number(settings.discountValue || 0),
			discountMaxAmount:
				settings.discountMaxAmount === null ? null : Number(settings.discountMaxAmount || 0),
			manualDiscountEnabled: settings.manualDiscountEnabled,
			referenceEnabled: settings.referenceEnabled,
			defaultAdmissionFee: settings.defaultAdmissionFee,
			applicationPrefix: settings.applicationPrefix,
			...overrides,
		});
	};

	const handleModeChange = async (mode: "fast" | "full") => {
		if (mode === admissionMode) return;
		setAdmissionMode(mode);
		await persistSettings(mode);
		await mutate();
		toast.success(t("saveSuccess"));
	};

	const handleDraftChange = async (enabled: boolean) => {
		await persistSettings(admissionMode, { draftEnabled: enabled });
		await mutate();
		toast.success(t("saveSuccess"));
	};

	const handleSave = async () => {
		if (!settings?.sessionId) return;
		await persistSettings();
		await axios.put(`/admission/settings/${settings.sessionId}/fields`, {
			fields: fields.map((field) => ({
				fieldKey: field.fieldKey,
				section: field.section,
				label: field.label,
				labelBn: field.labelBn,
				fieldType: field.fieldType,
				options: field.options,
				placeholder: field.placeholder,
				isSystem: field.isSystem,
				isSystemLocked: field.isSystemLocked,
				isShown: field.isShown,
				isRequired: field.isRequired,
				showInFastMode: field.showInFastMode ?? field.isShown,
				showInFullMode: field.showInFullMode ?? field.isShown,
				requiredInFastMode: field.requiredInFastMode ?? field.isRequired,
				requiredInFullMode: field.requiredInFullMode ?? field.isRequired,
				isCustom: field.isCustom,
				sortOrder: field.sortOrder,
			})),
		});
		await mutate();
		toast.success(t("saveSuccess"));
	};

	const handleCreateCustomField = async (field: any) => {
		if (!settings?.sessionId) return;
		await axios.post(`/admission/settings/${settings.sessionId}/fields/custom`, {
			fieldKey: field.id,
			section: field.category,
			label: field.label,
			fieldType: field.type,
			isShown: true,
			isRequired: false,
			isCustom: true,
			sortOrder: fields.length * 10 + 100,
		});
		await mutate();
	};

	const handleRemoveField = useCallback(async (fieldId: string) => {
		await axios.delete(`/admission/settings/fields/${fieldId}`);
		await mutate();
	}, [mutate]);

	const categories = useMemo(
		() => Array.from(new Set(fields.map((field) => field.section))),
		[fields]
	);

	if (isLoading) {
		return (
			<div className="space-y-4 pt-4">
				<Skeleton className="h-36 rounded-lg" />
				<Skeleton className="h-12 rounded-lg" />
				<Skeleton className="h-80 rounded-lg" />
			</div>
		);
	}

	return (
		<div className="space-y-6 pt-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">{t("admissionMode")}</CardTitle>
					<CardDescription>{t("admissionModeDesc")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-center gap-6">
						<ConfirmationModal
							onConfirm={() => handleModeChange("fast")}
							title={t("confirmModeChangeTitle")}
							description={t("confirmModeChangeDesc")}
							confirmText={tForms("confirm")}
							cancelText={tForms("cancel")}
						>
							<AlertDialogTrigger asChild>
								<div
									className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${admissionMode === "fast" ? "border-primary bg-primary/5" : "hover:border-primary/50 border-border"}`}
								>
									<div className="font-semibold">{t("fastMode")}</div>
									<div className="text-muted-foreground text-sm">
										{t("fastModeDesc")}
									</div>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>

						<ConfirmationModal
							onConfirm={() => handleModeChange("full")}
							title={t("confirmModeChangeTitle")}
							description={t("confirmModeChangeDesc")}
							confirmText={tForms("confirm")}
							cancelText={tForms("cancel")}
						>
							<AlertDialogTrigger asChild>
								<div
									className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${admissionMode === "full" ? "border-primary bg-primary/5" : "hover:border-primary/50 border-border"}`}
								>
									<div className="font-semibold">{t("fullMode")}</div>
									<div className="text-muted-foreground text-sm">
										{t("fullModeDesc")}
									</div>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>
						<ConfirmationModal
							onConfirm={() => handleDraftChange(!(settings?.draftEnabled ?? true))}
							title="Change draft mode?"
							description="This will update whether new admission forms can save browser drafts."
							confirmText={tForms("confirm")}
							cancelText={tForms("cancel")}
						>
							<AlertDialogTrigger asChild>
								<div
									role="button"
									tabIndex={0}
									className="ml-auto flex min-w-56 items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/40"
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											event.currentTarget.click();
										}
									}}
								>
							<div>
								<div className="text-sm font-semibold">Draft Mode</div>
										<div className="text-muted-foreground text-xs">
											Allow browser draft restore.
										</div>
									</div>
									<Switch
										checked={settings?.draftEnabled ?? true}
								aria-hidden="true"
								tabIndex={-1}
							/>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<div className="flex gap-2">
					<ConfirmationModal
						onConfirm={() => mutate()}
						confirmText={t("resetAll")}
						cancelText={tForms("cancel")}
						title={t("resetConfirmTitle")}
						description={t("resetConfirmDesc")}
					>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">
								<RotateCcw className="h-4 w-4" />
								{t("resetAll")}
							</Button>
						</AlertDialogTrigger>
					</ConfirmationModal>

					<AddCustomFieldDialog onAdd={handleCreateCustomField} />

					<Button onClick={handleSave}>
						<Save className="h-4 w-4" />
						{t("saveConfiguration")}
					</Button>
				</div>
			</div>

			<div className="grid gap-6">
				{categories.map((category) => (
					<Card key={category} className="gap-0 py-0 shadow-none">
						<CardHeader className="gap-1 bg-blue-100/10 py-3 dark:bg-black/20">
							<div className="flex items-start justify-between gap-3">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<LayoutGrid className="h-4 w-4" />
										<CardTitle className="text-lg capitalize">
											{t(`categories.${category}`)}
										</CardTitle>
									</div>
									<CardDescription>{t("description")}</CardDescription>
								</div>
								{category === "documents" && (
									<AddCustomFieldDialog
										triggerLabel="Add Document Field"
										defaultCategory="documents"
										defaultType="file"
										lockCategoryType
										onAdd={handleCreateCustomField}
									/>
								)}
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow className="border-t">
										<TableHead className="pl-6">{t("fieldHeader")}</TableHead>
										<TableHead>{t("typeHeader")}</TableHead>
										<TableHead>Fast Shown</TableHead>
										<TableHead>Fast Required</TableHead>
										<TableHead>Full Shown</TableHead>
										<TableHead>Full Required</TableHead>
										<TableHead className="pr-6 text-right">
											{t("actionsHeader")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{fields
										.filter((field) => field.section === category)
										.map((field) => (
											<FieldConfigRow
												key={field.id}
												field={field}
												locale={locale}
												t={t}
												tForms={tForms}
												onToggle={toggleModeFlag}
												onRemove={handleRemoveField}
											/>
										))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="border-amber-100 bg-amber-50/50 dark:border-amber-950 dark:bg-amber-950/30">
				<CardContent>
					<div className="flex gap-3">
						<Info className="mt-0.5 h-5 w-5 text-amber-600" />
						<div className="space-y-1">
							<p className="text-sm font-medium text-amber-900 dark:text-amber-200">
								{t("infoTitle")}
							</p>
							<p className="text-sm text-amber-700">{t("infoDesc")}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
