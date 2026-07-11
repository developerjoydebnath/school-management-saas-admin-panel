"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { appConfig } from "@/shared/configs/app.config";
import { Loader2 } from "lucide-react";
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

function optionList(field: PortalField, config: any) {
	if (field.fieldKey === "applyingClassId") return config?.classes || [];
	if (Array.isArray(field.options)) return field.options;
	if (Array.isArray(field.options?.options)) return field.options.options;
	return [];
}

function getMediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
	return `${appConfig.API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

	useEffect(() => {
		if (!slug) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		async function loadConfig() {
			setLoading(true);
			try {
				const response = await fetch(`/api/proxy/public/admission/${encodeURIComponent(slug)}/config`, {
					headers: tenantHeader(tenant),
				});
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
		setValues((current) => ({ ...current, [key]: value }));
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
			for (const field of fields) {
				if (field.section === "documents" && field.fieldType === "file") {
					delete payload[field.fieldKey];
				}
			}
			const response = await fetch(`/api/proxy/public/admission/${encodeURIComponent(slug)}/applications`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...tenantHeader(tenant),
				},
				body: JSON.stringify(payload),
			});
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
						<CardDescription>Use `/admission-form?tenant=school-slug&slug=portal-slug`.</CardDescription>
					</CardHeader>
				</Card>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-5xl p-4 py-8">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Admission Application</CardTitle>
					<CardDescription>Complete the form and submit your application for review.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="grid gap-5 md:grid-cols-2">
							{fields.map((field) => {
								const options = optionList(field, config);
								const value = values[field.fieldKey] ?? "";
								return (
									<div key={field.fieldKey} className={field.fieldType === "textarea" ? "md:col-span-2" : ""}>
										<Label className="mb-2 block text-sm">
											{field.label}
											{field.isRequired && <span className="text-destructive">*</span>}
										</Label>
										{field.fieldType === "textarea" ? (
											<Textarea
												value={value}
												onChange={(event) => setField(field.fieldKey, event.target.value)}
												placeholder={field.placeholder || `Enter ${field.label}`}
												required={field.isRequired}
												className="min-h-28"
											/>
										) : field.fieldType === "select" || field.fieldType === "dynamic_select" ? (
											<Select value={value || undefined} onValueChange={(next) => setField(field.fieldKey, next)}>
												<SelectTrigger>
													<SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
												</SelectTrigger>
												<SelectContent>
													{options.map((option: any) => (
														<SelectItem key={option.value} value={option.value} className="cursor-pointer">
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : field.fieldType === "file" ? (
											<div className="rounded-lg border p-3">
												<Input
													type="file"
													required={field.isRequired && !values[field.fieldKey]}
													accept="image/*,.pdf,.csv,.xls,.xlsx,.doc,.docx"
													onChange={(event) => handleFile(field, event.target.files?.[0])}
												/>
												{values[field.fieldKey]?.mimeType?.startsWith("image/") &&
												values[field.fieldKey]?.url ? (
													<div className="mt-3 flex items-center gap-3 rounded-md border p-2">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={getMediaUrl(values[field.fieldKey].url)}
															alt={values[field.fieldKey].originalName || field.label}
															className="h-14 w-20 rounded object-cover"
														/>
														<div className="min-w-0 text-xs">
															<div className="truncate font-medium">
																{values[field.fieldKey].originalName}
															</div>
															<div className="text-muted-foreground">
																{values[field.fieldKey].mimeType}
															</div>
														</div>
													</div>
												) : (
													<div className="text-muted-foreground mt-2 truncate text-xs">
														{uploadingField === field.fieldKey
															? "Uploading..."
															: values[field.fieldKey]?.originalName || "No document uploaded"}
													</div>
												)}
											</div>
										) : field.fieldType === "checkbox" ? (
											<Input
												type="checkbox"
												checked={!!value}
												onChange={(event) => setField(field.fieldKey, event.target.checked)}
												className="h-5 w-5"
											/>
										) : (
											<Input
												type={field.fieldType === "date" ? "date" : field.fieldType === "number" ? "number" : "text"}
												value={value}
												onChange={(event) => setField(field.fieldKey, event.target.value)}
												placeholder={field.placeholder || `Enter ${field.label}`}
												required={field.isRequired}
											/>
										)}
									</div>
								);
							})}
						</div>

						{config.referenceEnabled && (
							<div className="grid gap-5 rounded-lg border p-4 md:grid-cols-2">
								<div>
									<Label className="mb-2 block text-sm">Reference Name</Label>
									<Input
										value={values.referenceName || ""}
										onChange={(event) => setField("referenceName", event.target.value)}
										placeholder="Enter reference name"
									/>
								</div>
								<div>
									<Label className="mb-2 block text-sm">Reference Mobile</Label>
									<Input
										value={values.referenceMobile || ""}
										onChange={(event) => setField("referenceMobile", event.target.value)}
										placeholder="e.g. 01712345678"
									/>
								</div>
							</div>
						)}

						{fee && (
							<div className="rounded-lg border p-4 text-sm">
								<div>Required total: BDT {fee.requiredTotal}</div>
								<div>Discount: BDT {fee.discountAmount || 0}</div>
								<div className="font-semibold">Payable: BDT {fee.payableAmount ?? fee.requiredTotal}</div>
							</div>
						)}

						<div className="bg-background sticky bottom-4 rounded-lg border p-4">
							<Button type="submit" disabled={submitting || !!uploadingField} className="w-full">
								{submitting ? "Submitting..." : "Submit Application"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
