"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale, useTranslations } from "next-intl";

interface PortalPaymentTabProps {
	config: any;
	onUpdate: () => void;
}

export default function PortalPaymentTab({ config }: PortalPaymentTabProps) {
	const locale = useLocale();
	const t = useTranslations("Portal");
	const { data, isLoading } = useSWR(
		config?.sessionId ? `/admission/settings/${config.sessionId}/fee-heads` : null
	);
	const feeHeads = data?.data || [];
	const shownHeads = feeHeads.filter((head: any) => head.isShown);
	const requiredTotal = shownHeads
		.filter((head: any) => head.isRequired)
		.reduce((sum: number, head: any) => sum + Number(head.amount || 0), 0);
	const shownTotal = shownHeads.reduce(
		(sum: number, head: any) => sum + Number(head.amount || 0),
		0
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("feeStructureTitle")}</CardTitle>
					<CardDescription>
						{t("feeStructureDesc")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-12" />
							<Skeleton className="h-12" />
							<Skeleton className="h-12" />
						</div>
					) : (
						<div className="space-y-3">
							{shownHeads.map((head: any) => (
								<div
									key={head.id}
									className="flex items-center justify-between rounded-lg border p-3 text-sm"
								>
									<div>
										<div className="font-medium">
											{getLocalizedName(
												{ en: head.name, bn: head.nameBn },
												locale
											)}
										</div>
										<div className="text-muted-foreground capitalize">
											{head.type?.replaceAll("_", " ")} ·{" "}
											{head.isRequired ? "Required" : "Optional"}
										</div>
									</div>
									<div className="font-semibold">BDT {Number(head.amount || 0)}</div>
								</div>
							))}
							<div className="bg-card grid gap-3 rounded-lg border p-4 pb-6 text-sm md:grid-cols-2">
								<div>
									<span className="text-muted-foreground">{t("requiredTotal")} </span>
									<span className="font-semibold">BDT {requiredTotal}</span>
								</div>
								<div>
									<span className="text-muted-foreground">{t("shownTotal")} </span>
									<span className="font-semibold">BDT {shownTotal}</span>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
