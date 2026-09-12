"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { formatMoney } from "../../shared/dto/library.dto";
import { useLibrarySettings } from "../../shared/hooks/use-library";

/**
 * The rulebook, read-only.
 *
 * Settings that quietly change how every other screen behaves should be easy to
 * READ and deliberate to change — so this page states the current rules and the
 * form is one click away, rather than presenting thirty live inputs to someone
 * who only came to check what the fine rate is.
 */
export default function LibrarySettingsView() {
	const t = useTranslations("LibrarySettings");
	const { settings, isLoading } = useLibrarySettings();

	if (isLoading || !settings) {
		return (
			<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-56 rounded-md" />
				))}
			</div>
		);
	}

	const pad = (value: number) => String(value).padStart(settings.accessionPadding, "0");
	const nextNumber = `${settings.accessionPrefix || ""}${pad(settings.nextAccessionNo)}`;

	const borrowers = [
		{
			label: t("studentLoanLimit").split("—")[0].trim(),
			limit: settings.studentLoanLimit,
			days: settings.studentLoanDays,
		},
		{
			label: t("teacherLoanLimit").split("—")[0].trim(),
			limit: settings.teacherLoanLimit,
			days: settings.teacherLoanDays,
		},
		{
			label: t("staffLoanLimit").split("—")[0].trim(),
			limit: settings.staffLoanLimit,
			days: settings.staffLoanDays,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="text-base">{t("accessionTitle")}</CardTitle>
					<CardDescription>{t("accessionDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Row label={t("accessionPrefix")} value={settings.accessionPrefix || "—"} />
					<Row label={t("accessionPadding")} value={settings.accessionPadding} />
					{/* The number itself, not its parts — that is what a librarian is
					    actually checking before a delivery goes into the register. */}
					<div className="bg-muted/40 flex items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2.5">
						<span className="text-muted-foreground text-sm">
							{t("nextAccessionPreview")}
						</span>
						<span className="font-mono text-base font-semibold">{nextNumber}</span>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="text-base">{t("loanRulesTitle")}</CardTitle>
					<CardDescription>{t("loanRulesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{borrowers.map((row) => (
						<div
							key={row.label}
							className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0"
						>
							<span className="text-sm font-medium">{row.label}</span>
							<span className="text-muted-foreground text-sm">
								{t("booksCount", { count: row.limit })} ·{" "}
								{t("days", { count: row.days })}
							</span>
						</div>
					))}
					<Row
						label={t("maxRenewals")}
						value={settings.maxRenewals}
					/>
					<Row
						label={t("renewalDays")}
						value={
							settings.renewalDays
								? t("days", { count: settings.renewalDays })
								: t("notSet")
						}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="text-base">{t("fineRulesTitle")}</CardTitle>
					<CardDescription>{t("fineRulesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Row label={t("finePerDay")} value={formatMoney(settings.finePerDay)} />
					<Row
						label={t("fineGraceDays")}
						value={t("days", { count: settings.fineGraceDays })}
					/>
					<Row
						label={t("maxFinePerLoan")}
						value={
							settings.maxFinePerLoan === null
								? t("noCap")
								: formatMoney(settings.maxFinePerLoan)
						}
					/>
					<Row
						label={t("lostBookMultiplier")}
						value={`× ${settings.lostBookMultiplier}`}
					/>
					<Row
						label={t("fineBlockThreshold")}
						value={
							Number(settings.fineBlockThreshold) > 0
								? formatMoney(settings.fineBlockThreshold)
								: t("warnOnly")
						}
					/>
					{/* The setting schools most often get wrong, so it is stated as a
					    sentence rather than as a bare on/off. */}
					<Badge
						variant="outline"
						className={cn(
							"font-normal",
							settings.countClosedDaysInFine
								? "border-amber-300 text-amber-700 dark:text-amber-400"
								: "border-emerald-300 text-emerald-700 dark:text-emerald-400",
						)}
					>
						{settings.countClosedDaysInFine
							? t("closedDaysCharged")
							: t("closedDaysNotCharged")}
					</Badge>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="text-base">{t("notificationsTitle")}</CardTitle>
					<CardDescription>{t("notificationsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2.5">
					<p className="text-sm">
						{settings.notifyOnIssue ? t("issueMailOn") : t("issueMailOff")}
					</p>
					<p className="text-sm">
						{settings.dueReminderEnabled
							? t("reminderSummary", {
									days: settings.dueReminderDaysBefore,
									hour: String(settings.dueReminderHour).padStart(2, "0"),
								})
							: t("reminderOff")}
					</p>
					<p className="text-sm">
						{settings.notifyGuardians
							? t("guardiansCopied")
							: t("guardiansNotCopied")}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="text-sm font-medium tabular-nums">{value}</span>
		</div>
	);
}
