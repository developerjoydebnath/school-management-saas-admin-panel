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
		<div className="bg-background flex items-center justify-end gap-8 rounded-lg border p-4 text-sm font-medium">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground">{t("feeTotalRequired")}</span>
				<span className="text-base">BDT {totalRequired.toLocaleString()}</span>
			</div>
			<div className="bg-border h-4 w-px" />
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground">{t("feeTotalShown")}</span>
				<span className="text-base">BDT {totalShown.toLocaleString()}</span>
			</div>
		</div>
	);
}
