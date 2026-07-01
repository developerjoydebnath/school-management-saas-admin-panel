"use client";

import { compressImage } from "@/lib/compressImage";
import { TeacherFormValues, teacherSchema } from "@/modules/staff/teachers/dto/teacher.dto";
import { createTeacher, updateTeacher } from "@/modules/staff/teachers/hooks/use-teacher-mutations";
import InputField from "@/shared/components/form/InputField";
import { LocationSelect } from "@/shared/components/form/LocationSelect";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { appConfig } from "@/shared/configs/app.config";
import { uploadDocument, uploadImage } from "@/shared/services/uploadApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SchoolLocationMap } from "@/modules/schools-management/schools/components/SchoolLocationMap";

type Props = {
	id?: string;
	defaultValues: Partial<TeacherFormValues>;
	isEdit?: boolean;
};

const statusOptions = [
	{ label: "Active", value: "active" },
	{ label: "On Leave", value: "on_leave" },
	{ label: "Suspended", value: "suspended" },
	{ label: "Resigned", value: "resigned" },
	{ label: "Retired", value: "retired" },
	{ label: "Terminated", value: "terminated" },
	{ label: "Transferred", value: "transferred" },
	{ label: "Deceased", value: "deceased" },
];

const genderOptions = [
	{ label: "Male", value: "male" },
	{ label: "Female", value: "female" },
	{ label: "Other", value: "other" },
];

const maritalStatusOptions = [
	{ label: "Single", value: "single" },
	{ label: "Married", value: "married" },
	{ label: "Divorced", value: "divorced" },
	{ label: "Widowed", value: "widowed" },
];

const employmentTypeOptions = [
	{ label: "Full Time", value: "full_time" },
	{ label: "Part Time", value: "part_time" },
	{ label: "Contractual", value: "contractual" },
	{ label: "Guest Teacher", value: "guest_teacher" },
	{ label: "Visiting", value: "visiting" },
];

const documentTypeOptions = [
	{ label: "NID Copy", value: "nid_copy" },
	{ label: "Certificate", value: "certificate" },
	{ label: "Resume", value: "resume" },
	{ label: "Joining Letter", value: "joining_letter" },
	{ label: "Release Order", value: "release_order" },
	{ label: "Other", value: "other" },
];

function normalizeNullableDefaults(value: any): any {
	if (value === null) return "";
	if (Array.isArray(value)) return value.map((item) => normalizeNullableDefaults(item));
	if (typeof value === "object" && value !== null && !(value instanceof File)) {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, normalizeNullableDefaults(item)])
		);
	}
	return value;
}

