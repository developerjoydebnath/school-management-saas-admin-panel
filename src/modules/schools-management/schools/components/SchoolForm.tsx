"use client";

import { compressImage } from "@/lib/compressImage";
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
import { createSchoolSchema, updateSchoolSchema } from "@/shared/models/school.dto";
import { SchoolModel } from "@/shared/models/school.model";
import { uploadImage } from "@/shared/services/uploadApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { SchoolLocationMap } from "./SchoolLocationMap";

type Props = {
	initialData?: SchoolModel;
	isSubmitting: boolean;
	onSubmit: (data: any) => void;
	onCancel: () => void;
};

export function SchoolForm({ initialData, isSubmitting, onSubmit, onCancel }: Props) {
	const isEdit = !!initialData;
	const tForm = useTranslations("SchoolForm");
	const tCommon = useTranslations("Common");
	const schema = isEdit ? updateSchoolSchema : createSchoolSchema;
	const [isUploading, setIsUploading] = useState(false);

	const form = useForm<any>({
		resolver: zodResolver(schema as any),
		defaultValues: {
			schoolName: "",
			schoolType: "",
			schoolNameBn: "",
			adminName: "",
			// Location defaults – will be set from initialData on edit
			divisionId: null,
			districtId: null,
			upazilaId: null,
			// postCode is String in DB; we keep it as string
			postCode: "",
			address: "",
			latitude: null,
			longitude: null,
			contactEmail: "",
			contactPhone: "",
			alternatePhone: "",
			website: "",
			eiin: "",
			registrationNo: "",
			mpoStatus: false,
			banbeis: "",
			establishedYear: new Date().getFullYear(),
			governingBodyType: "",
			recognitionStatus: "",
			recognizedBy: "",
			affiliationBoard: "",
			affiliationNo: "",
			medium: "",
			educationLevel: [],
			shift: "",
			hasHostel: false,
			hasPermanentCampus: false,
			hostelCapacity: null,
			headTeacherTitle: "",
			totalRooms: null,
			totalStudentCapacity: null,
			facebookPage: "",
			youtubeChannel: "",
			isCustomDomainEnabled: false,
			customDomain: "",
		},
	});
	const logoPlaceholder = useWatch({ control: form.control, name: "logoPlaceholder" });
	const bannerPlaceholder = useWatch({ control: form.control, name: "bannerPlaceholder" });

	useEffect(() => {
		if (initialData) {
			form.reset({
				schoolName: initialData.schoolName,
				schoolType: initialData.schoolType,
				schoolNameBn: initialData.schoolNameBn || "",
				divisionId: initialData.divisionId,
				districtId: initialData.districtId,
				upazilaId: initialData.upazilaId ?? null,
				postCode: initialData.postCode || "",
				address: initialData.address || "",
				latitude: initialData.latitude ?? null,
				longitude: initialData.longitude ?? null,
				contactEmail: initialData.contactEmail,
				contactPhone: initialData.contactPhone,
				alternatePhone: initialData.alternatePhone || "",
				website: initialData.website || "",
				eiin: initialData.eiin || "",
				registrationNo: initialData.registrationNo || "",
				mpoStatus: initialData.mpoStatus,
				banbeis: initialData.banbeis || "",
				establishedYear: initialData.establishedYear ?? new Date().getFullYear(),
				governingBodyType: initialData.governingBodyType || "",
				recognitionStatus: initialData.recognitionStatus || "",
				recognizedBy: initialData.recognizedBy || "",
				affiliationBoard: initialData.affiliationBoard || "",
				affiliationNo: initialData.affiliationNo || "",
				medium: (initialData.medium as any) || "bangla",
				educationLevel: initialData.educationLevel,
				shift: (initialData.shift as any) || "day",
				hasHostel: initialData.hasHostel,
				hasPermanentCampus: initialData.hasPermanentCampus,
				hostelCapacity: initialData.hostelCapacity ?? null,
				headTeacherTitle: initialData.headTeacherTitle || "",
				totalRooms: initialData.totalRooms ?? null,
				totalStudentCapacity: initialData.totalStudentCapacity ?? null,
				facebookPage: initialData.facebookPage || "",
				youtubeChannel: initialData.youtubeChannel || "",
				isCustomDomainEnabled: initialData.isCustomDomainEnabled,
				customDomain: initialData.customDomain || "",
				logoUrl: initialData.logoUrl || "",
				logoPlaceholder: initialData.logoPlaceholder || "",
				bannerUrl: initialData.bannerUrl || "",
				bannerPlaceholder: initialData.bannerPlaceholder || "",
			});
		}
	}, [initialData, form]);

	const handleFormSubmit = async (data: any) => {
		try {
			setIsUploading(true);
			const payload = { ...data };

			// Convert empty strings to null to prevent backend validation errors for optional URL fields
			Object.keys(payload).forEach((key) => {
				if (payload[key] === "") {
					payload[key] = null;
				}
			});

			if (payload.logoUrl instanceof File) {
				const compressed = await compressImage(payload.logoUrl);
				const res = await uploadImage(compressed, "school_logo");
				payload.logoUrl = res.url;
				payload.logoPlaceholder = res.placeholder;
			}

			if (payload.bannerUrl instanceof File) {
				const compressed = await compressImage(payload.bannerUrl);
				const res = await uploadImage(compressed, "school_banner");
				payload.bannerUrl = res.url;
				payload.bannerPlaceholder = res.placeholder;
			}

			await onSubmit(payload);
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
		<form onSubmit={form.handleSubmit(handleFormSubmit)} className="mx-auto max-w-7xl space-y-8">
			{/* ── Basic Identity ─────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.basicInfo.title")}</CardTitle>
					<CardDescription>{tForm("sections.basicInfo.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="schoolName"
						label="School Name"
						placeholder="Enter School Name"
						required
					/>
					<InputField
						control={form.control}
						name="schoolNameBn"
						label="School Name (Bengali)"
						placeholder="Enter School Name in Bengali"
					/>
					<InputField
						control={form.control}
						name="schoolType"
						label="School Type"
						type="select"
						placeholder="Select School Type"
						options={[
							{ label: "School", value: "school" },
							{ label: "Madrasa", value: "madrasa" },
							{ label: "College", value: "college" },
							{ label: "University College", value: "university_college" },
						]}
						required
					/>
					{!isEdit && (
						<InputField
							control={form.control}
							name="adminName"
							label="Admin User Name"
							placeholder="Enter Admin User Name"
							required
						/>
					)}
				</CardContent>
			</Card>

			{/* ── Location & Contact ─────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.locationContact.title")}</CardTitle>
					<CardDescription>
						{tForm("sections.locationContact.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Contact fields */}
					<InputField
						control={form.control}
						name="contactEmail"
						label="Contact Email"
						type="email"
						placeholder="e.g. school@example.com"
						required
					/>
					{/* contactPhone: string in DB, validate BD format */}
					<InputField
						control={form.control}
						name="contactPhone"
						label="Primary Phone"
						type="tel"
						placeholder="e.g. 01XXXXXXXXX"
						required
					/>
					{/* alternatePhone: string in DB, digits only, no format validation */}
					<InputField
						control={form.control}
						name="alternatePhone"
						label="Alternate Phone"
						type="tel"
						placeholder="e.g. 01XXXXXXXXX"
					/>

					{/* Cascading location selectors */}
					<LocationSelect
						control={form.control}
						divisionName="divisionId"
						districtName="districtId"
						upazilaName="upazilaId"
						divisionRequired
						districtRequired
					/>

					{/* postCode: String in DB. NumberInput restricts to digits, zod coerces to string. */}
					<InputField
						control={form.control}
						name="postCode"
						label="Post Code"
						type="number"
						placeholder="Enter Post Code"
					/>

					<div className="col-span-full">
						<InputField
							control={form.control}
							name="address"
							label="Full Address"
							type="textarea"
							placeholder="Enter Full Address"
						/>
					</div>

					<div className="col-span-full">
						<SchoolLocationMap control={form.control} setValue={form.setValue} />
					</div>

					<div className="col-span-full grid grid-cols-1 gap-6 md:grid-cols-2">
						<InputField
							control={form.control}
							name="latitude"
							label="Latitude"
							type="number"
							placeholder="e.g. 23.8103"
							min={-90}
							max={90}
							step="any"
						/>
						<InputField
							control={form.control}
							name="longitude"
							label="Longitude"
							type="number"
							placeholder="e.g. 90.4125"
							min={-180}
							max={180}
							step="any"
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Official Information ────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.officialInfo.title")}</CardTitle>
					<CardDescription>{tForm("sections.officialInfo.description")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="eiin"
						label="EIIN"
						placeholder="Enter EIIN"
					/>
					<InputField
						control={form.control}
						name="registrationNo"
						label="Registration Number"
						placeholder="Enter Registration Number"
					/>
					<InputField
						control={form.control}
						name="banbeis"
						label="BANBEIS Code"
						placeholder="Enter BANBEIS Code"
					/>
					<InputField
						control={form.control}
						name="establishedYear"
						label="Established Year"
						type="number"
						placeholder="e.g. 1990"
						min={1800}
						max={new Date().getFullYear()}
					/>
					<InputField
						control={form.control}
						name="governingBodyType"
						label="Governing Body Type"
						type="select"
						placeholder="Select Governing Body Type"
						options={[
							{
								label: "School Managing Committee (SMC)",
								value: "school_managing_committee",
							},
							{ label: "Board of Governors", value: "board_of_governors" },
							{ label: "Trust", value: "trust" },
							{ label: "Govt. Managed", value: "govt_managed" },
							{ label: "Ad-Hoc Committee", value: "ad_hoc_committee" },
							{ label: "Private Ownership", value: "private_ownership" },
						]}
					/>
					<InputField
						control={form.control}
						name="recognitionStatus"
						label="Recognition Status"
						type="select"
						placeholder="Select Recognition Status"
						options={[
							{ label: "Recognized", value: "recognized" },
							{ label: "Un-Recognized", value: "un-recognized" },
							{
								label: "Provisionally Recognized",
								value: "provisionally_recognized",
							},
						]}
					/>
					<InputField
						control={form.control}
						name="recognizedBy"
						label="Recognized By"
						type="select"
						placeholder="Select Recognized By"
						options={[
							{ label: "DPE", value: "DPE" },
							{ label: "DSHE", value: "DSHE" },
							{ label: "NCTB", value: "NCTB" },
							{ label: "University", value: "University" },
							{ label: "Madrasa Board", value: "Madrasa Board" },
							{ label: "Technical Board", value: "Technical Board" },
							{ label: "Ministry of Education", value: "Ministry of Education" },
						]}
					/>
					<InputField
						control={form.control}
						name="affiliationBoard"
						label="Affiliation Board"
						type="select"
						placeholder="Select Affiliation Board"
						options={[
							{ label: "Dhaka Board", value: "dhaka_board" },
							{ label: "Rajshahi Board", value: "rajshahi_board" },
							{ label: "Comilla Board", value: "comilla_board" },
							{ label: "Jessore Board", value: "jessore_board" },
							{ label: "Chittagong Board", value: "chittagong_board" },
							{ label: "Barisal Board", value: "barisal_board" },
							{ label: "Sylhet Board", value: "sylhet_board" },
							{ label: "Dinajpur Board", value: "dinajpur_board" },
							{ label: "Mymensingh Board", value: "mymensingh_board" },
							{ label: "Madrasah Board", value: "madrasah_board" },
							{ label: "Technical Board", value: "technical_board" },
							{ label: "NCTB", value: "nctb" },
							{ label: "IB", value: "ib" },
							{ label: "Cambridge", value: "cambridge" },
						]}
					/>
					<InputField
						control={form.control}
						name="affiliationNo"
						label="Affiliation Number"
						placeholder="Enter Affiliation Number"
					/>
					{/* mpoStatus – checkbox renders correctly now */}
					<div className="flex items-center gap-3">
						<InputField
							control={form.control}
							name="mpoStatus"
							label="MPO Status"
							type="switch"
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Academic Structure ─────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.academicStructure.title")}</CardTitle>
					<CardDescription>
						{tForm("sections.academicStructure.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="medium"
						label="Medium"
						type="select"
						placeholder="Select Medium"
						options={[
							{ label: "Bangla", value: "bangla" },
							{ label: "English", value: "english" },
							{ label: "Both", value: "both" },
						]}
					/>
					<InputField
						control={form.control}
						name="shift"
						label="Shift"
						type="select"
						placeholder="Select Shift"
						options={[
							{ label: "Day", value: "day" },
							{ label: "Morning", value: "morning" },
							{ label: "Both", value: "both" },
						]}
					/>
					<InputField
						control={form.control}
						name="headTeacherTitle"
						label="Head Teacher Title"
						placeholder="e.g. Principal"
					/>
					<InputField
						control={form.control}
						name="educationLevel"
						label="Education Levels"
						type="tags"
						placeholder="e.g. Primary, Secondary"
					/>

					<InputField
						control={form.control}
						name="totalRooms"
						label="Total Rooms"
						type="number"
						placeholder="Enter Total Rooms"
						min={0}
					/>
					<InputField
						control={form.control}
						name="totalStudentCapacity"
						label="Student Capacity"
						type="number"
						placeholder="Enter Student Capacity"
						min={0}
					/>
					<InputField
						control={form.control}
						name="hostelCapacity"
						label="Hostel Capacity"
						type="number"
						placeholder="Enter Hostel Capacity"
						min={0}
					/>

					{/* hasPermanentCampus and hasHostel as proper checkboxes in the grid */}
					<div className="flex items-center gap-3">
						<InputField
							control={form.control}
							name="hasPermanentCampus"
							label="Permanent Campus"
							type="switch"
						/>
					</div>
					<div className="flex items-center gap-3">
						<InputField
							control={form.control}
							name="hasHostel"
							label="Has Hostel"
							type="switch"
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Branding & Digital ─────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{tForm("sections.brandingDigital.title")}</CardTitle>
					<CardDescription>
						{tForm("sections.brandingDigital.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<InputField
						control={form.control}
						name="website"
						label="Website URL"
						type="url"
						placeholder="https://www.school.edu.bd"
					/>
					<InputField
						control={form.control}
						name="facebookPage"
						label="Facebook Page"
						type="url"
						placeholder="https://facebook.com/schoolpage"
					/>
					<InputField
						control={form.control}
						name="youtubeChannel"
						label="YouTube Channel"
						type="url"
						placeholder="https://youtube.com/@schoolchannel"
					/>
					<InputField
						control={form.control}
						name="customDomain"
						label="Custom Domain"
						placeholder="e.g. school.edu.bd"
					/>
					{/* isCustomDomainEnabled as proper checkbox in the grid */}
					<div className="flex items-center gap-3">
						<InputField
							control={form.control}
							name="isCustomDomainEnabled"
							label="Enable Custom Domain"
							type="switch"
						/>
					</div>
					<div className="col-span-full grid grid-cols-1 gap-6 md:grid-cols-2">
						<InputField
							control={form.control}
							name="logoUrl"
							label="School Logo"
							type="file"
							placeholderBase64={logoPlaceholder}
						/>
						<InputField
							control={form.control}
							name="bannerUrl"
							label="School Banner"
							type="file"
							placeholderBase64={bannerPlaceholder}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="bg-background/80 sticky bottom-4 z-10 flex items-center justify-end gap-4 rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button
					type="button"
					variant="outline"
					disabled={isSubmitting || isUploading}
					size="lg"
					onClick={onCancel}
				>
					{tCommon("cancel")}
				</Button>
				<Button type="submit" disabled={isSubmitting || isUploading} size="lg" className="min-w-[150px]">
					{isSubmitting || isUploading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />{" "}
							{isUploading ? tForm("uploadingImages") : tForm("saving")}
						</>
					) : (
						<>
							<Save className="h-4 w-4" />{" "}
							{isEdit ? tForm("updateSchool") : tForm("createSchool")}
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
