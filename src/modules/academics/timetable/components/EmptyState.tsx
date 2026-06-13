"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";

export function EmptyState() {
	const t = useTranslations("Timetable");
	return (
		<div className="text-muted-foreground flex flex-col items-center py-32 text-center">
			<div className="bg-accent/50 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
				<CalendarDays className="text-muted-foreground/60 h-10 w-10" />
			</div>
			<p className="text-foreground mb-2 text-lg font-semibold">{t("selectAClass")}</p>
			<p className="mx-auto max-w-xs text-sm">{t("selectAClassDesc")}</p>
		</div>
	);
}
