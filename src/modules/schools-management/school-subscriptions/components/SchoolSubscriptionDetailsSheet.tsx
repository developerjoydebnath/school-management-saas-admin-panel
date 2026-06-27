"use client";

import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useSchoolSubscription } from "../../hooks/use-school-subscriptions";

type Props = {
	id: string;
	open: boolean;
};

const formatDate = (value?: string | null) => (value ? format(new Date(value), "PPP") : "N/A");
const formatValue = (value?: string | number | null) => value ?? "N/A";

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function SchoolSubscriptionDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 4 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function SchoolSubscriptionDetailsSheet({ id, open }: Props) {
	const t = useTranslations("SchoolsManagementSchoolSubscriptions");
	const { data: subscription, isLoading } = useSchoolSubscription(open ? id : null);

	const content = (() => {
		if (isLoading || !subscription) {
			return <SchoolSubscriptionDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionAssignmentTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair
							label="School"
							value={subscription.school?.schoolName || "N/A"}
						/>
						<CompactPair label="Plan" value={subscription.plan?.name || "N/A"} />
						<CompactPair
							label="Status"
							value={<Badge className="capitalize">{subscription.status}</Badge>}
						/>
						<CompactPair
							label="Billing Cycle"
							value={
								<span className="capitalize">
									{subscription.billingCycle.replace(/_/g, " ")}
								</span>
							}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionPeriodTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Starts At" value={formatDate(subscription.startsAt)} />
						<CompactPair
							label="Expires At"
							value={formatDate(subscription.expiresAt)}
						/>
						<CompactPair
							label="Trial Ends At"
							value={formatDate(subscription.trialEndsAt)}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionPricingTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair
							label="Price (BDT)"
							value={`BDT ${subscription.priceBdt.toLocaleString()}`}
						/>
						<CompactPair
							label="Setup Fee (BDT)"
							value={`BDT ${subscription.setupFeeBdt.toLocaleString()}`}
						/>
						<CompactPair
							label="Discount Percent"
							value={`${subscription.discountPct}%`}
						/>
						<CompactPair
							label="Grace Period Days"
							value={subscription.gracePeriodDays}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionLimitsTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair
							label="Max Students"
							value={formatValue(subscription.maxStudents)}
						/>
						<CompactPair
							label="Max Teachers"
							value={formatValue(subscription.maxTeachers)}
						/>
						<CompactPair label="Max Staff" value={formatValue(subscription.maxStaff)} />
						<CompactPair
							label="Max Classes"
							value={formatValue(subscription.maxClasses)}
						/>
						<CompactPair
							label="Max Subjects"
							value={formatValue(subscription.maxSubjects)}
						/>
						<CompactPair
							label="Max Branches"
							value={formatValue(subscription.maxBranches)}
						/>
						<CompactPair
							label="Storage (GB)"
							value={formatValue(subscription.storageGb)}
						/>
						<CompactPair
							label="Free Student Limit"
							value={formatValue(subscription.freeStudentLimit)}
						/>
					</div>
				</div>

				{subscription.notes && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">{t("sectionNotesTitle")}</h3>
						<div className="text-muted-foreground text-sm">{subscription.notes}</div>
					</div>
				)}
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
