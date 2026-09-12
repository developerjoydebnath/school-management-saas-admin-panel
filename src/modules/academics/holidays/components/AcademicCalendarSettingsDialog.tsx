"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { useSWR } from "@/shared/hooks/use-swr";
import { Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { updateAcademicCalendarSettings } from "../hooks/use-holiday-mutations";

export default function AcademicCalendarSettingsDialog() {
	const t = useTranslations("Holidays");
	const ft = useTranslations("Forms");
	const locale = useLocale();
	const [open, setOpen] = useState(false);
	const [weeklyOffDays, setWeeklyOffDays] = useState<string[]>(["5"]);
	const [isSaving, setIsSaving] = useState(false);

	const { data } = useSWR(open ? "/holidays/settings" : null);

	useEffect(() => {
		if (!open) return;
		const days = data?.data?.weeklyOffDays as number[] | undefined;
		setWeeklyOffDays((days ?? [5]).map(String));
	}, [open, data]);

	const weekdayLabels = useMemo(() => {
		const base = new Date(Date.UTC(2023, 0, 1)); // a Sunday
		const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(base);
			date.setUTCDate(base.getUTCDate() + i);
			return formatter.format(date);
		});
	}, [locale]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await updateAcademicCalendarSettings(weeklyOffDays.map(Number));
			toast.success(t("settingsSaved"));
			setOpen(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon" title={t("weeklyOffDaysTitle")}>
					<Settings className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("weeklyOffDaysTitle")}</DialogTitle>
					<DialogDescription>{t("weeklyOffDaysDesc")}</DialogDescription>
				</DialogHeader>
				<ToggleGroup
					type="multiple"
					variant="outline"
					value={weeklyOffDays}
					onValueChange={(value: string[]) => setWeeklyOffDays(value)}
					className="w-full"
				>
					{weekdayLabels.map((label, i) => (
						<ToggleGroupItem key={i} value={String(i)} className="flex-1">
							{label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
						{ft("cancel")}
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? ft("saveLoading") : ft("save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
