"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useSubscriptionPlan } from "../../hooks/use-subscription-plan";

type Props = {
	id: string;
	open: boolean;
};

const formatValue = (value?: string | number | null) => value ?? "-";

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function SubscriptionPlanDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			<div className="bg-muted/20 rounded-md border p-4">
				<Skeleton className="h-4 w-36" />
				<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
					{Array.from({ length: 10 }).map((_, itemIndex) => (
						<div key={itemIndex} className="space-y-2">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-4 w-32" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function SubscriptionPlanDetailsSheet({ id, open }: Props) {
	const t = useTranslations("SubscriptionPlansPage");
	const { data: plan, isLoading } = useSubscriptionPlan(open ? id : null);

	const content = (() => {
		if (isLoading || !plan) {
			return <SubscriptionPlanDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionBasicInfo")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Name" value={plan.name} />
						<CompactPair label="Tagline" value={plan.tagline} />
						<CompactPair label="Price" value={`BDT ${plan.price.toLocaleString()}`} />
						<CompactPair
							label="Setup Fee"
							value={`BDT ${plan.original.setupFeeBdt ? Number(plan.original.setupFeeBdt).toLocaleString() : 0}`}
						/>
						<CompactPair
							label="Billing Cycle"
							value={<span className="capitalize">{plan.billingCycle}</span>}
						/>
						<CompactPair
							label="Status"
							value={<span className="capitalize">{plan.status}</span>}
						/>
						<CompactPair label="Public" value={plan.isPublic ? "Yes" : "No"} />
						<CompactPair label="Trial Days" value={plan.trialDays || 0} />
						<CompactPair
							label="Grace Period (Days)"
							value={plan.original.gracePeriodDays || 0}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionLimits")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Max Students" value={plan.maxStudents || "Unlimited"} />
						<CompactPair label="Max Teachers" value={plan.maxTeachers || "Unlimited"} />
						<CompactPair label="Max Staff" value={plan.maxStaff || "Unlimited"} />
						<CompactPair label="Max Classes" value={plan.maxClasses || "Unlimited"} />
						<CompactPair
							label="Storage (GB)"
							value={plan.original.storageGb || "Unlimited"}
						/>
					</div>
				</div>

				{plan.description && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">{t("description")}</h3>
						<div
							className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none"
							dangerouslySetInnerHTML={{ __html: plan.description }}
						/>
					</div>
				)}

				{plan.original.notes && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">{t("notes")}</h3>
						<div className="text-muted-foreground text-sm">{plan.original.notes}</div>
					</div>
				)}
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">{t("title")}</SheetTitle>
				<SheetDescription className="text-xs">{t("description")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
