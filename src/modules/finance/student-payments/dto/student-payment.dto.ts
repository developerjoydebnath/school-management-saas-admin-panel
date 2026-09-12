export type StudentPaymentListItem = {
	id: string;
	paymentNo: string;
	studentName: string;
	studentCode?: string | null;
	contact?: string | null;
	className?: string | null;
	sectionName?: string | null;
	purpose: string;
	billingPeriod?: string | null;
	source: string;
	paymentMethod?: string | null;
	paymentStatus: string;
	paidAmount: number;
	requiredAmount: number;
	dueAmount: number;
	discountAmount: number;
	paidAt?: string | null;
	createdAt: string;
	transactionId?: string | null;
};

export type StudentPaymentDetails = StudentPaymentListItem & {
	originalAmount: number;
	discountApplied: boolean;
	discountType?: string | null;
	discountScope?: string | null;
	discountValue?: number | string | null;
	discountSource?: string | null;
	discountReason?: string | null;
	paymentGateway?: string | null;
	gatewayProvider?: string | null;
	paymentId?: string | null;
	receiptNo?: string | null;
	notes?: string | null;
	createdByName?: string | null;
	updatedByName?: string | null;
	admissionApplication?: {
		id: string;
		applicationNo: string;
		studentNameEn: string;
		fatherName?: string | null;
		fatherMobile?: string | null;
		paymentStatus?: string | null;
		source?: string | null;
	} | null;
	student?: {
		id: string;
		studentIdNo: string;
		fullNameEn: string;
		fatherName?: string | null;
		fatherMobile?: string | null;
		rollNumber?: string | null;
	} | null;
};

export type StudentPaymentSummary = {
	month: string;
	byPurpose: {
		purpose: string;
		total: number;
		count: number;
	}[];
	totalCollected: number;
	totalCount: number;
};

export const PAYMENT_PURPOSE_OPTIONS = [
	{ value: "admission_fee", label: "Admission Fee" },
	{ value: "tuition_fee", label: "Tuition Fee" },
	{ value: "exam_fee", label: "Exam Fee" },
	{ value: "transport_fee", label: "Transport Fee" },
	{ value: "library_fee", label: "Library Fee" },
	{ value: "hostel_fee", label: "Hostel Fee" },
	{ value: "other", label: "Other" },
];

// Session/class/section are deliberately absent -- the selected student
// already has this on file, the backend derives it from Student.currentSessionId/
// classId/sectionId rather than trusting the client.
export type CreateStudentPaymentPayload = {
	studentId: string;
	purpose: string;
	billingPeriod?: string;
	paymentMethod: string;
	amount: number;
	requiredAmount?: number;
	paidAt?: string;
	transactionId?: string;
	notes?: string;
};

export type UpdateStudentPaymentPayload = Partial<
	Omit<CreateStudentPaymentPayload, "studentId">
>;
