export type AdmissionFieldCategory =
	| "student_info"
	| "parent_info"
	| "address"
	| "academic_info"
	| "documents"
	| "health_info"
	| "payment";

export interface AdmissionField {
	id: string;
	label: string;
	category: AdmissionFieldCategory;
	isStep1: boolean; // True if it's minimal critical data (Step 1)
	isFixed?: boolean; // True if it cannot be disabled
	isCustom?: boolean; // True if it's a field added by the user
	type: "text" | "date" | "select" | "file" | "number";
}

export const ADMISSION_FIELDS: AdmissionField[] = [
	// Step 1: Critical Fields
	{
		id: "fullName",
		label: "Student Full Name",
		category: "student_info",
		isStep1: true,
		isFixed: true,
		type: "text",
	},
	{
		id: "dob",
		label: "Date of Birth",
		category: "student_info",
		isStep1: true,
		isFixed: true,
		type: "date",
	},
	{
		id: "gender",
		label: "Gender",
		category: "student_info",
		isStep1: true,
		isFixed: true,
		type: "select",
	},
	{
		id: "class",
		label: "Applying for Class",
		category: "academic_info",
		isStep1: true,
		isFixed: true,
		type: "select",
	},
	{
		id: "section",
		label: "Section",
		category: "academic_info",
		isStep1: true,
		isFixed: true,
		type: "select",
	},
	{
		id: "session",
		label: "Session Year",
		category: "academic_info",
		isStep1: true,
		isFixed: true,
		type: "select",
	},
	{
		id: "fatherName",
		label: "Father's Name",
		category: "parent_info",
		isStep1: true,
		isFixed: true,
		type: "text",
	},
	{
		id: "mobile",
		label: "Mobile Number",
		category: "parent_info",
		isStep1: true,
		isFixed: true,
		type: "text",
	},
	{
		id: "admissionType",
		label: "Admission Type",
		category: "academic_info",
		isStep1: true,
		isFixed: true,
		type: "select",
	},
	{ id: "photo", label: "Photo", category: "documents", isStep1: false, type: "file" }, // Optional in Step 1 but listed
	{
		id: "birthCertificate",
		label: "Birth Certificate Scan",
		category: "documents",
		isStep1: true,
		type: "file",
	},
	{
		id: "birthRegistrationNo",
		label: "Birth Registration Number",
		category: "student_info",
		isStep1: true,
		type: "text",
	},
	{
		id: "admissionFee",
		label: "Admission Fee Payment",
		category: "payment",
		isStep1: true,
		type: "number",
	},

	// Step 2: Profile Fields
	{
		id: "motherName",
		label: "Mother's Name",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "guardianDetails",
		label: "Guardian Details",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "localGuardianName",
		label: "Local Guardian Name",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "localGuardianMobile",
		label: "Local Guardian Mobile",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "motherNid",
		label: "Mother's NID",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "fatherNid",
		label: "Father's NID",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "presentAddress",
		label: "Present Address",
		category: "address",
		isStep1: false,
		type: "text",
	},
	{
		id: "permanentAddress",
		label: "Permanent Address",
		category: "address",
		isStep1: false,
		type: "text",
	},
	{
		id: "bloodGroup",
		label: "Blood Group",
		category: "student_info",
		isStep1: false,
		type: "select",
	},
	{ id: "religion", label: "Religion", category: "student_info", isStep1: false, type: "select" },
	{ id: "quota", label: "Special Quota (e.g. Muktijoddha)", category: "student_info", isStep1: false, type: "select" },
	{
		id: "nationality",
		label: "Nationality",
		category: "student_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "emergencyContact",
		label: "Emergency Contact",
		category: "parent_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "previousSchool",
		label: "Previous School Records",
		category: "academic_info",
		isStep1: false,
		type: "text",
	},
	{ id: "tcNumber", label: "TC Number", category: "academic_info", isStep1: false, type: "text" },
	{
		id: "lastResult",
		label: "Last Result",
		category: "academic_info",
		isStep1: false,
		type: "text",
	},
	{
		id: "marksheet",
		label: "Marksheet Upload",
		category: "documents",
		isStep1: false,
		type: "file",
	},
	{ id: "tcScan", label: "TC Scan", category: "documents", isStep1: false, type: "file" },
	{ id: "allergies", label: "Allergies", category: "health_info", isStep1: false, type: "text" },
	{
		id: "conditions",
		label: "Medical Conditions",
		category: "health_info",
		isStep1: false,
		type: "text",
	},
];
