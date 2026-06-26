"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { SchoolSubscriptionModel } from "../../models/school-subscription.model";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

type Props = {
	subscription: SchoolSubscriptionModel;
};

const formatDate = (value?: string | null) => (value ? format(new Date(value), "PPP") : "N/A");
const formatValue = (value: number | string | null | undefined) => value ?? "N/A";

export function SchoolSubscriptionDetails({ subscription }: Props) {
	const t = useTranslations("SchoolsManagementSchoolSubscriptions");

	return (
		<div className="grid gap-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("detailsTitle")}</CardTitle>
					<CardDescription>{t("detailsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">School</div>
						<div className="font-medium">{subscription.school?.schoolName || "N/A"}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Plan</div>
						<div className="font-medium">{subscription.plan?.name || "N/A"}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Status</div>
						<Badge className="capitalize">{subscription.status}</Badge>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Billing Cycle</div>
						<div className="font-medium capitalize">
							{subscription.billingCycle.replace(/_/g, " ")}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionPeriodTitle")}</CardTitle>
					<CardDescription>{t("sectionPeriodDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
					<div>
						<div className="text-muted-foreground text-sm">Starts At</div>
						<div className="font-medium">{formatDate(subscription.startsAt)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Expires At</div>
						<div className="font-medium">{formatDate(subscription.expiresAt)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Trial Ends At</div>
						<div className="font-medium">{formatDate(subscription.trialEndsAt)}</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionPricingTitle")}</CardTitle>
					<CardDescription>{t("sectionPricingDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-4">
					<div>
						<div className="text-muted-foreground text-sm">Price (BDT)</div>
						<div className="font-medium">BDT {subscription.priceBdt.toLocaleString()}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Setup Fee (BDT)</div>
						<div className="font-medium">BDT {subscription.setupFeeBdt.toLocaleString()}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Discount Percent</div>
						<div className="font-medium">{subscription.discountPct}%</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Grace Period Days</div>
						<div className="font-medium">{subscription.gracePeriodDays}</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionLimitsTitle")}</CardTitle>
					<CardDescription>{t("sectionLimitsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-4">
					{([
						["Max Students", subscription.maxStudents],
						["Max Teachers", subscription.maxTeachers],
						["Max Staff", subscription.maxStaff],
						["Max Classes", subscription.maxClasses],
						["Max Subjects", subscription.maxSubjects],
						["Max Branches", subscription.maxBranches],
						["Storage (GB)", subscription.storageGb],
						["Free Student Limit", subscription.freeStudentLimit],
					] as Array<[string, number | null]>).map(([label, value]) => (
						<div key={label}>
							<div className="text-muted-foreground text-sm">{label}</div>
							<div className="font-medium">{formatValue(value)}</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
