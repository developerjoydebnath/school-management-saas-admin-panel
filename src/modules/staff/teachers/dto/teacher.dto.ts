import { z } from 'zod';
import { TeacherModel } from '../models/teacher.model';

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.number().optional().nullable()
);

export const teacherSchema = z.object({
  employeeCode: z.string().optional(),
  fullName: z.string().min(1, { message: 'Full name is required' }),
  fullNameBn: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }),
  gender: z.string().min(1, { message: 'Gender is required' }),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  
  photoMediaId: z.any().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  photoPlaceholder: z.string().optional().nullable(),

  nid: z.string().optional(),
  birthCertificateNo: z.string().optional(),
  passportNo: z.string().optional(),

  phone: z.string().min(1, { message: 'Phone is required' }).regex(/^(?:\+88|88)?01[3-9]\d{8}$/, { message: 'Invalid Bangladeshi phone number' }),
  alternatePhone: z.string().optional(),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email' }),

  divisionId: optionalNumber,
  districtId: optionalNumber,
  upazilaId: optionalNumber,
  postCode: z.string().optional(),
  address: z.string().optional(),
  permanentAddress: z.string().optional(),
  latitude: optionalNumber,
  longitude: optionalNumber,

  designationId: z.string().min(1, { message: 'Designation is required' }),
  departmentId: z.string().optional().nullable(),
  isHeadOfInstitution: z.boolean().optional(),
  employmentType: z.string().optional(),
  status: z.string().optional(),

  joiningDate: z.string().min(1, { message: 'Joining date is required' }),
  confirmationDate: z.string().optional().nullable(),
  resignationDate: z.string().optional().nullable(),
  retirementDate: z.string().optional().nullable(),
  exitReason: z.string().optional().nullable(),

  isMpoListed: z.boolean().optional(),
  mpoIndexNo: z.string().optional(),
  mpoIncludedAt: z.string().optional().nullable(),
  mpoCategory: z.string().optional(),

  ntrcaRegistered: z.boolean().optional(),
  ntrcaRegNo: z.string().optional(),
  ntrcaRegYear: optionalNumber,
  ntrcaCertificateMediaId: z.any().optional().nullable(),
  ntrcaCertificateUrl: z.string().optional().nullable(),
  ntrcaSubject: z.string().optional(),

  banbeisTeacherId: z.string().optional(),

  highestQualification: z.string().optional(),
  qualificationDetails: z.any().optional(),
  professionalQualifications: z.any().optional(),

  primarySubjectId: z.string().optional().nullable(),
  specializationSubjects: z.any().optional(),

  salaryGrade: z.string().optional(),
  basicSalary: optionalNumber,
  bankAccountNo: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  mobileWalletNo: z.string().optional(),
  mobileWalletType: z.string().optional(),

  globalPersonId: z.string().optional().nullable(),
  transferredFrom: z.string().optional().nullable(),
  transferredTo: z.string().optional().nullable(),
  transferDate: z.string().optional().nullable(),
  yearsOfExperience: optionalNumber,
  previousInstitution: z.string().optional(),

  documents: z.any().optional(),

  isHafiz: z.boolean().optional().nullable(),
  qiratGrade: z.string().optional(),
  joiningSessionId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export type TeacherDto = Omit<
  TeacherModel,
  'id' | 'createdAt' | 'updatedAt' | 'designation' | 'department' | 'photoUrl' | 'ntrcaCertificateUrl'
>;
