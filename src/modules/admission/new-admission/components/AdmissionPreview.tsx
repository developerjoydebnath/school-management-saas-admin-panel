"use client";

import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import {
	AlertCircle,
	CheckCircle2,
	CreditCard,
	Database,
	FileText,
	Info,
	MapPin,
	Pencil,
	UserPlus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AdmissionFieldCategory } from "../../admission-settings/constants/admission-fields";

interface AdmissionPreviewProps {
	fields: any[];
	values: any;
	feeSummary?: any;
	onEditStep?: (category: AdmissionFieldCategory) => void;
}

export default function AdmissionPreview({
	fields,
	values,
	feeSummary,
	onEditStep,
}: AdmissionPreviewProps) {
	const tc = useTranslations("AdmissionSettings.categories");
	const locale = useLocale();
	const { data: classResponse } = useSWR("/classes/active-list");
	const { data: sessionResponse } = useSWR("/sessions/active-list");
	const { data: divisionResponse } = useSWR("/public/locations/divisions");
	const { data: districtResponse } = useSWR(
		values.presentDivisionId || values.divisionId
			? `/public/locations/districts/${values.presentDivisionId || values.divisionId}`
			: null
	);
	const { data: upazilaResponse } = useSWR(
		values.presentDistrictId || values.districtId
			? `/public/locations/upazilas/${values.presentDistrictId || values.districtId}`
			: null
	);

	const unwrapOptions = (response: any) => {
		const data = response?.data ?? response;
		if (Array.isArray(data)) return data;
		if (Array.isArray(data?.items)) return data.items;
		if (Array.isArray(data?.data)) return data.data;
		return [];
	};

	const classes = unwrapOptions(classResponse);
	const sessions = unwrapOptions(sessionResponse);
	const divisions = unwrapOptions(divisionResponse);
	const districts = unwrapOptions(districtResponse);
	const upazilas = unwrapOptions(upazilaResponse);
	const categories = Array.from(new Set(fields.map((field) => field.category)));

	const getCategoryIcon = (category: string) => {
		const iconClass = "h-4 w-4";
		switch (category) {
			case "student_info":
				return <FileText className={iconClass} />;
			case "academic_info":
				return <CheckCircle2 className={iconClass} />;
			case "parent_info":
				return <UserPlus className={iconClass} />;
			case "guardian_info":
				return <UserPlus className={iconClass} />;
			case "address":
				return <MapPin className={iconClass} />;
			case "documents":
				return <Database className={iconClass} />;
			case "health_info":
				return <AlertCircle className={iconClass} />;
			case "payment":
				return <CreditCard className={iconClass} />;
			case "additional_info":
				return <Info className={iconClass} />;
			default:
				return <FileText className={iconClass} />;
		}
	};

	const findOptionLabel = (field: any, value: any) => {
		const options = Array.isArray(field.options)
			? field.options
			: Array.isArray(field.options?.options)
				? field.options.options
				: [];
		const option = options.find((item: any) => String(item.value) === String(value));
		return option?.label || option?.name;
	};

	const findName = (items: any[], value: any) => {
		const item = items.find(
			(entry: any) =>
				String(entry.id) === String(value) ||
				String(entry.value) === String(value)
		);
		if (!item) return undefined;
		if (typeof item.name === "object") return getLocalizedName(item.name, locale);
		return item.label || item.name || item.enName || item.bnName;
	};

	const formatPreviewDate = (value: any) => {
		if (!value) return "-";
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return date.toISOString().slice(0, 10);
	};

	const getMediaMeta = (field: any) => {
		const value = values[field.id];
		if (!value) return null;
		if (typeof File !== "undefined" && value instanceof File) {
			return {
				name: value.name,
				type: value.type,
				size: value.size,
				url: undefined,
			};
		}

		if (typeof value === "string") {
			const isUrl = value.startsWith("/") || value.startsWith("http");
			return isUrl ? { url: value, name: field.label || "Uploaded file" } : null;
		}

		if (typeof value !== "object") return null;
		const url =
			value.url ||
			value.fileUrl ||
			value.documentUrl ||
			value.photoUrl ||
			value.path ||
			value.src;
		if (!url) return null;
		return {
			url,
			placeholder: value.placeholder || value.placeholderUrl || value.photoPlaceholder,
			name: value.originalName || value.name || value.fileName || field.label || "Uploaded file",
			type: value.mimeType || value.type || value.contentType,
			size: value.size,
		};
	};

	const isImageMedia = (media: any) => {
		const marker = `${media?.type || ""} ${media?.url || ""}`.toLowerCase();
		return (
			marker.includes("image/") ||
			/\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(String(media?.url || ""))
		);
	};

	const isFileLikeField = (field: any) => {
		const key = String(field.fieldKey || field.id || "").toLowerCase();
		return (
			field.type === "file" ||
			field.fieldType === "file" ||
			key.includes("photo") ||
			key.includes("document") ||
			key.includes("certificate") ||
			key.includes("nid") ||
			key.includes("slip")
		);
	};

	const getPreviewValue = (field: any) => {
		const value = values[field.id];
		if (value === undefined || value === null || value === "") return "-";
		if (typeof File !== "undefined" && value instanceof File) return value.name;
		if (typeof value === "object") {
			return (
				value.label ||
				value.originalName ||
				value.name ||
				value.fileName ||
				value.url ||
				"-"
			);
		}

		const fieldKey = field.fieldKey || field.id;
		if (field.type === "date" || field.fieldType === "date" || /date|dob|paidAt/i.test(fieldKey)) {
			return formatPreviewDate(value);
		}
		const optionLabel = findOptionLabel(field, value);
		if (optionLabel) return optionLabel;
		if (["applyingClassId", "classId", "class"].includes(fieldKey)) {
			return findName(classes, value) || value;
		}
		if (["sessionId", "session", "sessionYear"].includes(fieldKey)) {
			return findName(sessions, value) || value;
		}
		if (["sectionId", "section"].includes(fieldKey)) {
			const selectedClassId = values.applyingClassId || values.classId || values.class;
			const selectedClass = classes.find(
				(item: any) => String(item.id) === String(selectedClassId)
			);
			const section = selectedClass?.sections?.find(
				(item: any) =>
					String(item.id) === String(value) || String(item.name) === String(value)
			);
			return section?.name || value;
		}
		if (fieldKey.toLowerCase().includes("division")) {
			return findName(divisions, value) || value;
		}
		if (fieldKey.toLowerCase().includes("district")) {
			return findName(districts, value) || value;
		}
		if (fieldKey.toLowerCase().includes("upazila")) {
			return findName(upazilas, value) || value;
		}
		return String(value);
	};

	const PreviewValue = ({ field }: { field: any }) => {
		const media = isFileLikeField(field) ? getMediaMeta(field) : null;
		if (media) {
			if (media.url && isImageMedia(media)) {
				return (
					<div className="mt-2">
						<ProgressiveImage
							src={media.url}
							alt={media.name}
							placeholderBase64={media.placeholder}
							width={320}
							height={160}
							className="h-full w-full object-cover"
							wrapperClassName="h-28 w-full rounded-md border bg-muted"
						/>
						<p className="text-muted-foreground mt-2 truncate text-xs">{media.name}</p>
					</div>
				);
			}

			return (
				<div className="bg-muted/40 mt-2 flex items-center gap-3 rounded-md border p-3">
					<FileText className="text-muted-foreground size-5 shrink-0" />
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{media.name}</p>
						<p className="text-muted-foreground text-xs">
							{media.url ? "Uploaded document" : "Selected file"}
						</p>
					</div>
				</div>
			);
		}

		return (
			<p className="mt-0.5 truncate text-sm font-semibold">
				{getPreviewValue(field)}
			</p>
		);
	};

	return (
		<div className="space-y-10">
			{feeSummary && (
				<div className="rounded-xl border bg-muted/20 p-4 text-sm">
					<h4 className="mb-3 font-semibold">Admission Fee Summary</h4>
					<div className="grid gap-2 md:grid-cols-3">
						<div>
							<span className="text-muted-foreground">Required total: </span>
							<span className="font-semibold">BDT {feeSummary.requiredTotal ?? 0}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Discount: </span>
							<span className="font-semibold">BDT {feeSummary.discountAmount ?? 0}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Payable: </span>
							<span className="font-semibold">
								BDT {feeSummary.payableAmount ?? feeSummary.requiredTotal ?? 0}
							</span>
						</div>
					</div>
					{Array.isArray(feeSummary.discountBreakdown) &&
						feeSummary.discountBreakdown.length > 0 && (
							<div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1">
								{feeSummary.discountBreakdown.map((rule: any, index: number) => {
									const label =
										rule.source === "manual"
											? "Manual discount"
											: rule.source === "quota"
												? "Quota discount"
												: "Default discount";
									return (
										<span key={`${rule.source}-${index}`}>
											{label}: BDT {Number(rule.amount || 0)}
										</span>
									);
								})}
							</div>
						)}
				</div>
			)}

			{categories.map((category) => {
				const categoryFields = fields.filter((field) => field.category === category);
				if (categoryFields.length === 0) return null;

				return (
					<div key={category} className="space-y-4">
						<div className="flex items-center justify-between border-b pb-2">
							<div className="flex items-center gap-2">
								<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
									{getCategoryIcon(category)}
								</div>
								<h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
									{tc(category)}
								</h4>
							</div>
							<Button
								variant="secondary"
								size="sm"
								type="button"
								onClick={() => onEditStep?.(category)}
							>
								<Pencil className="size-3" />
								Edit
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{categoryFields.map((field) => (
								<div
									key={field.id}
									className="group rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
								>
									<p className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
										{field.label}
									</p>
									<PreviewValue field={field} />
								</div>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