export default function TeacherForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const tForm = useTranslations("TeacherForm");
	const tCommon = useTranslations("Common");

	const processedDefaultValues = normalizeNullableDefaults({ ...defaultValues });
	const getMediaUrl = (url?: string | null) => {
		if (!url) return undefined;
		if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
		return `${appConfig.API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
	};
	if (Array.isArray(processedDefaultValues.documents)) {
		processedDefaultValues.documents = processedDefaultValues.documents.map((doc: any) => {
			if (doc.type && (doc.mediaId || doc.url)) {
				return { type: doc.type, file: doc };
			}
			return doc;
		});
	}
	processedDefaultValues.qualificationDetails = Array.isArray(
		processedDefaultValues.qualificationDetails
	)
		? processedDefaultValues.qualificationDetails
		: [];
	processedDefaultValues.professionalQualifications = Array.isArray(
		processedDefaultValues.professionalQualifications
	)
		? processedDefaultValues.professionalQualifications
		: [];

	const form = useForm<TeacherFormValues>({
		resolver: zodResolver(teacherSchema as any),
		shouldFocusError: false,
		defaultValues: processedDefaultValues as TeacherFormValues,
	});

	const {
		fields: documentFields,
		append: appendDocument,
		remove: removeDocument,
	} = useFieldArray({
		control: form.control,
		name: "documents",
	});
	const {
		fields: qualificationFields,
		append: appendQualification,
		remove: removeQualification,
	} = useFieldArray({
		control: form.control,
		name: "qualificationDetails",
	});
	const {
		fields: professionalQualificationFields,
		append: appendProfessionalQualification,
		remove: removeProfessionalQualification,
	} = useFieldArray({
		control: form.control,
		name: "professionalQualifications",
	});

	const [isUploading, setIsUploading] = useState(false);

	const onSubmit = async (data: TeacherFormValues) => {
		try {
			setIsUploading(true);
			// Clean up payload (convert empty strings or nulls where necessary)
			const payload: Record<string, any> = { ...data };
			const requiredFields = new Set([
				"fullName",
				"dateOfBirth",
				"gender",
				"phone",
				"email",
				"designationId",
				"joiningDate",
			]);
			Object.keys(payload).forEach((key) => {
				if (payload[key] === "" && !requiredFields.has(key)) {
					delete payload[key];
				}
			});
			if (!payload.email) delete payload.email;
			if (!payload.departmentId) delete payload.departmentId;
			if (!payload.primarySubjectId) delete payload.primarySubjectId;
			for (const key of ["specializationSubjects"]) {
				if (typeof payload[key] === "string" && payload[key].trim()) {
					try {
						payload[key] = JSON.parse(payload[key]);
					} catch {
						form.setError(key as keyof TeacherFormValues, {
							type: "manual",
							message: "Enter valid JSON",
						});
						return;
					}
				}
				if (payload[key] === "") delete payload[key];
			}
			payload.qualificationDetails = Array.isArray(payload.qualificationDetails)
				? payload.qualificationDetails.filter((item: any) =>
						Object.values(item || {}).some((value) => value !== undefined && value !== null && value !== "")
					)
				: [];
			payload.professionalQualifications = Array.isArray(payload.professionalQualifications)
				? payload.professionalQualifications.filter((item: any) =>
						Object.values(item || {}).some((value) => value !== undefined && value !== null && value !== "")
					)
				: [];

			// Handle File uploads
			if ((payload.photoMediaId as any) instanceof File) {
				try {
					const compressed = await compressImage(payload.photoMediaId as unknown as File);
					const res = await uploadImage(compressed, "teacher_photo");
					payload.photoMediaId = res.mediaId;
					payload.photoPlaceholder = res.placeholder;
					payload.photoUrl = res.url;
				} catch (err) {
					console.error("Photo upload failed", err);
				}
			}

			if ((payload.ntrcaCertificateMediaId as any) instanceof File) {
				try {
					const res = await uploadImage(
						payload.ntrcaCertificateMediaId as unknown as File,
						"staff_document"
					);
					payload.ntrcaCertificateMediaId = res.mediaId;
					payload.ntrcaCertificateUrl = res.url;
				} catch (err) {
					console.error("NTRCA cert upload failed", err);
				}
			}

			// Handle multiple documents upload
			if (payload.documents && Array.isArray(payload.documents)) {
				const uploadedDocs = [];
				for (const doc of payload.documents) {
					if (doc.file instanceof File) {
						try {
							const res = await uploadDocument(doc.file, "staff_document");
							uploadedDocs.push({
								type: doc.type || "other",
								mediaId: res.mediaId,
								url: res.url,
								originalName: doc.file.name,
								uploadedAt: new Date().toISOString(),
							});
						} catch (err) {
							console.error("Document upload failed", err);
						}
					} else if (doc.file) {
						// Already uploaded or existing document structure
						uploadedDocs.push({
							type: doc.type || "other",
							...doc.file,
						});
					} else if (doc.mediaId || doc.url) {
						uploadedDocs.push(doc);
					}
				}
				payload.documents = uploadedDocs;
			}

			if (isEdit && id) {
				await updateTeacher(id, payload);
				toast.success("Teacher updated successfully");
			} else {
				await createTeacher(payload as TeacherFormValues);
				toast.success("Teacher added successfully");
			}
			router.push(PATHS.STAFF.TEACHERS.ROOT);
		} catch (error: any) {
			const errors = error?.response?.data?.errors;
			if (Array.isArray(errors)) {
				errors.forEach((err: any) => {
					if (err.field) {
						form.setError(err.field, {
							type: "server",
							message: err.message,
						});
					}
				});
			}
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-8">
			{/* ── Basic Information ─────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.basicInfo.title")}</CardTitle>
					<CardDescription>{tForm("sections.basicInfo.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="fullName"
						label="Full Name"
						placeholder="Enter Full Name"
						type="text"
						required
					/>
					<InputField
						control={form.control}
						name="fullNameBn"
						label="Full Name (Bengali)"
						placeholder="Enter Full Name in Bengali"
						type="text"
					/>
					<InputField
						control={form.control}
						name="fatherName"
						label="Father's Name"
						placeholder="Enter Father's Name"
						type="text"
					/>
					<InputField
						control={form.control}
						name="motherName"
						label="Mother's Name"
						placeholder="Enter Mother's Name"
						type="text"
					/>
					<InputField
						control={form.control}
						name="dateOfBirth"
						label="Date of Birth"
						type="date"
						placeholder="Select Date of Birth"
						required
					/>
					<InputField
						control={form.control}
						name="gender"
						label="Gender"
						type="select"
						options={genderOptions}
						placeholder="Select Gender"
						required
					/>
					<InputField
						control={form.control}
						name="bloodGroup"
						label="Blood Group"
						type="select"
						options={[
							{ label: "A+", value: "A+" },
							{ label: "A-", value: "A-" },
							{ label: "B+", value: "B+" },
							{ label: "B-", value: "B-" },
							{ label: "AB+", value: "AB+" },
							{ label: "AB-", value: "AB-" },
							{ label: "O+", value: "O+" },
							{ label: "O-", value: "O-" },
						]}
						placeholder="Select Blood Group"
					/>
					<InputField
						control={form.control}
						name="religion"
						label="Religion"
						type="select"
						options={[
							{ label: "Islam", value: "Islam" },
							{ label: "Hinduism", value: "Hinduism" },
							{ label: "Buddhism", value: "Buddhism" },
							{ label: "Christianity", value: "Christianity" },
							{ label: "Other", value: "Other" },
						]}
						placeholder="Select Religion"
					/>
					<InputField
						control={form.control}
						name="nationality"
						label="Nationality"
						placeholder="e.g. Bangladeshi"
						type="text"
					/>
					<InputField
						control={form.control}
						name="maritalStatus"
						label="Marital Status"
						type="select"
						options={maritalStatusOptions}
						placeholder="Select Status"
					/>
					<InputField
						control={form.control}
						name="nid"
						label="NID Number"
						placeholder="Enter NID Number"
						type="text"
					/>
					<InputField
						control={form.control}
						name="birthCertificateNo"
						label="Birth Certificate No"
						placeholder="Enter Birth Certificate No"
						type="text"
					/>
					<InputField
						control={form.control}
						name="passportNo"
						label="Passport No"
						placeholder="Enter Passport No"
						type="text"
					/>
				</CardContent>
			</Card>

			{/* ── Contact Information ───────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.locationContact.title")}</CardTitle>
					<CardDescription>
						{tForm("sections.locationContact.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="phone"
						label="Phone Number"
						placeholder="e.g. 01XXXXXXXXX"
						type="text"
						required
					/>
					<InputField
						control={form.control}
						name="alternatePhone"
						label="Alternate Phone"
						placeholder="e.g. 01XXXXXXXXX"
						type="text"
					/>
					<InputField
						control={form.control}
						name="email"
						label="Email Address"
						placeholder="e.g. email@example.com"
						type="email"
						required
					/>
					<LocationSelect
						control={form.control}
						divisionName="divisionId"
						districtName="districtId"
						upazilaName="upazilaId"
						divisionRequired={false}
						districtRequired={false}
						upazilaRequired={false}
					/>
					<InputField
						control={form.control}
						name="postCode"
						label="Post Code"
						placeholder="Enter Post Code"
						type="text"
					/>
					<div className="col-span-full grid grid-cols-1 gap-6 md:grid-cols-2">
						<InputField
							control={form.control}
							name="address"
							label="Present Address"
							placeholder="Enter Present Address"
							type="textarea"
						/>
						<InputField
							control={form.control}
							name="permanentAddress"
							label="Permanent Address"
							placeholder="Enter Permanent Address"
							type="textarea"
						/>
					</div>
					<div className="col-span-full">
						<SchoolLocationMap control={form.control as any} setValue={form.setValue as any} />
					</div>
					<div className="col-span-full grid grid-cols-1 gap-6 md:grid-cols-2">
						<InputField
							control={form.control}
							name="latitude"
							label="Latitude"
							placeholder="e.g. 23.810331"
							type="number"
							min={-90}
							max={90}
							step="any"
						/>
						<InputField
							control={form.control}
							name="longitude"
							label="Longitude"
							placeholder="e.g. 90.412521"
							type="number"
							min={-180}
							max={180}
							step="any"
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Employment Details ────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.employment.title")}</CardTitle>
					<CardDescription>{tForm("sections.employment.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="designationId"
						label="Designation"
						type="designationSelect"
						placeholder="Select Designation"
						required
					/>
					<InputField
						control={form.control}
						name="departmentId"
						label="Department"
						type="departmentSelect"
						placeholder="Select Department"
					/>
					<InputField
						control={form.control}
						name="employmentType"
						label="Employment Type"
						type="select"
						options={employmentTypeOptions}
						placeholder="Select Employment Type"
					/>
					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						options={statusOptions}
						placeholder="Select Status"
					/>
					<InputField
						control={form.control}
						name="joiningDate"
						label="Joining Date"
						type="date"
						placeholder="Select Joining Date"
						required
					/>
					<InputField
						control={form.control}
						name="confirmationDate"
						label="Confirmation Date"
						type="date"
						placeholder="Select Confirmation Date"
					/>
					<InputField
						control={form.control}
						name="resignationDate"
						label="Resignation Date"
						type="date"
						placeholder="Select Resignation Date"
					/>
					<InputField
						control={form.control}
						name="retirementDate"
						label="Retirement Date"
						type="date"
						placeholder="Select Retirement Date"
					/>
					<InputField
						control={form.control}
						name="exitReason"
						label="Exit Reason"
						placeholder="Enter exit reason"
						type="text"
					/>
					<InputField
						control={form.control}
						name="salaryGrade"
						label="Salary Grade"
						placeholder="Enter Grade"
						type="text"
					/>
					<InputField
						control={form.control}
						name="basicSalary"
						label="Basic Salary"
						placeholder="e.g. 22000"
						type="number"
					/>
					<InputField
						control={form.control}
						name="banbeisTeacherId"
						label="BANBEIS Teacher ID"
						placeholder="Enter BANBEIS ID"
						type="text"
					/>
					<InputField
						control={form.control}
						name="yearsOfExperience"
						label="Years of Experience"
						placeholder="e.g. 5"
						type="number"
					/>
					<InputField
						control={form.control}
						name="previousInstitution"
						label="Previous Institution"
						placeholder="Enter Previous Institution"
						type="text"
					/>
					<div className="flex items-center gap-3">
						<InputField
							control={form.control}
							name="isHeadOfInstitution"
							label="Is Head of Institution"
							type="switch"
							placeholder="Toggle head of institution"
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Subjects & Qualifications ─────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.subjectsQualifications.title")}</CardTitle>
					<CardDescription>
						{tForm("sections.subjectsQualifications.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="primarySubjectId"
						label="Primary Subject"
						type="subjectSingleSelect"
						placeholder="Select Primary Subject"
					/>
					<InputField
						control={form.control}
						name="specializationSubjects"
						label="Specialization Subjects"
						type="subjectSelection"
						placeholder="Select Specialization Subjects"
					/>
					<InputField
						control={form.control}
						name="highestQualification"
						label="Highest Qualification"
						placeholder="e.g. Masters in Physics"
						type="text"
					/>
					<div className="col-span-full space-y-4 rounded-lg border p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<h3 className="text-sm font-medium">Qualification Details</h3>
								<p className="text-muted-foreground text-sm">
									Add academic degrees, institution, board, result, and year.
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									appendQualification({
										degree: "",
										institution: "",
										board: "",
										result: "",
										year: "",
									})
								}
							>
								<Plus className="h-4 w-4" />
								Add More
							</Button>
						</div>
						{qualificationFields.length === 0 ? (
							<div className="text-muted-foreground rounded-md border border-dashed py-4 text-center text-sm">
								No qualification added.
							</div>
						) : (
							<div className="space-y-4">
								{qualificationFields.map((field, index) => (
									<div key={field.id} className="relative grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2 lg:grid-cols-5">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive absolute right-2 top-2 h-7 w-7"
											onClick={() => removeQualification(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
										<InputField
											control={form.control}
											name={`qualificationDetails.${index}.degree`}
											label="Degree"
											placeholder="e.g. BSc"
											type="text"
										/>
										<InputField
											control={form.control}
											name={`qualificationDetails.${index}.institution`}
											label="Institution"
											placeholder="e.g. University of Dhaka"
											type="text"
										/>
										<InputField
											control={form.control}
											name={`qualificationDetails.${index}.board`}
											label="Board"
											placeholder="e.g. Dhaka Board"
											type="text"
										/>
										<InputField
											control={form.control}
											name={`qualificationDetails.${index}.result`}
											label="Result"
											placeholder="e.g. First Class"
											type="text"
										/>
										<InputField
											control={form.control}
											name={`qualificationDetails.${index}.year`}
											label="Year"
											placeholder="e.g. 2020"
											type="number"
										/>
									</div>
								))}
							</div>
						)}
					</div>
					<div className="col-span-full space-y-4 rounded-lg border p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<h3 className="text-sm font-medium">Professional Qualifications</h3>
								<p className="text-muted-foreground text-sm">
									Add BEd, MEd, diploma, training, or similar credentials.
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									appendProfessionalQualification({
										type: "",
										institution: "",
										year: "",
									})
								}
							>
								<Plus className="h-4 w-4" />
								Add More
							</Button>
						</div>
						{professionalQualificationFields.length === 0 ? (
							<div className="text-muted-foreground rounded-md border border-dashed py-4 text-center text-sm">
								No professional qualification added.
							</div>
						) : (
							<div className="space-y-4">
								{professionalQualificationFields.map((field, index) => (
									<div key={field.id} className="relative grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-3">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive absolute right-2 top-2 h-7 w-7"
											onClick={() => removeProfessionalQualification(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
										<InputField
											control={form.control}
											name={`professionalQualifications.${index}.type`}
											label="Type"
											placeholder="e.g. BEd"
											type="text"
										/>
										<InputField
											control={form.control}
											name={`professionalQualifications.${index}.institution`}
											label="Institution"
											placeholder="e.g. National University"
											type="text"
										/>
										<InputField
											control={form.control}
											name={`professionalQualifications.${index}.year`}
											label="Year"
											placeholder="e.g. 2021"
											type="number"
										/>
									</div>
								))}
							</div>
						)}
					</div>
					<InputField
						control={form.control}
						name="isHafiz"
						label="Is Hafiz? (For Madrasa)"
						type="switch"
						placeholder="Toggle Hafiz status"
					/>
					<InputField
						control={form.control}
						name="qiratGrade"
						label="Qirat Grade (For Madrasa)"
						placeholder="e.g. Mumayyaz"
						type="text"
					/>
				</CardContent>
			</Card>

			{/* ── MPO Information ─────────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.mpo.title")}</CardTitle>
					<CardDescription>{tForm("sections.mpo.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="mpoIndexNo"
						label="MPO Index No"
						placeholder="Enter Index No"
						type="text"
					/>
					<InputField
						control={form.control}
						name="mpoIncludedAt"
						label="MPO Included Date"
						type="date"
						placeholder="Select MPO Included Date"
					/>
					<InputField
						control={form.control}
						name="mpoCategory"
						label="MPO Category"
						placeholder="Enter Category"
						type="text"
					/>
					<InputField
						control={form.control}
						name="isMpoListed"
						label="MPO Listed"
						type="switch"
						placeholder="Toggle MPO listed status"
					/>
				</CardContent>
			</Card>

			{/* ── NTRCA Information ───────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>NTRCA Information</CardTitle>
					<CardDescription>NTRCA registration and certificate details.</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="ntrcaRegistered"
						label="NTRCA Registered"
						type="switch"
						placeholder="Toggle NTRCA registration"
					/>
					<InputField
						control={form.control}
						name="ntrcaRegNo"
						label="NTRCA Registration No"
						placeholder="Enter Registration No"
						type="text"
					/>
					<InputField
						control={form.control}
						name="ntrcaRegYear"
						label="NTRCA Registration Year"
						placeholder="e.g. 2018"
						type="number"
					/>
					<InputField
						control={form.control}
						name="ntrcaSubject"
						label="NTRCA Subject"
						placeholder="Enter Subject"
						type="text"
					/>
					<InputField
						control={form.control}
						name="ntrcaCertificateMediaId"
						label="NTRCA Certificate"
						type="file"
						moduleName="staff_document"
						placeholder="Upload NTRCA Certificate"
						defaultPreview={getMediaUrl(defaultValues.ntrcaCertificateUrl)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Transfer & Career Tracking</CardTitle>
					<CardDescription>Optional transfer and career history fields.</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="globalPersonId"
						label="Global Person ID"
						placeholder="Enter global person UUID"
						type="text"
					/>
					<InputField
						control={form.control}
						name="transferredFrom"
						label="Transferred From"
						placeholder="e.g. previous_school_schema"
						type="text"
					/>
					<InputField
						control={form.control}
						name="transferredTo"
						label="Transferred To"
						placeholder="e.g. next_school_schema"
						type="text"
					/>
					<InputField
						control={form.control}
						name="transferDate"
						label="Transfer Date"
						type="date"
						placeholder="Select Transfer Date"
					/>
				</CardContent>
			</Card>

			{/* ── Bank Information ────────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.bank.title")}</CardTitle>
					<CardDescription>{tForm("sections.bank.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="bankName"
						label="Bank Name"
						placeholder="Enter Bank Name"
						type="text"
					/>
					<InputField
						control={form.control}
						name="bankBranch"
						label="Branch"
						placeholder="Enter Branch"
						type="text"
					/>
					<InputField
						control={form.control}
						name="bankAccountNo"
						label="Account No"
						placeholder="Enter Account No"
						type="text"
					/>
					<InputField
						control={form.control}
						name="mobileWalletType"
						label="Mobile Wallet Type"
						placeholder="e.g. bKash"
						type="text"
					/>
					<InputField
						control={form.control}
						name="mobileWalletNo"
						label="Mobile Wallet No"
						placeholder="Enter Wallet No"
						type="text"
					/>
				</CardContent>
			</Card>

			{/* ── Profile Image ───────────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.profileImage.title")}</CardTitle>
					<CardDescription>{tForm("sections.profileImage.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<div className="col-span-full">
						<InputField
							control={form.control}
							name="photoMediaId"
							label="Photo"
							type="file"
							placeholder="Upload Photo"
							defaultPreview={getMediaUrl(defaultValues.photoUrl)}
							placeholderBase64={defaultValues.photoPlaceholder}
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Additional Notes & Documents ───────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>Additional Notes & Documents</CardTitle>
					<CardDescription>
						Any other remarks, notes, or uploaded documents.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<InputField
						control={form.control}
						name="notes"
						label="Notes"
						placeholder="Enter notes..."
						type="textarea"
						className="col-span-full mb-6 h-24"
					/>

					<div className="col-span-full space-y-4">
						<div className="flex items-center justify-between border-b pb-2">
							<h3 className="text-sm font-semibold">Teacher Documents</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => appendDocument({ type: "", file: null })}
							>
								<Plus className="h-4 w-4" />
								Add Document
							</Button>
						</div>

						{documentFields.length === 0 ? (
							<p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-sm">
								No documents added.
							</p>
						) : (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{documentFields.map((field, index) => (
									<div
										key={field.id}
										className="bg-card relative space-y-4 rounded-lg border p-4"
									>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive hover:bg-destructive/10 absolute top-2 right-2 z-10 h-6 w-6"
											onClick={() => removeDocument(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>

										<InputField
											control={form.control}
											name={`documents.${index}.type`}
											label="Document Type"
											type="select"
											options={documentTypeOptions}
											placeholder="Select Type"
										/>

										<InputField
											control={form.control}
											name={`documents.${index}.file`}
											label="Upload File"
											type="document-single"
											moduleName="staff_document"
											placeholder="Upload document"
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<div className="bg-background/80 sticky bottom-4 z-10 flex items-center justify-end gap-4 rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button
					type="button"
					variant="outline"
					disabled={form.formState.isSubmitting}
					size="lg"
					onClick={() => router.push(PATHS.STAFF.TEACHERS.ROOT)}
				>
					{tCommon("cancel")}
				</Button>
				<Button
					type="submit"
					disabled={form.formState.isSubmitting || isUploading}
					size="lg"
					className="min-w-[150px]"
				>
					{form.formState.isSubmitting || isUploading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							{tForm("saving")}
						</>
					) : (
						<>
							<Save className="h-4 w-4" />
							{isEdit ? tForm("updateTeacher") : tForm("createTeacher")}
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
