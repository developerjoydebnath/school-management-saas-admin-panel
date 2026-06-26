import { z } from 'zod';

const currentYear = new Date().getFullYear();

// BD phone number regex: +880, 880, 0, or nothing before 1[3-9]XXXXXXXX
const bdPhoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;

const schoolTypeEnum = z.enum([
  'school',
  'madrasa',
  'college',
  'university_college',
]);

const mediumEnum = z.enum(['bangla', 'english', 'both']);
const shiftEnum = z.enum(['day', 'morning', 'both']);
const emptyToNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : value;

// URL that allows empty string (optional URL fields)
const optionalUrl = z
  .string()
  .max(500)
  .refine(
    (val) => val === '' || /^https?:\/\/.+/.test(val),
    { message: 'Must be a valid URL starting with http:// or https://' }
  )
  .nullable()
  .optional();

// Domain name validation (e.g. school.edu.bd)
const optionalDomain = z
  .string()
  .max(255)
  .refine(
    (val) =>
      val === '' ||
      /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(val),
    { message: 'Must be a valid domain name (e.g. school.edu.bd)' }
  )
  .nullable()
  .optional();

const fileOrString = z
  .any()
  .refine(
    (val) =>
      val === undefined ||
      val === null ||
      val === '' ||
      typeof val === 'string' ||
      (typeof File !== 'undefined' && val instanceof File),
    {
      message: 'Must be a valid file or image URL',
    }
  )
  .nullable()
  .optional();

const baseSchoolSchema = z.object({
  schoolName: z
    .string()
    .min(1, 'School name is required')
    .max(255, 'Max length 255'),
  schoolType: schoolTypeEnum,
  schoolNameBn: z.string().max(255).nullable().optional(),

  divisionId: z.coerce.number().min(1, 'Division is required'),
  districtId: z.coerce.number().min(1, 'District is required'),
  upazilaId: z.coerce.number().nullable().optional(),
  // postCode is String in DB, coerce number input → string
  postCode: z
    .union([z.string(), z.number()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : String(v)))
    .nullable()
    .optional(),
  address: z.string().nullable().optional(),
  latitude: z
    .preprocess(emptyToNull, z.coerce.number().min(-90).max(90).nullable().optional()),
  longitude: z
    .preprocess(emptyToNull, z.coerce.number().min(-180).max(180).nullable().optional()),

  contactEmail: z
    .string()
    .min(1, 'Contact email is required')
    .email('Invalid email address')
    .max(255),

  // contactPhone is String in DB. Validate as BD phone number.
  contactPhone: z
    .string()
    .min(1, 'Contact phone is required')
    .regex(bdPhoneRegex, 'Enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX)')
    .max(20),

  // alternatePhone is String in DB. Digits only, no format validation needed.
  alternatePhone: z
    .string()
    .max(20)
    .refine((val) => val === '' || /^\d+$/.test(val), {
      message: 'Alternate phone must contain digits only',
    })
    .nullable()
    .optional(),

  website: optionalUrl,

  eiin: z.string().max(20).nullable().optional(),
  registrationNo: z.string().max(100).nullable().optional(),
  mpoStatus: z.boolean().default(false),
  banbeis: z.string().max(30).nullable().optional(),
  establishedYear: z.coerce
    .number()
    .int('Established year must be a whole number')
    .min(1800, 'Year must be 1800 or later')
    .max(currentYear, `Year cannot exceed ${currentYear}`)
    .nullable()
    .optional(),

  governingBodyType: z.string().max(50).nullable().optional(),
  recognitionStatus: z.string().max(30).nullable().optional(),
  recognizedBy: z.string().max(100).nullable().optional(),
  affiliationBoard: z.string().max(100).nullable().optional(),
  affiliationNo: z.string().max(100).nullable().optional(),

  medium: mediumEnum.nullable().optional(),
  educationLevel: z.array(z.string()).nullable().optional(),
  shift: shiftEnum.nullable().optional(),
  hasHostel: z.boolean().default(false),
  hasPermanentCampus: z.boolean().default(false),
  hostelCapacity: z.coerce.number().nullable().optional(),

  headTeacherTitle: z.string().max(50).nullable().optional(),

  totalRooms: z.coerce.number().nullable().optional(),
  totalStudentCapacity: z.coerce.number().nullable().optional(),

  facebookPage: optionalUrl,
  youtubeChannel: optionalUrl,

  isCustomDomainEnabled: z.boolean().default(false),
  customDomain: optionalDomain,

  logoUrl: fileOrString,
  logoPlaceholder: z.string().nullable().optional(),
  bannerUrl: fileOrString,
  bannerPlaceholder: z.string().nullable().optional(),
});

export const createSchoolSchema = baseSchoolSchema.extend({
  adminName: z.string().min(1, 'Admin name is required').max(255),
});

export type CreateSchoolDto = z.infer<typeof createSchoolSchema>;

export const updateSchoolSchema = baseSchoolSchema.partial();

export type UpdateSchoolDto = z.infer<typeof updateSchoolSchema>;
