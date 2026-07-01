export type TeacherModel = {
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
  departmentId?: string;
  isHeadOfInstitution: boolean;
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

  ntrcaRegistered: boolean;
  ntrcaRegNo?: string;
  ntrcaRegYear?: number;
  ntrcaCertificateUrl?: string;
  ntrcaCertificateMediaId?: string;
  ntrcaSubject?: string;

  banbeisTeacherId?: string;

  highestQualification?: string;
  qualificationDetails?: any;
  professionalQualifications?: any;

  primarySubjectId?: string;
  specializationSubjects?: any;

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

  isHafiz?: boolean;
  qiratGrade?: string;
  joiningSessionId?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
  
  designation?: {
    id: string;
    name: string;
  };
  department?: {
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
  primarySubject?: {
    id: string;
    enName?: string;
    bnName?: string;
    code?: string;
  };
  specializationSubjectItems?: Array<{
    id: string;
    enName?: string;
    bnName?: string;
    code?: string;
  }>;
};

export type ShortTeacherModel = {
  id: string;
  fullName: string;
  employeeCode: string;
  designation?: {
    name: string;
  };
};
