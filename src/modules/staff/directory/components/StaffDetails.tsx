"use client";

import { SchoolDetailsLocationMap } from "@/modules/schools-management/schools/components/SchoolDetailsLocationMap";
import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { appConfig } from "@/shared/configs/app.config";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Edit, Eye, FileText, Trash2, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteStaffDocument } from "../hooks/use-staff-mutations";

type Props = {
	staff: any;
};

type InfoItem = {
	label: string;
	value?: React.ReactNode;
};

const emptyValue = "N/A";

function getMediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
	return `${appConfig.API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatDate(date?: string | null) {
	if (!date) return emptyValue;
	return new Intl.DateTimeFormat("en", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(new Date(date));
}

function formatValue(value: unknown) {
	if (value === null || value === undefined || value === "") return emptyValue;
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "number") return value.toString();
	if (typeof value === "string") return value.replace(/_/g, " ");
	return JSON.stringify(value, null, 2);
}

function InfoSection({ title, items }: { title: string; items: InfoItem[] }) {
	return (
		<Card className="bg-card/60 shadow-none">
			<CardHeader className="">
				<CardTitle className="text-base font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-x-6 gap-y-6 @2xl/page:grid-cols-2 @5xl/page:grid-cols-3">
				{items.map((item) => (
					<div key={item.label} className="min-w-0 space-y-1">
						<div className="text-muted-foreground text-xs">{item.label}</div>
						<div className="wrap-break-word text-sm font-normal">{item.value ?? emptyValue}</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function QualificationList({ items }: { items: any[] }) {
	if (!Array.isArray(items) || items.length === 0) {
		return (
			<div className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
				No data available.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-md border">
			{items.map((item, index) => (
				<div
					key={index}
					className="grid grid-cols-1 gap-x-4 gap-y-2 border-b p-3 text-sm last:border-b-0 @2xl/page:grid-cols-5"
				>
					<div><span className="text-muted-foreground text-xs">Degree</span><div>{item.degree || emptyValue}</div></div>
					<div><span className="text-muted-foreground text-xs">Institution</span><div>{item.institution || emptyValue}</div></div>
					<div><span className="text-muted-foreground text-xs">Board</span><div>{item.board || emptyValue}</div></div>
					<div><span className="text-muted-foreground text-xs">Result</span><div>{item.result || emptyValue}</div></div>
					<div><span className="text-muted-foreground text-xs">Year</span><div>{item.year || emptyValue}</div></div>
				</div>
			))}
		</div>
	);
}

export function StaffDetails({ staff }: Props) {
	const t = useTranslations("StaffDirectory");
	const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
	const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
	const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

	const photoUrl = getMediaUrl(staff.photoUrl);
	const documents = Array.isArray(staff.documents) ? staff.documents : [];

	const viewDocument = (url: string, name: string) => {
		setSelectedDocumentUrl(getMediaUrl(url));
		setSelectedDocumentName(name);
	};

	const deleteDocument = async (documentId: string) => {
		setDeletingDocumentId(documentId);
		try {
			await deleteStaffDocument(staff.id, documentId);
			toast.success("Document deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeletingDocumentId(null);
		}
	};

	return (
		<div className="@container/page space-y-6">
			<Card className="shadow-none">
				<CardContent className="flex flex-col gap-4 @2xl/page:flex-row @2xl/page:items-center @2xl/page:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<div className="bg-muted relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border">
							{photoUrl ? (
								<ProgressiveImage
									src={photoUrl}
									placeholderBase64={staff.photoPlaceholder || undefined}
									alt={staff.fullName}
									fill
									className="object-cover"
								/>
							) : (
								<UserCircle className="text-muted-foreground size-10" />
							)}
						</div>
						<div className="min-w-0 space-y-1">
							<h2 className="truncate text-lg font-medium">{staff.fullName}</h2>
							<div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
								<span>{staff.employeeCode}</span>
								<span className="bg-muted-foreground/70 size-1.5 rounded-full" aria-hidden="true" />
								<span>{staff.designation?.name || "Staff"}</span>
							</div>
							<div className="flex flex-wrap gap-2 pt-1">
								<Badge variant={staff.status === "active" ? "default" : "secondary"} className="capitalize">
									{formatValue(staff.status)}
								</Badge>
								<Badge variant="outline" className="capitalize">
									{formatValue(staff.employmentType)}
								</Badge>
							</div>
						</div>
					</div>
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.DIRECTORY.EDIT,
							PERMISSIONS.STAFF.DIRECTORY.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<Button asChild variant="outline" className="w-full @2xl/page:w-auto">
							<Link href={PATHS.STAFF.DIRECTORY.EDIT(staff.id)}>
								<Edit className="size-4" />
								Edit Profile
							</Link>
						</Button>
					</PermissionGuard>
				</CardContent>
			</Card>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="h-auto! flex min-h-0 w-full flex-wrap justify-center gap-1 rounded-md p-1 @3xl/page:w-fit @3xl/page:justify-start">
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="overview">Overview</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="contact">Contact</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="employment">Employment</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="mpo">MPO</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="bank">Bank</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="documents">Documents</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-0 space-y-6">
					<InfoSection
						title={t("personalInformation")}
						items={[
							{ label: "Full Name", value: staff.fullName },
							{ label: "Full Name (Bengali)", value: staff.fullNameBn },
							{ label: "Father's Name", value: staff.fatherName },
							{ label: "Mother's Name", value: staff.motherName },
							{ label: "Date of Birth", value: formatDate(staff.dateOfBirth) },
							{ label: "Gender", value: formatValue(staff.gender) },
							{ label: "Blood Group", value: staff.bloodGroup },
							{ label: "Religion", value: staff.religion },
							{ label: "Nationality", value: staff.nationality },
							{ label: "Marital Status", value: formatValue(staff.maritalStatus) },
						]}
					/>
					<InfoSection
						title={t("identityDocuments")}
						items={[
							{ label: "Employee Code", value: staff.employeeCode },
							{ label: "NID Number", value: staff.nid },
							{ label: "Birth Certificate No", value: staff.birthCertificateNo },
							{ label: "Passport No", value: staff.passportNo },
						]}
					/>
				</TabsContent>

				<TabsContent value="contact" className="mt-0 space-y-4">
					<InfoSection
						title={t("contactInformation")}
						items={[
							{ label: "Phone Number", value: staff.phone },
							{ label: "Alternate Phone", value: staff.alternatePhone },
							{ label: "Email Address", value: staff.email },
						]}
					/>
					<InfoSection
						title={t("location")}
						items={[
							{ label: "Division", value: staff.division?.enName || staff.division?.bnName },
							{ label: "District", value: staff.district?.enName || staff.district?.bnName },
							{ label: "Upazila", value: staff.upazila?.enName || staff.upazila?.bnName },
							{ label: "Post Code", value: staff.postCode },
							{ label: "Latitude", value: formatValue(staff.latitude) },
							{ label: "Longitude", value: formatValue(staff.longitude) },
							{ label: "Present Address", value: staff.address },
							{ label: "Permanent Address", value: staff.permanentAddress },
						]}
					/>
					<Card className="bg-card/60 shadow-none">
						<CardHeader>
							<CardTitle className="text-base font-medium">{t("locationMap")}</CardTitle>
						</CardHeader>
						<CardContent>
							<SchoolDetailsLocationMap
								latitude={staff.latitude ? Number(staff.latitude) : null}
								longitude={staff.longitude ? Number(staff.longitude) : null}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="employment" className="mt-0 space-y-4">
					<InfoSection
						title={t("employment")}
						items={[
							{ label: "Designation", value: staff.designation?.name },
							{ label: "Employment Type", value: formatValue(staff.employmentType) },
							{ label: "Employment Status", value: formatValue(staff.status) },
							{ label: "Joining Date", value: formatDate(staff.joiningDate) },
							{ label: "Confirmation Date", value: formatDate(staff.confirmationDate) },
							{ label: "Resignation Date", value: formatDate(staff.resignationDate) },
							{ label: "Retirement Date", value: formatDate(staff.retirementDate) },
							{ label: "Exit Reason", value: staff.exitReason },
						]}
					/>
					<InfoSection
						title={t("careerTracking")}
						items={[
							{ label: "Highest Qualification", value: staff.highestQualification },
							{ label: "Previous Institution", value: staff.previousInstitution },
							{ label: "Years of Experience", value: formatValue(staff.yearsOfExperience) },
							{ label: "Transferred From", value: staff.transferredFrom },
							{ label: "Transferred To", value: staff.transferredTo },
							{ label: "Transfer Date", value: formatDate(staff.transferDate) },
						]}
					/>
					<Card className="bg-card/60 shadow-none">
						<CardHeader>
							<CardTitle className="font-medium">{t("qualificationDetails")}</CardTitle>
						</CardHeader>
						<CardContent>
							<QualificationList items={staff.qualificationDetails || []} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="mpo" className="mt-0 space-y-4">
					<InfoSection
						title={t("mpoInformation")}
						items={[
							{ label: "MPO Listed", value: formatValue(staff.isMpoListed) },
							{ label: "MPO Index No", value: staff.mpoIndexNo },
							{ label: "MPO Included Date", value: formatDate(staff.mpoIncludedAt) },
							{ label: "MPO Category", value: staff.mpoCategory },
						]}
					/>
				</TabsContent>

				<TabsContent value="bank" className="mt-0 space-y-4">
					<InfoSection
						title={t("salaryBank")}
						items={[
							{ label: "Salary Grade", value: staff.salaryGrade },
							{ label: "Basic Salary", value: staff.basicSalary },
							{ label: "Bank Name", value: staff.bankName },
							{ label: "Bank Branch", value: staff.bankBranch },
							{ label: "Bank Account No", value: staff.bankAccountNo },
							{ label: "Mobile Wallet Type", value: staff.mobileWalletType },
							{ label: "Mobile Wallet No", value: staff.mobileWalletNo },
						]}
					/>
				</TabsContent>

				<TabsContent value="documents" className="mt-0 space-y-6">
					<Card className="bg-card/60 shadow-none">
						<CardHeader className="">
							<CardTitle className="text-sm font-medium">{t("notes")}</CardTitle>
						</CardHeader>
						<CardContent className="text-sm">
							{staff.notes || "No additional notes provided."}
						</CardContent>
					</Card>
					<Card className="bg-card/60 shadow-none">
						<CardHeader className="">
							<CardTitle className="text-sm font-medium">{t("uploadedDocuments")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{documents.length === 0 ? (
								<div className="text-muted-foreground rounded-md border border-dashed py-8 text-center text-sm">
									No documents attached.
								</div>
							) : (
								documents.map((doc: any, index: number) => {
									const documentId = doc.mediaId || doc.id || String(index);
									return (
										<div
											key={documentId}
											className="flex flex-col gap-3 rounded-md border p-3 @2xl/page:flex-row @2xl/page:items-center @2xl/page:justify-between"
										>
											<div className="min-w-0">
												<div className="text-muted-foreground text-xs uppercase">
													{doc.type || "Document"}
												</div>
												<div className="truncate text-sm">{doc.originalName || doc.url || "Uploaded File"}</div>
												<div className="text-muted-foreground text-xs">
													{formatDate(doc.uploadedAt)}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{doc.url && (
													<Button
														type="button"
														size="sm"
														variant="outline"
														onClick={() => viewDocument(doc.url, doc.originalName || "Document")}
													>
														<Eye className="size-4" />
														View
													</Button>
												)}
												<PermissionGuard
													permissions={[
														PERMISSIONS.STAFF.DIRECTORY.DELETE,
														PERMISSIONS.STAFF.DIRECTORY.ALL,
														PERMISSIONS.STAFF.ALL,
													]}
												>
													<ConfirmationModal
														onConfirm={() => deleteDocument(documentId)}
														title="Delete Document"
														description="Are you sure you want to delete this staff document?"
														confirmText="Delete"
														variant="destructive"
														isLoading={deletingDocumentId === documentId}
													>
														<AlertDialogTrigger asChild>
															<Button type="button" size="sm" variant="destructive">
																<Trash2 className="size-4" />
																Delete
															</Button>
														</AlertDialogTrigger>
													</ConfirmationModal>
												</PermissionGuard>
											</div>
										</div>
									);
								})
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Sheet
				open={!!selectedDocumentUrl}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedDocumentUrl(null);
						setSelectedDocumentName(null);
					}
				}}
			>
				<SheetContent
					side="bottom"
					className="h-[calc(100vh-20px)] max-h-[calc(100vh-20px)] gap-0 p-0"
				>
					<SheetHeader className="border-b p-4">
						<SheetTitle className="flex items-center gap-2 text-base font-medium">
							<FileText className="size-4" />
							{selectedDocumentName || "Document"}
						</SheetTitle>
					</SheetHeader>
					<div className="h-[calc(100vh-110px)] bg-muted/30 p-4">
						{selectedDocumentUrl && (
							<iframe
								src={selectedDocumentUrl}
								className="h-full w-full rounded-md border bg-background"
								title={selectedDocumentName || "Document"}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
