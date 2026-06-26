"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	BankAccountFormValues,
	bankAccountSchema,
} from "../dto/bank-account.dto";
import {
	createBankAccount,
	updateBankAccount,
} from "../hooks/use-bank-account-mutations";

const PURPOSE_OPTIONS = [
	{ label: "Salary", value: "salary" },
	{ label: "Fees", value: "fees" },
	{ label: "Development", value: "development" },
	{ label: "Grant", value: "grant" },
	{ label: "General", value: "general" },
];

const MOBILE_BANKING_OPTIONS = [
	{ label: "bKash", value: "bKash" },
	{ label: "Nagad", value: "Nagad" },
	{ label: "Rocket", value: "Rocket" },
];

type Props = {
	id?: string;
	defaultValues: BankAccountFormValues;
	isEdit?: boolean;
};

export function BankAccountForm({ id, defaultValues, isEdit = false }: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const t = useTranslations("SchoolsManagementBankAccounts");

	const form = useForm<BankAccountFormValues>({
		resolver: zodResolver(bankAccountSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: BankAccountFormValues) => {
		if (!isEdit && !data.schoolId) {
			form.setError("schoolId", { type: "manual", message: "School is required" });
			return;
		}

		setIsSubmitting(true);
		try {
			if (isEdit && id) {
				await updateBankAccount(id, data);
				toast.success(t("updateSuccess"));
			} else {
				await createBankAccount(data);
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.ROOT);
		} catch (error: any) {
			const errors = error?.response?.data?.errors;
			if (Array.isArray(errors)) {
				errors.forEach((err: any) => {
					if (err.field && err.message) {
						form.setError(err.field as any, {
							type: "server",
							message: err.message,
						});
					}
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionAssignmentTitle")}</CardTitle>
					<CardDescription>{t("sectionAssignmentDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					{!isEdit && (
						<InputField
							control={form.control}
							name="schoolId"
							label="School"
							type="schoolSelect"
							placeholder="Select school"
							required
						/>
					)}
					<InputField
						control={form.control}
						name="accountLabel"
						label="Account Label"
						type="text"
						placeholder="Student Fee Account"
						required
					/>
					<InputField
						control={form.control}
						name="accountPurpose"
						label="Account Purpose"
						type="select"
						options={PURPOSE_OPTIONS}
						required
					/>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionBankTitle")}</CardTitle>
					<CardDescription>{t("sectionBankDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="bankName"
						label="Bank Name"
						type="text"
						placeholder="Bank name"
						required
					/>
					<InputField
						control={form.control}
						name="bankBranch"
						label="Bank Branch"
						type="text"
						placeholder="Branch name"
					/>
					<InputField
						control={form.control}
						name="bankRoutingNo"
						label="Bank Routing No"
						type="text"
						placeholder="Routing number"
					/>
					<InputField
						control={form.control}
						name="accountNo"
						label="Account No"
						type="text"
						placeholder="Account number"
						required
					/>
					<div className="@2xl/page:col-span-2">
						<InputField
							control={form.control}
							name="accountName"
							label="Account Name"
							type="text"
							placeholder="Account holder name"
							required
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionMobileTitle")}</CardTitle>
					<CardDescription>{t("sectionMobileDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="mobileBankingProvider"
						label="Mobile Banking Provider"
						type="select"
						placeholder="Select provider"
						options={MOBILE_BANKING_OPTIONS}
					/>
					<InputField
						control={form.control}
						name="mobileBankingNo"
						label="Mobile Banking No"
						type="text"
						placeholder="Merchant or personal number"
					/>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionStatusTitle")}</CardTitle>
					<CardDescription>{t("sectionStatusDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="isPrimary"
						label="Primary Account"
						type="switch"
					/>
					<InputField
						control={form.control}
						name="isActive"
						label="Active"
						type="switch"
					/>
				</CardContent>
			</Card>

			<div className="bg-background/80 sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					{t("cancel")}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? t("saving")
						: isEdit
							? t("updateAccount")
							: t("createAccount")}
				</Button>
			</div>
		</form>
	);
}
