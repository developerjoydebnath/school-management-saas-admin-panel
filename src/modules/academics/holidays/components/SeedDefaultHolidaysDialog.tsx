"use client";

import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { CalendarPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { seedDefaultHolidays } from "../hooks/use-holiday-mutations";

export default function SeedDefaultHolidaysDialog() {
	const t = useTranslations("Holidays");
	const locale = useLocale();
	const { selectedSessionId } = useSessionStore();
	const [open, setOpen] = useState(false);
	const [sessionId, setSessionId] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const sessions: any[] = (sessionsRes?.data || sessionsRes || []).filter(
		(session: any) => session.status === "ACTIVE"
	);

	useEffect(() => {
		if (open) setSessionId(selectedSessionId || "");
	}, [open, selectedSessionId]);

	const handleConfirm = async () => {
		if (!sessionId) return;
		setIsLoading(true);
		try {
			const res = await seedDefaultHolidays(sessionId);
			const created = res?.data?.created ?? 0;
			const skipped = res?.data?.skipped ?? 0;
			toast.success(t("seedSuccess", { created, skipped }));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ConfirmationModal
			open={open}
			onOpenChange={setOpen}
			onConfirm={handleConfirm}
			title={t("seedDefaultHolidaysTitle")}
			description={t("seedDefaultHolidaysDesc")}
			confirmText={t("seedDefaultHolidays")}
			isLoading={isLoading}
			body={
				<div className="flex flex-col gap-2">
					<Label className="text-muted-foreground text-sm font-medium">
						{t("session")}
					</Label>
					<NativeSelect
						name="sessionId"
						value={sessionId}
						onChange={(e) => setSessionId(e.target.value)}
					>
						<NativeSelectOption value="">{t("selectSession")}</NativeSelectOption>
						{sessions.map((session) => (
							<NativeSelectOption key={session.id} value={session.id}>
								{typeof session.name === "object"
									? getLocalizedName(session.name, locale)
									: session.name}
							</NativeSelectOption>
						))}
					</NativeSelect>
				</div>
			}
		>
			<AlertDialogTrigger asChild>
				<Button variant="outline">
					<CalendarPlus className="size-4" />
					{t("seedDefaultHolidays")}
				</Button>
			</AlertDialogTrigger>
		</ConfirmationModal>
	);
}
