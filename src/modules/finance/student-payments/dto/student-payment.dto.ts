export type StudentPaymentListItem = {
	id: string;
	paymentNo: string;
	studentName: string;
	studentCode?: string | null;
	contact?: string | null;
	className?: string | null;
	sectionName?: string | null;
	purpose: string;
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
