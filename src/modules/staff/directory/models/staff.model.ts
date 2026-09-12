export type StaffModel = {
	id: string;
	employeeCode: string;
	fullName: string;
	fullNameBn?: string;
	fatherName?: string;
	motherName?: string;
	dateOfBirth: string;
	gender: string;
	bloodGroup?: string;
	religion?: string;
	nationality?: string;
	maritalStatus?: string;

	photoUrl?: string;
	photoPlaceholder?: string;
	photoMediaId?: string;

	nid?: string;
	birthCertificateNo?: string;
	passportNo?: string;

	phone: string;
	alternatePhone?: string;
	email?: string;

	divisionId?: number;
	districtId?: number;
	upazilaId?: number;
	postCode?: string;
	address?: string;
	permanentAddress?: string;
	latitude?: number;
	longitude?: number;

	designationId: string;
	employmentType: string;
	status: string;

	joiningDate: string;
	confirmationDate?: string;
	resignationDate?: string;
	retirementDate?: string;
	exitReason?: string;

	isMpoListed: boolean;
	mpoIndexNo?: string;
	mpoIncludedAt?: string;
	mpoCategory?: string;

	highestQualification?: string;
	qualificationDetails?: any;

	salaryGrade?: string;
	basicSalary?: number;
	bankAccountNo?: string;
	bankName?: string;
	bankBranch?: string;
	mobileWalletNo?: string;
	mobileWalletType?: string;

	globalPersonId?: string;
	transferredFrom?: string;
	transferredTo?: string;
	transferDate?: string;
	previousInstitution?: string;
	yearsOfExperience?: number;

	documents?: any;

	joiningSessionId?: string;
	notes?: string;

	createdAt: string;
	updatedAt: string;

	designation?: {
		id: string;
		name: string;
	};
	division?: {
		id: number;
		enName?: string;
		bnName?: string;
	};
	district?: {
		id: number;
		enName?: string;
		bnName?: string;
	};
	upazila?: {
		id: number;
		enName?: string;
		bnName?: string;
	};
};
