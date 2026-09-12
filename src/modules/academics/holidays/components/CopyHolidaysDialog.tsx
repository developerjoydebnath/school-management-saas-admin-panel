"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { Button } from "@/shared/components/ui/button";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { CopyPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { copyHolidaysFromSession } from "../hooks/use-holiday-mutations";

export default function CopyHolidaysDialog() {
	const t = useTranslations("Holidays");
	const locale = useLocale();
	const [open, setOpen] = useState(false);
	const [sourceSessionId, setSourceSessionId] = useState("");
	const [targetSessionId, setTargetSessionId] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const sessions: any[] = (sessionsRes?.data || sessionsRes || []).filter(
		(session: any) => session.status === "ACTIVE"
	);

	const sessionLabel = (session: any) =>
		typeof session.name === "object" ? getLocalizedName(session.name, locale) : session.name;

	const handleConfirm = async () => {
		if (!sourceSessionId || !targetSessionId || sourceSessionId === targetSessionId) return;
		setIsLoading(true);
		try {
			await copyHolidaysFromSession(sourceSessionId, targetSessionId);
			toast.success(t("copySuccess"));
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
			title={t("copyFromSessionTitle")}
			description={t("copyFromSessionDesc")}
			confirmText={t("copyFromSession")}
			isLoading={isLoading}
			body={
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Label className="text-muted-foreground text-sm font-medium">
							{t("sourceSession")}
						</Label>
						<NativeSelect
							name="sourceSessionId"
							value={sourceSessionId}
							onChange={(e) => setSourceSessionId(e.target.value)}
						>
							<NativeSelectOption value="">{t("selectSession")}</NativeSelectOption>
							{sessions.map((session) => (
								<NativeSelectOption key={session.id} value={session.id}>
									{sessionLabel(session)}
								</NativeSelectOption>
							))}
						</NativeSelect>
					</div>
					<div className="flex flex-col gap-2">
						<Label className="text-muted-foreground text-sm font-medium">
							{t("targetSession")}
						</Label>
						<NativeSelect
							name="targetSessionId"
							value={targetSessionId}
							onChange={(e) => setTargetSessionId(e.target.value)}
						>
							<NativeSelectOption value="">{t("selectSession")}</NativeSelectOption>
							{sessions.map((session) => (
								<NativeSelectOption key={session.id} value={session.id}>
									{sessionLabel(session)}
								</NativeSelectOption>
							))}
						</NativeSelect>
					</div>
				</div>
			}
		>
			<AlertDialogTrigger asChild>
				<Button variant="outline">
					<CopyPlus className="size-4" />
					{t("copyFromSession")}
				</Button>
			</AlertDialogTrigger>
		</ConfirmationModal>
	);
}
