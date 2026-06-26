import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

export enum bankAccountPurposeEnum {
	SALARY = "salary",
	FEES = "fees",
	DEVELOPMENT = "development",
	GRANT = "grant",
	GENERAL = "general",
}

export enum mobileBankingProviderEnum {
	BKASH = "bKash",
	NAGAD = "Nagad",
	ROCKET = "Rocket",
}

export const bankAccountSchema = z.object({
	schoolId: z.string().min(1, "School is required").optional(),
	accountLabel: z.string().min(1, "Account label is required"),
	accountPurpose: z.enum(bankAccountPurposeEnum),
	isPrimary: z.boolean().default(false),
	bankName: z.string().min(1, "Bank name is required"),
	bankBranch: optionalString,
	bankRoutingNo: optionalString,
	accountNo: z.string().min(1, "Account number is required"),
	accountName: z.string().min(1, "Account name is required"),
	mobileBankingProvider: z.preprocess(
		emptyToUndefined,
		z.enum(mobileBankingProviderEnum).optional()
	),
	mobileBankingNo: optionalString,
	isActive: z.boolean().default(true),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
