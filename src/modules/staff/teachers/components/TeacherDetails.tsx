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
import { deleteTeacherDocument } from "../hooks/use-teacher-mutations";

type Props = {
	teacher: any;
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

function JsonBlock({ value }: { value: unknown }) {
	if (!value) return <span>{emptyValue}</span>;
	return (
		<pre className="bg-muted/40 max-h-52 overflow-auto rounded-md border p-3 text-xs font-normal whitespace-pre-wrap">
			{typeof value === "string" ? value : JSON.stringify(value, null, 2)}
		</pre>
	);
}

function QualificationList({
	items,
	type,
}: {
	items: any[];
	type: "academic" | "professional";
}) {
	if (!Array.isArray(items) || items.length === 0) {
		return <div className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">No data available.</div>;
	}

	return (
		<div className="overflow-hidden rounded-md border">
			{items.map((item, index) => (
				<div
					key={index}
					className="grid grid-cols-1 gap-x-4 gap-y-2 border-b p-3 text-sm last:border-b-0 @2xl/page:grid-cols-5"
				>
					{type === "academic" ? (
						<>
							<div><span className="text-muted-foreground text-xs">Degree</span><div>{item.degree || emptyValue}</div></div>
							<div><span className="text-muted-foreground text-xs">Institution</span><div>{item.institution || emptyValue}</div></div>
							<div><span className="text-muted-foreground text-xs">Board</span><div>{item.board || emptyValue}</div></div>
							<div><span className="text-muted-foreground text-xs">Result</span><div>{item.result || emptyValue}</div></div>
							<div><span className="text-muted-foreground text-xs">Year</span><div>{item.year || emptyValue}</div></div>
						</>
					) : (
						<>
							<div><span className="text-muted-foreground text-xs">Type</span><div>{item.type || emptyValue}</div></div>
							<div className="@2xl/page:col-span-3"><span className="text-muted-foreground text-xs">Institution</span><div>{item.institution || emptyValue}</div></div>
							<div><span className="text-muted-foreground text-xs">Year</span><div>{item.year || emptyValue}</div></div>
						</>
					)}
				</div>
			))}
		</div>
	);
}

function SubjectBadges({
	subjects,
	fallbackIds,
	primarySubject,
}: {
	subjects?: Array<{ id: string; enName?: string; bnName?: string; code?: string }>;
	fallbackIds?: string[];
	primarySubject?: { id: string; enName?: string; bnName?: string; code?: string };
}) {
	const subjectItems = Array.isArray(subjects) ? [...subjects] : [];

	if (
		primarySubject?.id &&
		!subjectItems.some((subject) => subject.id === primarySubject.id)
	) {
		subjectItems.push(primarySubject);
	}

	const unresolvedIds = (fallbackIds || []).filter(
		(id) => !subjectItems.some((subject) => subject.id === id)
	);

	if (!subjectItems.length && !unresolvedIds.length) {
		return (
			<div className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
				No subjects assigned.
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2">
			{subjectItems.map((subject) => (
				<Badge key={subject.id} variant="outline" className="px-2.5 py-2 h-8 text-sm font-normal">
					{subject.enName || subject.bnName || subject.code || subject.id}
				</Badge>
			))}
			{unresolvedIds.map((id) => (
				<Badge key={id} variant="outline" className="px-2.5 py-2 h-8 text-sm font-normal">
					{id}
				</Badge>
			))}
		</div>
	);
}

export function TeacherDetails({ teacher }: Props) {
	const t = useTranslations("Teachers");
	const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
	const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
	const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

	const photoUrl = getMediaUrl(teacher.photoUrl);
	const documents = Array.isArray(teacher.documents) ? teacher.documents : [];

	const viewDocument = (url: string, name: string) => {
		setSelectedDocumentUrl(getMediaUrl(url));
		setSelectedDocumentName(name);
	};

	const deleteDocument = async (documentId: string) => {
		setDeletingDocumentId(documentId);
		try {
			await deleteTeacherDocument(teacher.id, documentId);
			toast.success("Document deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeletingDocumentId(null);
		}
	};

	const subjectName =
		teacher.primarySubject?.enName ||
		teacher.primarySubject?.bnName ||
		teacher.primarySubject?.code;

	return (
		<div className="@container/page space-y-6">
			<Card className="shadow-none">
				<CardContent className="flex flex-col gap-4 @2xl/page:flex-row @2xl/page:items-center @2xl/page:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<div className="bg-muted relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border">
							{photoUrl ? (
								<ProgressiveImage
									src={photoUrl}
									placeholderBase64={teacher.photoPlaceholder || undefined}
									alt={teacher.fullName}
									fill
									className="object-cover"
								/>
							) : (
								<UserCircle className="text-muted-foreground size-10" />
							)}
						</div>
						<div className="min-w-0 space-y-1">
							<h2 className="truncate text-lg font-medium">{teacher.fullName}</h2>
							<div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
								<span>{teacher.employeeCode}</span>
								<span className="bg-muted-foreground/70 size-1.5 rounded-full" aria-hidden="true" />
								<span>{teacher.designation?.name || "Teacher"}</span>
								<span className="bg-muted-foreground/70 size-1.5 rounded-full" aria-hidden="true" />
								<span>{teacher.department?.name || "No department"}</span>
							</div>
							<div className="flex flex-wrap gap-2 pt-1">
								<Badge variant={teacher.status === "active" ? "default" : "secondary"} className="capitalize">
									{formatValue(teacher.status)}
								</Badge>
								<Badge variant="outline" className="capitalize">
									{formatValue(teacher.employmentType)}
								</Badge>
							</div>
						</div>
					</div>
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.TEACHERS.EDIT,
							PERMISSIONS.STAFF.TEACHERS.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<Button
							asChild
							variant="outline"
							className="w-full @2xl/page:w-auto"
						>
							<Link href={PATHS.STAFF.TEACHERS.EDIT(teacher.id)}>
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
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="academic">Academic</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="mpo">MPO & NTRCA</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="bank">Bank</TabsTrigger>
					<TabsTrigger className="h-8! flex-none basis-[calc(50%-0.125rem)] px-2 text-xs @xl/page:basis-[calc(33.333%-0.25rem)] @xl/page:text-sm @3xl/page:basis-auto" value="documents">Documents</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-0 space-y-6">
					<InfoSection
						title={t("personalInformation")}
						items={[
							{ label: "Full Name", value: teacher.fullName },
							{ label: "Full Name (Bengali)", value: teacher.fullNameBn },
							{ label: "Father's Name", value: teacher.fatherName },
							{ label: "Mother's Name", value: teacher.motherName },
							{ label: "Date of Birth", value: formatDate(teacher.dateOfBirth) },
							{ label: "Gender", value: formatValue(teacher.gender) },
							{ label: "Blood Group", value: teacher.bloodGroup },
							{ label: "Religion", value: teacher.religion },
							{ label: "Nationality", value: teacher.nationality },
							{ label: "Marital Status", value: formatValue(teacher.maritalStatus) },
						]}
					/>
					<InfoSection
						title={t("identityDocuments")}
						items={[
							{ label: "Employee Code", value: teacher.employeeCode },
							{ label: "NID Number", value: teacher.nid },
							{ label: "Birth Certificate No", value: teacher.birthCertificateNo },
							{ label: "Passport No", value: teacher.passportNo },
							{ label: "Global Person ID", value: teacher.globalPersonId },
						]}
					/>
				</TabsContent>

				<TabsContent value="contact" className="mt-0 space-y-4">
					<InfoSection
						title={t("contactInformation")}
						items={[
							{ label: "Phone Number", value: teacher.phone },
							{ label: "Alternate Phone", value: teacher.alternatePhone },
							{ label: "Email Address", value: teacher.email },
						]}
					/>
					<InfoSection
						title={t("location")}
						items={[
							{ label: "Division", value: teacher.division?.enName || teacher.division?.bnName },
							{ label: "District", value: teacher.district?.enName || teacher.district?.bnName },
							{ label: "Upazila", value: teacher.upazila?.enName || teacher.upazila?.bnName },
							{ label: "Post Code", value: teacher.postCode },
							{ label: "Latitude", value: formatValue(teacher.latitude) },
							{ label: "Longitude", value: formatValue(teacher.longitude) },
							{ label: "Present Address", value: teacher.address },
							{ label: "Permanent Address", value: teacher.permanentAddress },
						]}
					/>
					<Card className="bg-card/60 shadow-none">
						<CardHeader>
							<CardTitle className="text-base font-medium">{t("locationMap")}</CardTitle>
						</CardHeader>
						<CardContent>
							<SchoolDetailsLocationMap
								latitude={teacher.latitude ? Number(teacher.latitude) : null}
								longitude={teacher.longitude ? Number(teacher.longitude) : null}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="employment" className="mt-0 space-y-4">
					<InfoSection
						title={t("employment")}
						items={[
							{ label: "Designation", value: teacher.designation?.name },
							{ label: "Department", value: teacher.department?.name },
							{ label: "Head of Institution", value: formatValue(teacher.isHeadOfInstitution) },
							{ label: "Employment Type", value: formatValue(teacher.employmentType) },
							{ label: "Employment Status", value: formatValue(teacher.status) },
							{ label: "Joining Date", value: formatDate(teacher.joiningDate) },
							{ label: "Confirmation Date", value: formatDate(teacher.confirmationDate) },
							{ label: "Resignation Date", value: formatDate(teacher.resignationDate) },
							{ label: "Retirement Date", value: formatDate(teacher.retirementDate) },
							{ label: "Exit Reason", value: teacher.exitReason },
						]}
					/>
					<InfoSection
						title={t("careerTracking")}
						items={[
							{ label: "Previous Institution", value: teacher.previousInstitution },
							{ label: "Years of Experience", value: formatValue(teacher.yearsOfExperience) },
							{ label: "Transferred From", value: teacher.transferredFrom },
							{ label: "Transferred To", value: teacher.transferredTo },
							{ label: "Transfer Date", value: formatDate(teacher.transferDate) },
							{ label: "Joining Session ID", value: teacher.joiningSessionId },
						]}
					/>
				</TabsContent>

				<TabsContent value="academic" className="mt-0 space-y-4">
					<InfoSection
						title={t("subjectsQualifications")}
						items={[
							{ label: "Primary Subject", value: subjectName },
							{ label: "Highest Qualification", value: teacher.highestQualification },
							{ label: "NTRCA Subject", value: teacher.ntrcaSubject },
							{ label: "Is Hafiz", value: formatValue(teacher.isHafiz) },
							{ label: "Qirat Grade", value: teacher.qiratGrade },
						]}
					/>
					<Card className="bg-card/60 shadow-none">
						<CardHeader className="=">
							<CardTitle className="font-medium">{t("qualificationDetails")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="text-muted-foreground text-xs">Qualification Details</div>
								<QualificationList items={teacher.qualificationDetails || []} type="academic" />
							</div>
							<div className="space-y-2">
								<div className="text-muted-foreground text-xs">Professional Qualifications</div>
								<QualificationList items={teacher.professionalQualifications || []} type="professional" />
							</div>
							<div className="space-y-2 @3xl/page:col-span-2">
								<div className="text-muted-foreground text-xs">Specialization Subjects</div>
								<SubjectBadges
									subjects={teacher.specializationSubjectItems}
									primarySubject={teacher.primarySubject}
									fallbackIds={Array.isArray(teacher.specializationSubjects) ? teacher.specializationSubjects : []}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="mpo" className="mt-0 space-y-4">
					<InfoSection
						title={t("mpoInformation")}
						items={[
							{ label: "MPO Listed", value: formatValue(teacher.isMpoListed) },
							{ label: "MPO Index No", value: teacher.mpoIndexNo },
							{ label: "MPO Included Date", value: formatDate(teacher.mpoIncludedAt) },
							{ label: "MPO Category", value: teacher.mpoCategory },
							{ label: "BANBEIS Teacher ID", value: teacher.banbeisTeacherId },
						]}
					/>
					<InfoSection
						title={t("ntrcaInformation")}
						items={[
							{ label: "NTRCA Registered", value: formatValue(teacher.ntrcaRegistered) },
							{ label: "NTRCA Registration No", value: teacher.ntrcaRegNo },
							{ label: "NTRCA Registration Year", value: teacher.ntrcaRegYear },
							{
								label: "NTRCA Certificate",
								value: teacher.ntrcaCertificateUrl ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => viewDocument(teacher.ntrcaCertificateUrl, "NTRCA Certificate")}
									>
										<Eye className="size-4" />
										View
									</Button>
								) : (
									emptyValue
								),
							},
						]}
					/>
				</TabsContent>

				<TabsContent value="bank" className="mt-0 space-y-4">
					<InfoSection
						title={t("salaryBank")}
						items={[
							{ label: "Salary Grade", value: teacher.salaryGrade },
							{ label: "Basic Salary", value: teacher.basicSalary },
							{ label: "Bank Name", value: teacher.bankName },
							{ label: "Bank Branch", value: teacher.bankBranch },
							{ label: "Bank Account No", value: teacher.bankAccountNo },
							{ label: "Mobile Wallet Type", value: teacher.mobileWalletType },
							{ label: "Mobile Wallet No", value: teacher.mobileWalletNo },
						]}
					/>
				</TabsContent>

				<TabsContent value="documents" className="mt-0 space-y-6">
					<Card className="bg-card/60 shadow-none">
						<CardHeader className="">
							<CardTitle className="text-sm font-medium">{t("notes")}</CardTitle>
						</CardHeader>
						<CardContent className="text-sm">
							{teacher.notes || "No additional notes provided."}
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
														PERMISSIONS.STAFF.TEACHERS.DELETE,
														PERMISSIONS.STAFF.TEACHERS.ALL,
														PERMISSIONS.STAFF.ALL,
													]}
												>
													<ConfirmationModal
														onConfirm={() => deleteDocument(documentId)}
														title="Delete Document"
														description="Are you sure you want to delete this teacher document?"
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
