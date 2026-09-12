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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	updateLibrarySettings,
	useLibrarySettings,
} from "../../shared/hooks/use-library";

const settingsSchema = z.object({
	accessionPrefix: z.string().max(10).optional().nullable(),
	accessionPadding: z.coerce.number().int().min(1).max(12),
	nextAccessionNo: z.coerce.number().int().min(1),

	studentLoanLimit: z.coerce.number().int().min(0).max(50),
	studentLoanDays: z.coerce.number().int().min(1).max(365),
	teacherLoanLimit: z.coerce.number().int().min(0).max(50),
	teacherLoanDays: z.coerce.number().int().min(1).max(365),
	staffLoanLimit: z.coerce.number().int().min(0).max(50),
	staffLoanDays: z.coerce.number().int().min(1).max(365),
	maxRenewals: z.coerce.number().int().min(0).max(20),
	renewalDays: z.preprocess(
		(value) => (value === "" || value === null ? undefined : Number(value)),
		z.number().int().min(1).max(365).optional(),
	),

	finePerDay: z.coerce.number().min(0),
	fineGraceDays: z.coerce.number().int().min(0).max(90),
	maxFinePerLoan: z.preprocess(
		(value) => (value === "" || value === null ? undefined : Number(value)),
		z.number().min(0).optional(),
	),
	countClosedDaysInFine: z.boolean().default(false),
	lostBookMultiplier: z.coerce.number().min(0).max(99),
	fineBlockThreshold: z.coerce.number().min(0),

	notifyOnIssue: z.boolean().default(false),
	dueReminderEnabled: z.boolean().default(true),
	dueReminderDaysBefore: z.coerce.number().int().min(0).max(30),
	dueReminderHour: z.coerce.number().int().min(0).max(23),
	notifyGuardians: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

/**
 * The library's rulebook.
 *
 * Everything here is a policy a Bangladeshi school actually varies: how many
 * books a class 6 pupil may take, how many a teacher may, what a day's delay
 * costs, and — the one people get wrong — whether a vacation day is charged at
 * all. It is deliberately the first screen to build, because every other
 * screen's behaviour is decided here.
 */
export default function LibrarySettingsForm() {
	const router = useRouter();
	const t = useTranslations("LibrarySettings");
	const ft = useTranslations("Forms");
	const { settings, isLoading } = useLibrarySettings();

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsSchema as any),
		shouldFocusError: false,
		defaultValues: {
			accessionPrefix: "",
			accessionPadding: 5,
			nextAccessionNo: 1,
			studentLoanLimit: 1,
			studentLoanDays: 14,
			teacherLoanLimit: 3,
			teacherLoanDays: 30,
			staffLoanLimit: 2,
			staffLoanDays: 21,
			maxRenewals: 1,
			renewalDays: undefined,
			finePerDay: 2,
			fineGraceDays: 0,
			maxFinePerLoan: undefined,
			countClosedDaysInFine: false,
			lostBookMultiplier: 1.5,
			fineBlockThreshold: 0,
			notifyOnIssue: false,
			dueReminderEnabled: true,
			dueReminderDaysBefore: 1,
			dueReminderHour: 18,
			notifyGuardians: true,
		},
	});

	const { reset } = form;
	useEffect(() => {
		if (!settings) return;
		reset({
			accessionPrefix: settings.accessionPrefix ?? "",
			accessionPadding: settings.accessionPadding,
			nextAccessionNo: settings.nextAccessionNo,
			studentLoanLimit: settings.studentLoanLimit,
			studentLoanDays: settings.studentLoanDays,
			teacherLoanLimit: settings.teacherLoanLimit,
			teacherLoanDays: settings.teacherLoanDays,
			staffLoanLimit: settings.staffLoanLimit,
			staffLoanDays: settings.staffLoanDays,
			maxRenewals: settings.maxRenewals,
			renewalDays: settings.renewalDays ?? undefined,
			finePerDay: settings.finePerDay,
			fineGraceDays: settings.fineGraceDays,
			maxFinePerLoan: settings.maxFinePerLoan ?? undefined,
			countClosedDaysInFine: settings.countClosedDaysInFine,
			lostBookMultiplier: settings.lostBookMultiplier,
			fineBlockThreshold: settings.fineBlockThreshold,
			notifyOnIssue: settings.notifyOnIssue,
			dueReminderEnabled: settings.dueReminderEnabled,
			dueReminderDaysBefore: settings.dueReminderDaysBefore,
			dueReminderHour: settings.dueReminderHour,
			notifyGuardians: settings.notifyGuardians,
		});
	}, [settings, reset]);

	const onSubmit = async (data: SettingsFormValues) => {
		try {
			await updateLibrarySettings({
				...data,
				accessionPrefix: data.accessionPrefix || "",
			});
			toast.success(t("saveSuccess"));
			// Back to the read-only view: the rules are read far more often than
			// they are changed.
			router.push(PATHS.LIBRARY.SETTINGS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-4xl space-y-4">
				<Skeleton className="h-56 rounded-md" />
				<Skeleton className="h-72 rounded-md" />
			</div>
		);
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="mx-auto max-w-4xl space-y-6"
		>
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("accessionTitle")}</CardTitle>
					<CardDescription>{t("accessionDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="accessionPrefix"
						label={t("accessionPrefix")}
						type="text"
						placeholder="e.g. IS-"
						helperText={t("accessionPrefixHelper")}
					/>
					<InputField
						control={form.control}
						name="accessionPadding"
						label={t("accessionPadding")}
						type="number"
						min={1}
						helperText={t("accessionPaddingHelper")}
					/>
					{/* A school moving off a hardbound register continues from its own
					    last number. The API refuses to move this backwards over numbers
					    already issued — an accession number is never reused. */}
					<InputField
						control={form.control}
						name="nextAccessionNo"
						label={t("nextAccessionNo")}
						type="number"
						min={1}
						helperText={t("nextAccessionNoHelper")}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("loanRulesTitle")}</CardTitle>
					<CardDescription>{t("loanRulesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="studentLoanLimit"
						label={t("studentLoanLimit")}
						type="number"
						min={0}
					/>
					<InputField
						control={form.control}
						name="studentLoanDays"
						label={t("studentLoanDays")}
						type="number"
						min={1}
					/>
					<InputField
						control={form.control}
						name="teacherLoanLimit"
						label={t("teacherLoanLimit")}
						type="number"
						min={0}
					/>
					<InputField
						control={form.control}
						name="teacherLoanDays"
						label={t("teacherLoanDays")}
						type="number"
						min={1}
					/>
					<InputField
						control={form.control}
						name="staffLoanLimit"
						label={t("staffLoanLimit")}
						type="number"
						min={0}
					/>
					<InputField
						control={form.control}
						name="staffLoanDays"
						label={t("staffLoanDays")}
						type="number"
						min={1}
					/>
					<InputField
						control={form.control}
						name="maxRenewals"
						label={t("maxRenewals")}
						type="number"
						min={0}
					/>
					<InputField
						control={form.control}
						name="renewalDays"
						label={t("renewalDays")}
						type="number"
						min={1}
						helperText={t("renewalDaysHelper")}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("fineRulesTitle")}</CardTitle>
					<CardDescription>{t("fineRulesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="finePerDay"
						label={t("finePerDay")}
						type="number"
						step="0.01"
						min={0}
					/>
					<InputField
						control={form.control}
						name="fineGraceDays"
						label={t("fineGraceDays")}
						type="number"
						min={0}
						helperText={t("fineGraceDaysHelper")}
					/>
					<InputField
						control={form.control}
						name="maxFinePerLoan"
						label={t("maxFinePerLoan")}
						type="number"
						step="0.01"
						min={0}
						helperText={t("maxFinePerLoanHelper")}
					/>
					<InputField
						control={form.control}
						name="lostBookMultiplier"
						label={t("lostBookMultiplier")}
						type="number"
						step="0.1"
						min={0}
						helperText={t("lostBookMultiplierHelper")}
					/>
					<InputField
						control={form.control}
						name="fineBlockThreshold"
						label={t("fineBlockThreshold")}
						type="number"
						step="0.01"
						min={0}
						helperText={t("fineBlockThresholdHelper")}
					/>
					{/* The setting schools most often get wrong. Off means the library
					    does not charge for days it was shut — the holidays and weekly
					    off-days come from the Academic Calendar, so the two can never
					    disagree about a given Friday. */}
					<InputField
						control={form.control}
						name="countClosedDaysInFine"
						label={t("countClosedDays")}
						type="switch"
						helperText={t("countClosedDaysHelper")}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("notificationsTitle")}</CardTitle>
					<CardDescription>{t("notificationsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="notifyOnIssue"
						label={t("notifyOnIssue")}
						type="switch"
						helperText={t("notifyOnIssueHelper")}
					/>
					<InputField
						control={form.control}
						name="dueReminderEnabled"
						label={t("dueReminderEnabled")}
						type="switch"
						helperText={t("dueReminderEnabledHelper")}
					/>
					<InputField
						control={form.control}
						name="dueReminderDaysBefore"
						label={t("dueReminderDaysBefore")}
						type="number"
						min={0}
					/>
					<InputField
						control={form.control}
						name="dueReminderHour"
						label={t("dueReminderHour")}
						type="number"
						min={0}
						max={23}
						helperText={t("dueReminderHourHelper")}
					/>
					<InputField
						control={form.control}
						name="notifyGuardians"
						label={t("notifyGuardians")}
						type="switch"
						helperText={t("notifyGuardiansHelper")}
						fieldClass="col-span-full @3xl/page:col-span-1"
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.LIBRARY.SETTINGS.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? ft("saveLoading") : ft("save")}
				</Button>
			</div>
		</form>
	);
}
