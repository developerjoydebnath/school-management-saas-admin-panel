"use client";

import { useTranslations } from "next-intl";

interface FeeSummaryBarProps {
	totalRequired: number;
	totalShown: number;
}

/** Live totals row shown below the fee heads table */
export function FeeSummaryBar({ totalRequired, totalShown }: FeeSummaryBarProps) {
	const t = useTranslations("AdmissionSettings");

	return (
		<div className="bg-background/95 sticky bottom-4 z-40 flex flex-col gap-3 rounded-lg border p-4 text-sm font-medium shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground">{t("feeTotalRequired")}</span>
				<span className="text-base">BDT {totalRequired.toLocaleString()}</span>
			</div>
			<div className="bg-border hidden h-4 w-px sm:block" />
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground">{t("feeTotalShown")}</span>
				<span className="text-base">BDT {totalShown.toLocaleString()}</span>
			</div>
		</div>
	);
}
