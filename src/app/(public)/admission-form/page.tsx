"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { appConfig } from "@/shared/configs/app.config";
import { CheckCircle2, FileText, GraduationCap, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PortalField = {
	id?: string;
	fieldKey: string;
	label: string;
	fieldType: string;
	placeholder?: string | null;
	options?: any;
	isRequired?: boolean;
	section?: string;
};

function tenantHeader(tenant?: string | null): Record<string, string> {
	return tenant ? { "x-tenant-slug": tenant } : {};
}

function optionList(field: PortalField, config: any, values: Record<string, any>) {
	if (field.fieldKey === "applyingClassId") return config?.classes || [];
	if (field.fieldKey === "sectionId") {
		const selectedClass = (config?.classes || []).find(
			(item: any) => item.value === values.applyingClassId
		);
		return selectedClass?.sections || [];
	}
	if (field.fieldKey === "shift") return config?.shifts || [];
	if (field.fieldKey === "presentDivisionId" || field.fieldKey === "permanentDivisionId") {
		return config?.divisions || [];
	}
	if (field.fieldKey === "presentDistrictId") {
		return (config?.districts || []).filter(
			(item: any) => String(item.divisionId) === String(values.presentDivisionId || "")
		);
	}
	if (field.fieldKey === "permanentDistrictId") {
		return (config?.districts || []).filter(
			(item: any) => String(item.divisionId) === String(values.permanentDivisionId || "")
		);
	}
	if (field.fieldKey === "presentUpazilaId") {
		return (config?.upazilas || []).filter(
			(item: any) => String(item.districtId) === String(values.presentDistrictId || "")
		);
	}
	if (field.fieldKey === "permanentUpazilaId") {
		return (config?.upazilas || []).filter(
			(item: any) => String(item.districtId) === String(values.permanentDistrictId || "")
		);
	}
	if (Array.isArray(field.options)) return field.options;
	if (Array.isArray(field.options?.options)) return field.options.options;
	return [];
}

function getMediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
	return `${appConfig.API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function sectionTitle(section: string) {
	return section
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export default function PublicAdmissionFormPage() {
	const searchParams = useSearchParams();
	const slug = searchParams.get("slug") || searchParams.get("tenant") || "";
	const tenant = searchParams.get("tenant") || slug;
	const [config, setConfig] = useState<any>(null);
	const [fee, setFee] = useState<any>(null);
	const [values, setValues] = useState<Record<string, any>>({});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [uploadingField, setUploadingField] = useState<string | null>(null);

	const fields = useMemo<PortalField[]>(() => {
		return (config?.fields || [])
			.filter((field: PortalField) => field.fieldKey !== "notes")
			.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
	}, [config]);

	const groupedFields = useMemo(() => {
		const grouped = new Map<string, PortalField[]>();
		for (const field of fields) {
			const section = field.section || "other";
			grouped.set(section, [...(grouped.get(section) || []), field]);
		}
		return Array.from(grouped.entries());
	}, [fields]);

	useEffect(() => {
		if (!slug) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		async function loadConfig() {
			setLoading(true);
			try {
				const response = await fetch(
					`/api/proxy/public/admission/${encodeURIComponent(slug)}/config`,
					{
						headers: tenantHeader(tenant),
					}
				);
				const json = await response.json();
				if (!json.success) throw new Error(json.message || "Admission portal unavailable");
				if (!cancelled) setConfig(json.data);
			} catch (error: any) {
				toast.error(error?.message || "Failed to load admission portal.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		loadConfig();
		return () => {
			cancelled = true;
		};
	}, [slug, tenant]);

	useEffect(() => {
		if (!slug || !values.applyingClassId) return;
		let cancelled = false;
		async function loadFee() {
			const params = new URLSearchParams({ classId: values.applyingClassId });
			const response = await fetch(
				`/api/proxy/public/admission/${encodeURIComponent(slug)}/fee?${params.toString()}`,
				{ headers: tenantHeader(tenant) }
			);
			const json = await response.json();
			if (!cancelled && json.success) setFee(json.data);
		}
		loadFee();
		return () => {
			cancelled = true;
		};
	}, [slug, tenant, values.applyingClassId]);

	const setField = (key: string, value: any) => {
		setValues((current) => {
			const next = { ...current, [key]: value };
			if (key === "applyingClassId") {
				next.sectionId = "";
			}
			if (key === "presentDivisionId") {
				next.presentDistrictId = "";
				next.presentUpazilaId = "";
			}
			if (key === "presentDistrictId") {
				next.presentUpazilaId = "";
			}
			if (key === "permanentDivisionId") {
				next.permanentDistrictId = "";
				next.permanentUpazilaId = "";
			}
			if (key === "permanentDistrictId") {
				next.permanentUpazilaId = "";
			}
			if (key === "permanentSameAsPresent" && value) {
				next.permanentAddress = "";
				next.permanentDivisionId = "";
				next.permanentDistrictId = "";
				next.permanentUpazilaId = "";
			}
			return next;
		});
	};

	const handleFile = async (field: PortalField, file?: File | null) => {
		if (!file) {
			setField(field.fieldKey, null);
			return;
		}
		setUploadingField(field.fieldKey);
		try {
			const isImage = file.type.startsWith("image/");
			const formData = new FormData();
			formData.append("file", file);
			formData.append("module", "student_document");
			const response = await fetch(
				isImage ? "/api/proxy/uploads/image" : "/api/proxy/uploads/document",
				{
					method: "POST",
					headers: tenantHeader(tenant),
					body: formData,
				}
			);
			const json = await response.json();
			if (!json.success) throw new Error(json.message || "Upload failed");
			const uploaded = json.data;
			setField(field.fieldKey, {
				type: field.fieldKey,
				label: field.label,
				mediaId: uploaded.mediaId,
				url: uploaded.url,
				placeholder: uploaded.placeholder,
				originalName: file.name,
				mimeType: file.type,
				fileSize: file.size,
				uploadedAt: new Date().toISOString(),
			});
		} catch {
			toast.error(`Failed to upload ${field.label}.`);
		} finally {
			setUploadingField(null);
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!config?.sessionId) return;
		setSubmitting(true);
		try {
			const documents = fields
				.filter((field) => field.section === "documents" && field.fieldType === "file")
				.map((field) => values[field.fieldKey])
				.filter(Boolean);
			const payload: Record<string, any> = {
				...values,
				sessionId: config.sessionId,
				documents,
				status: "pending",
			};
			for (const key of [
				"presentDivisionId",
				"presentDistrictId",
				"presentUpazilaId",
				"permanentDivisionId",
				"permanentDistrictId",
				"permanentUpazilaId",
			]) {
				if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
					payload[key] = Number(payload[key]);
				} else {
					delete payload[key];
				}
			}
			for (const field of fields) {
				if (field.section === "documents" && field.fieldType === "file") {
					delete payload[field.fieldKey];
				}
			}
			const response = await fetch(
				`/api/proxy/public/admission/${encodeURIComponent(slug)}/applications`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...tenantHeader(tenant),
					},
					body: JSON.stringify(payload),
				}
			);
			const json = await response.json();
			if (!json.success) throw new Error(json.message || "Submission failed");
			setValues({});
			setFee(null);
			toast.success("Application submitted successfully.");
		} catch (error: any) {
			toast.error(error?.message || "Failed to submit application.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
				<Loader2 className="h-6 w-6 animate-spin" />
			</main>
		);
	}

	if (!slug || !config) {
		return (
			<main className="mx-auto max-w-5xl p-6">
				<Card>
					<CardHeader>
						<CardTitle>Admission Portal Unavailable</CardTitle>
						<CardDescription>
							Use `/admission-form?tenant=school-slug&slug=portal-slug`.
						</CardDescription>
					</CardHeader>
				</Card>
			</main>
		);
	}

	return (
		<main className="bg-slate-50/40 dark:bg-slate-950/40">
			{/* Premium Header Banner */}
			<div className="from-primary/90 to-primary text-primary-foreground relative overflow-hidden bg-gradient-to-r px-6 py-16">
				<div className="pointer-events-none absolute top-0 right-0 translate-x-1/3 -translate-y-12 opacity-20">
					<svg
						width="400"
						height="400"
						viewBox="0 0 200 200"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill="#ffffff"
							d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.7,-2.1C98.6,13.8,94.4,30.1,84.7,42.7C75,55.3,59.8,64.2,44.2,71.4C28.6,78.6,12.5,84.1,-3.2,88.4C-18.9,92.7,-34.2,85.8,-48.7,78.1C-63.2,70.4,-76.9,61.9,-84.9,49.2C-92.9,36.5,-95.2,19.6,-93.6,3.6C-92,-12.4,-86.5,-27.5,-77.7,-39.8C-68.9,-52.1,-56.8,-61.6,-43.5,-69.1C-30.2,-76.6,-15.1,-82.1,0.5,-83C16.1,-83.9,30.6,-83.6,44.7,-76.4Z"
							transform="translate(100 100)"
						/>
					</svg>
				</div>
				<div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
					<div className="bg-primary-foreground/10 ring-primary-foreground/20 mb-2 inline-flex items-center justify-center rounded-full p-4 ring-1 backdrop-blur-sm">
						<GraduationCap className="text-primary-foreground h-10 w-10" />
					</div>
					<h1 className="text-primary-foreground text-4xl font-extrabold tracking-tight md:text-5xl">
						Admission Application
					</h1>
					<p className="text-primary-foreground/90 mx-auto max-w-2xl text-lg font-medium md:text-xl">
						Welcome to our online portal. Please complete the form below to submit your
						application for review.
					</p>
				</div>
			</div>

			<div className="relative z-20 mx-auto -mt-10 max-w-4xl p-4 pb-24 md:p-6">
				<form onSubmit={handleSubmit} className="space-y-8">
					{groupedFields.map(([section, sectionFields], idx) => (
						<Card
							key={section}
							className="border-border/40 bg-card/95 supports-[backdrop-filter]:bg-card/75 overflow-hidden shadow-lg backdrop-blur"
						>
							<CardHeader className="bg-muted/30 border-border/40 border-b pb-4">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
										{idx + 1}
									</div>
									{sectionTitle(section)}
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<div className="grid gap-6 md:grid-cols-2">
									{sectionFields.map((field) => {
										const options = optionList(field, config, values);
										const value = values[field.fieldKey] ?? "";
										const permanentDisabled =
											Boolean(values.permanentSameAsPresent) &&
											[
												"permanentAddress",
												"permanentDivisionId",
												"permanentDistrictId",
												"permanentUpazilaId",
											].includes(field.fieldKey);
										const selectDisabled =
											permanentDisabled ||
											(field.fieldKey === "sectionId" && !values.applyingClassId) ||
											(field.fieldKey === "presentDistrictId" && !values.presentDivisionId) ||
											(field.fieldKey === "presentUpazilaId" && !values.presentDistrictId) ||
											(field.fieldKey === "permanentDistrictId" && !values.permanentDivisionId) ||
											(field.fieldKey === "permanentUpazilaId" && !values.permanentDistrictId);
										return (
											<div
												key={field.fieldKey}
												className={
													field.fieldType === "textarea"
														? "md:col-span-2"
														: ""
												}
											>
												<Label className="mb-2 block text-sm">
													{field.label}
													{field.isRequired && (
														<span className="text-destructive">*</span>
													)}
												</Label>
												{field.fieldType === "textarea" ? (
													<Textarea
														value={value}
														onChange={(event) =>
															setField(
																field.fieldKey,
																event.target.value
															)
														}
														placeholder={
															field.placeholder ||
															`Enter ${field.label}`
														}
														required={field.isRequired}
														disabled={permanentDisabled}
														className="min-h-28"
													/>
												) : field.fieldType === "select" ||
												  field.fieldType === "dynamic_select" ? (
													<Select
														value={value || undefined}
														onValueChange={(next) =>
															setField(field.fieldKey, next)
														}
														disabled={selectDisabled}
													>
														<SelectTrigger>
															<SelectValue
																placeholder={
																	field.placeholder ||
																	`Select ${field.label}`
																}
															/>
														</SelectTrigger>
														<SelectContent>
															{options.map((option: any) => (
																<SelectItem
																	key={option.value}
																	value={option.value}
																	className="cursor-pointer"
																>
																	{option.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												) : field.fieldType === "file" ? (
													<div className="rounded-lg border p-3">
														<Input
															type="file"
															required={
																field.isRequired &&
																!values[field.fieldKey]
															}
															accept="image/*,.pdf,.csv,.xls,.xlsx,.doc,.docx"
															onChange={(event) =>
																handleFile(
																	field,
																	event.target.files?.[0]
																)
															}
														/>
														{values[
															field.fieldKey
														]?.mimeType?.startsWith("image/") &&
														values[field.fieldKey]?.url ? (
															<div className="mt-3 flex items-center gap-3 rounded-md border p-2">
																{/* eslint-disable-next-line @next/next/no-img-element */}
																<img
																	src={getMediaUrl(
																		values[field.fieldKey].url
																	)}
																	alt={
																		values[field.fieldKey]
																			.originalName ||
																		field.label
																	}
																	className="h-14 w-20 rounded object-cover"
																/>
																<div className="min-w-0 text-xs">
																	<div className="truncate font-medium">
																		{
																			values[field.fieldKey]
																				.originalName
																		}
																	</div>
																	<div className="text-muted-foreground">
																		{
																			values[field.fieldKey]
																				.mimeType
																		}
																	</div>
																</div>
															</div>
														) : (
															<div className="text-muted-foreground mt-2 truncate text-xs">
																{uploadingField === field.fieldKey
																	? "Uploading..."
																	: values[field.fieldKey]
																			?.originalName ||
																		"No document uploaded"}
															</div>
														)}
													</div>
												) : field.fieldType === "checkbox" ? (
													<Input
														type="checkbox"
														checked={!!value}
														onChange={(event) =>
															setField(
																field.fieldKey,
																event.target.checked
															)
														}
														className="h-5 w-5"
													/>
												) : (
													<Input
														type={
															field.fieldType === "date"
																? "date"
																: field.fieldType === "number"
																	? "number"
																	: "text"
														}
														value={value}
														onChange={(event) =>
															setField(
																field.fieldKey,
																event.target.value
															)
														}
														placeholder={
															field.placeholder ||
															`Enter ${field.label}`
														}
														required={field.isRequired}
														disabled={permanentDisabled}
													/>
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					))}

					{config.referenceEnabled && (
						<Card className="border-border/40 bg-card/95 overflow-hidden shadow-lg backdrop-blur">
							<CardHeader className="bg-muted/30 border-border/40 border-b pb-4">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
										<FileText className="h-4 w-4" />
									</div>
									Reference Information
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-6 p-6 md:grid-cols-2">
								<div>
									<Label className="mb-2 block text-sm">Reference Name</Label>
									<Input
										value={values.referenceName || ""}
										onChange={(event) =>
											setField("referenceName", event.target.value)
										}
										placeholder="Enter reference name"
									/>
								</div>
								<div>
									<Label className="mb-2 block text-sm">Reference Mobile</Label>
									<Input
										value={values.referenceMobile || ""}
										onChange={(event) =>
											setField("referenceMobile", event.target.value)
										}
										placeholder="e.g. 01712345678"
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{fee && (
						<Card className="border-border/40 bg-card/95 overflow-hidden shadow-lg backdrop-blur">
							<CardContent className="p-6">
								<div className="bg-muted/40 space-y-2 rounded-lg border p-4">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Required total
										</span>
										<span>BDT {fee.requiredTotal}</span>
									</div>
									{fee.discountAmount > 0 && (
										<div className="flex justify-between text-sm text-green-600 dark:text-green-400">
											<span>Discount</span>
											<span>- BDT {fee.discountAmount}</span>
										</div>
									)}
									<div className="flex justify-between border-t pt-2 text-lg font-bold">
										<span>Payable Amount</span>
										<span>BDT {fee.payableAmount ?? fee.requiredTotal}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					<div className="sticky bottom-6 z-30">
						<div className="from-background via-background absolute -inset-4 -z-10 bg-gradient-to-t to-transparent blur-lg" />
						<Card className="border-primary/20 bg-background/95 shadow-2xl backdrop-blur">
							<CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
								<div className="text-muted-foreground hidden text-sm sm:block">
									Please review all information before submitting.
								</div>
								<Button
									type="submit"
									size="lg"
									disabled={submitting || !!uploadingField}
									className="w-full min-w-[200px] gap-2 text-base sm:w-auto"
								>
									{submitting ? (
										<Loader2 className="h-5 w-5 animate-spin" />
									) : (
										<CheckCircle2 className="h-5 w-5" />
									)}
									{submitting ? "Submitting..." : "Submit Application"}
								</Button>
							</CardContent>
						</Card>
					</div>
				</form>
			</div>
		</main>
	);
}
