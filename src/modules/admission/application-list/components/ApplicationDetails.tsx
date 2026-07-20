"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { appConfig } from "@/shared/configs/app.config";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, CheckCircle2, FileText, Loader2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import StudentRollList from "./StudentRollList";

const sectionLabels: Record<string, string> = {
	student_info: "Student Information",
	academic_info: "Academic Information",
	parent_info: "Parent Information",
	guardian_info: "Guardian Information",
	address: "Address",
	health_info: "Health Information",
	payment: "Payment",
	documents: "Documents",
	additional_info: "Additional Information",
};

const statuses = [
	{ value: "pending", label: "Pending" },
	{ value: "under_review", label: "Under Review" },
	{ value: "eligible_for_payment", label: "Eligible For Payment" },
	{ value: "approved", label: "Approved" },
	{ value: "waitlisted", label: "Waitlisted" },
	{ value: "rejected", label: "Rejected" },
];

function ProgressBar({ completion }: { completion?: any }) {
	const percent = Number(completion?.completionPercent || 0);
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-3">
				<span className="text-muted-foreground text-sm">
					{completion?.completedFields || 0} of {completion?.totalFields || 0} fields completed
				</span>
				<span className="text-sm font-medium">{percent}%</span>
			</div>
			<div className="bg-muted h-2 overflow-hidden rounded-full">
				<div
					className={cn(
						"h-full rounded-full",
						percent >= 80 ? "bg-green-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500"
					)}
					style={{ width: `${Math.min(percent, 100)}%` }}
				/>
			</div>
		</div>
	);
}

function StatusPill({ status }: { status: string }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full px-3 py-0.5 capitalize",
				status === "approved" && "border-green-500/30 bg-green-500/10 text-green-600",
				status === "rejected" && "border-red-500/30 bg-red-500/10 text-red-600",
				status === "pending" && "border-orange-500/30 bg-orange-500/10 text-orange-600",
				status === "eligible_for_payment" &&
					"border-blue-500/30 bg-blue-500/10 text-blue-600",
				status === "waitlisted" && "border-blue-500/30 bg-blue-500/10 text-blue-600"
			)}
		>
			{status.replace("_", " ")}
		</Badge>
	);
}

function mediaMetaFromField(field: any): any {
	const value = field?.value;
	if (!value) return null;

	if (Array.isArray(value)) {
		const matched = value.find(
			(item) =>
				item?.fieldKey === field?.fieldKey ||
				item?.type === field?.fieldKey ||
				item?.documentType === field?.fieldKey
		);
		return matched ? mediaMetaFromField({ ...field, value: matched }) : null;
	}

	if (typeof value === "string") {
		const isUrl = value.startsWith("/") || value.startsWith("http");
		return isUrl
			? { url: absoluteMediaUrl(value), name: field.displayValue || "Uploaded file" }
			: null;
	}

	if (typeof value !== "object") return null;

	const urlCandidate =
		value.url ||
		value.fileUrl ||
		value.documentUrl ||
		value.photoUrl ||
		value.path ||
		value.src;
	const url =
		typeof urlCandidate === "string"
			? urlCandidate
			: typeof urlCandidate === "object"
				? urlCandidate?.url || urlCandidate?.path || urlCandidate?.src
				: "";
	if (!url) return null;

	return {
		url: absoluteMediaUrl(url),
		placeholder: value.placeholder || value.placeholderUrl || value.photoPlaceholder,
		name: value.originalName || value.name || value.fileName || field.displayValue || "Uploaded file",
		type: value.mimeType || value.type || value.contentType,
		size: value.fileSize || value.size,
	};
}

function absoluteMediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
	return `${appConfig.API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isImageMedia(media: any) {
	const marker = `${media?.type || ""} ${media?.url || ""}`.toLowerCase();
	return (
		marker.includes("image/") ||
		/\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(String(media?.url || ""))
	);
}

function formatFileSize(size?: number | string | null) {
	const numericSize = Number(size || 0);
	if (!numericSize || Number.isNaN(numericSize)) return "";
	if (numericSize < 1024) return `${numericSize} B`;
	if (numericSize < 1024 * 1024) return `${(numericSize / 1024).toFixed(1)} KB`;
	return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileType(media: any) {
	const type = String(media?.type || "").toLowerCase();
	if (type.includes("pdf") || /\.pdf(\?|$)/i.test(String(media?.url || ""))) return "PDF";
	if (type.includes("word") || /\.(docx?|doc)(\?|$)/i.test(String(media?.url || ""))) {
		return "Word";
	}
	if (type.includes("spreadsheet") || /\.(xlsx?|csv)(\?|$)/i.test(String(media?.url || ""))) {
		return "Spreadsheet";
	}
	if (type.includes("image") || isImageMedia(media)) return "Image";
	return type ? type.split("/").pop()?.toUpperCase() || "File" : "File";
}

function fileMetaText(media: any) {
	return [formatFileType(media), formatFileSize(media?.size)].filter(Boolean).join(" • ");
}

function isStudentPhotoField(field: any) {
	const key = String(field?.fieldKey || "").toLowerCase();
	const label = String(field?.label || "").toLowerCase();
	return (
		key === "photo" ||
		key === "photourl" ||
		key === "studentphoto" ||
		key.includes("student_photo") ||
		label.includes("student photo")
	);
}

function formatDateValue(value: any) {
	if (!value) return "-";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toISOString().slice(0, 10);
}

function shouldFormatAsDate(field: any) {
	const key = String(field?.fieldKey || "").toLowerCase();
	const type = String(field?.fieldType || "").toLowerCase();
	return type === "date" || key.includes("date") || key.endsWith("at");
}

function FieldDisplay({
	field,
	onOpenMedia,
}: {
	field: any;
	onOpenMedia: (media: any) => void;
}) {
	const media = mediaMetaFromField(field);
	if (media) {
		if (isImageMedia(media)) {
			return (
				<button
					type="button"
					className="mt-2 block w-full text-left"
					onClick={() => onOpenMedia(media)}
				>
					<ProgressiveImage
						src={media.url}
						alt={media.name}
						placeholderBase64={media.placeholder}
						width={360}
						height={180}
						className="h-full w-32! object-cover"
						wrapperClassName="h-32 w-full rounded-md border bg-muted"
					/>
					<p className="text-muted-foreground mt-2 truncate text-xs">{media.name}</p>
				</button>
			);
		}

		return (
			<button
				type="button"
				onClick={() => onOpenMedia(media)}
				className="bg-muted/40 hover:bg-muted mt-2 flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors"
			>
				<FileText className="text-muted-foreground size-5 shrink-0" />
				<span className="min-w-0">
					<span className="block truncate text-sm font-medium">{media.name}</span>
					<span className="text-muted-foreground text-xs">{fileMetaText(media)}</span>
				</span>
			</button>
		);
	}

	return (
		<p className="mt-1 break-words text-sm font-medium">
			{shouldFormatAsDate(field) && field.value
				? formatDateValue(field.value)
				: field.displayValue || "-"}
		</p>
	);
}

export default function ApplicationDetails({ id }: { id: string }) {
	const { data: appResponse, isLoading, mutate } = useSWR(`/admissions/${id}`);
	const app = appResponse?.data;
	const [statusUpdate, setStatusUpdate] = useState<string | null>(null);
	const [roll, setRoll] = useState("");
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [previewMedia, setPreviewMedia] = useState<any | null>(null);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!app) {
		return (
			<div className="text-muted-foreground flex items-center justify-center p-8 text-center">
				Application not found.
			</div>
		);
	}

	const currentStatus = String(app.status || "pending").toLowerCase();
	const completion = app.completion || {};
	const percent = Number(completion.completionPercent || 0);

	const handleStatusUpdate = async () => {
		if (!statusUpdate) return;
		if (statusUpdate === "approved" && !roll) {
			toast.error("Roll number is required for approval");
			return;
		}

		setIsUpdatingStatus(true);
		try {
			let response: any;
			if (statusUpdate === "approved") {
				response = await axios.post(`/admissions/${id}/approve`, {
					rollNumber: roll.padStart(3, "0"),
				});
			} else if (statusUpdate === "rejected") {
				response = await axios.post(`/admissions/${id}/reject`, {
					rejectionReason: "Rejected from application details",
				});
			} else if (statusUpdate === "waitlisted") {
				response = await axios.post(`/admissions/${id}/waitlist`, {});
			} else if (statusUpdate === "eligible_for_payment") {
				response = await axios.post(`/admissions/${id}/eligible-for-payment`, {});
			} else {
				response = await axios.patch(`/admissions/${id}`, { status: statusUpdate });
			}
			toast.success(response?.data?.message || "Application status updated");
			if (response?.data?.data?.mailSkipped) {
				toast.warning(response.data.data.mailMessage || "Mail was not sent");
			} else if (response?.data?.data?.emailQueued) {
				toast.success("Payment email queued");
			}
			await mutate();
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to update status");
		} finally {
			setIsUpdatingStatus(false);
			setStatusUpdate(null);
			setRoll("");
		}
	};

	return (
		<div className="grid grid-cols-1 gap-6 @5xl/main:grid-cols-12">
			<div className="@5xl/main:col-span-4">
				<div className="space-y-4 @5xl/main:sticky @5xl/main:top-20">
					<Card className="shadow-none p-0">
						<CardContent className="space-y-5 p-6">
							<div className="flex flex-col items-center gap-4 text-center">
								{app.photoUrl ? (
									<ProgressiveImage
										src={absoluteMediaUrl(app.photoUrl)}
										alt={app.fullName || app.studentName || "Student photo"}
										placeholderBase64={app.photoPlaceholder}
										width={240}
										height={240}
										className="h-full w-full object-cover"
										wrapperClassName="size-40 shrink-0 rounded-2xl border bg-muted sm:size-44"
									/>
								) : (
									<div className="bg-muted flex size-40 shrink-0 items-center justify-center rounded-2xl sm:size-44">
										<UserRound className="text-muted-foreground size-16" />
									</div>
								)}
								<div className="min-w-0 space-y-2">
									<div className="flex items-center justify-center gap-3">
										<h2 className="truncate text-xl font-semibold">
											{app.fullName || app.studentName || "-"}
										</h2>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<StatusPill status={currentStatus} />
										<Badge variant="outline">{app.applicationNo || app.id}</Badge>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
								<div>
									<p className="text-muted-foreground text-xs">Class</p>
									<p className="font-medium">{app.class || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Section</p>
									<p className="font-medium">{app.section || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Source</p>
									<p className="font-medium capitalize">{String(app.source || "-").replace("_", " ")}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Payment</p>
									<p className="font-medium capitalize">{app.paymentStatus || "-"}</p>
								</div>
							</div>

							<div className="space-y-2 border-t pt-4">
								<p className="text-sm font-medium">Status</p>
								<Select
									value={currentStatus}
									onValueChange={(value) => {
										if (value !== currentStatus) setStatusUpdate(value);
									}}
									disabled={currentStatus === "approved"}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="p-1">
										{statuses.map((status) => (
											<SelectItem
												key={status.value}
												value={status.value}
												className="cursor-pointer py-2"
											>
												{status.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-none">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Profile Completion</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<ProgressBar completion={completion} />
							{percent < 100 && (
								<div className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex gap-2 rounded-md border p-3 text-sm">
									<AlertTriangle className="mt-0.5 size-4 shrink-0" />
									<span>
										This application is {percent}% complete. Complete the missing profile information as soon as possible.
									</span>
								</div>
							)}
							{percent >= 100 && (
								<div className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300 flex gap-2 rounded-md border p-3 text-sm">
									<CheckCircle2 className="mt-0.5 size-4 shrink-0" />
									<span>All configured admission information has been completed.</span>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="space-y-4 @5xl/main:col-span-8">
				{(app.visibleFieldGroups || []).map((group: any) => (
					<Card key={group.section} className="shadow-none p-0 gap-0">
						<CardHeader className="border-b py-6">
							<CardTitle className="text-base">
								{sectionLabels[group.section] || group.section}
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
							{(group.fields || [])
								.filter((field: any) => !isStudentPhotoField(field))
								.map((field: any) => (
									<div
										key={`${group.section}-${field.fieldKey}`}
										className={cn(
											"rounded-md border p-3",
											String(field.fieldType || "").toLowerCase() === "textarea" &&
											"sm:col-span-2"
										)}
									>
										<p className="text-muted-foreground text-xs">{field.label}</p>
										<FieldDisplay field={field} onOpenMedia={setPreviewMedia} />
									</div>
								))}
						</CardContent>
					</Card>
				))}
			</div>

			<Sheet open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
				<SheetContent side="bottom" className="left-0 right-0 gap-0 top-0 h-[calc(100vh-0px)]">
					<SheetHeader className="border-b p-4">
						<SheetTitle className="text-base">{previewMedia?.name || "Document"}</SheetTitle>
						<SheetDescription>Review uploaded admission document.</SheetDescription>
					</SheetHeader>
					<div className="min-h-0 flex-1 overflow-auto p-4">
						{previewMedia?.url && isImageMedia(previewMedia) ? (
							<div className="mx-auto max-w-5xl">
								<ProgressiveImage
									src={previewMedia.url}
									alt={previewMedia.name || "Document preview"}
									placeholderBase64={previewMedia.placeholder}
									width={1200}
									height={800}
									className="h-auto w-full object-contain"
									wrapperClassName="w-full rounded-md border bg-muted"
								/>
							</div>
						) : previewMedia?.url &&
							/\.pdf(\?|$)/i.test(String(previewMedia.url)) ? (
							<iframe
								src={previewMedia.url}
								title={previewMedia.name || "Document preview"}
								className="h-full min-h-[600px] w-full rounded-md border"
							/>
						) : previewMedia?.url ? (
							<div className="flex h-full min-h-[300px] items-center justify-center rounded-md border">
								<Button asChild>
									<a href={previewMedia.url} target="_blank" rel="noreferrer">
										Open document
									</a>
								</Button>
							</div>
						) : null}
					</div>
				</SheetContent>
			</Sheet>

			<ConfirmationModal
				open={!!statusUpdate}
				onOpenChange={(open) => {
					if (!open) {
						setStatusUpdate(null);
						setRoll("");
					}
				}}
				onConfirm={handleStatusUpdate}
				title="Change application status?"
				description={`This will update the application status to ${statusUpdate?.replace("_", " ") || ""}.`}
				body={
					statusUpdate === "approved" ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="text-muted-foreground text-xs font-medium">
									Student Roll Number
								</label>
								<div className="flex items-center gap-2">
									<Input
										placeholder="e.g. 001"
										value={roll}
										onChange={(event) => setRoll(event.target.value.replace(/\D/g, ""))}
										maxLength={3}
									/>
								</div>
							</div>
							<StudentRollList
								classId={app.classId}
								sessionId={app.sessionId}
								section={app.sectionId}
								onSuggestedRoll={(suggestedRoll) =>
									setRoll((current) => current || suggestedRoll)
								}
							/>
						</div>
					) : null
				}
				isLoading={isUpdatingStatus}
			/>
		</div>
	);
}
