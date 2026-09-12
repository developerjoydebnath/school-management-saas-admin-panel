"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Holiday } from "../dto/holiday.dto";
import { updateHolidayStatus } from "../hooks/use-holiday-mutations";

type Props = {
	holiday: Holiday;
	size?: "default" | "sm";
	className?: string;
};

const todayKey = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate()
	).padStart(2, "0")}`;
};

/**
 * Inline Closed/Open change for a holiday.
 *
 * "Status" on a holiday is `isClosed` — whether the school actually shuts, as
 * opposed to a notable calendar entry it stays open for. That is what the list
 * column has always shown, so it is what this control changes.
 *
 * A holiday that has already finished is read-only here, matching the API:
 * attendance and the working-day counts for those dates were computed from this
 * very flag, so flipping it afterwards would rewrite history.
 */
export default function HolidayStatusControl({ holiday, size = "default", className }: Props) {
	const t = useTranslations("Holidays");
	const tc = useTranslations("Common");
	const [isSaving, setIsSaving] = useState(false);

	const hasPassed = holiday.endDate.slice(0, 10) < todayKey();
	const label = holiday.isClosed ? t("legendClosed") : t("legendEvent");

	const badge = (
		<Badge
			variant={holiday.isClosed ? "destructive" : "secondary"}
			className={cn("font-normal", size === "sm" && "text-[10px]", className)}
		>
			{label}
		</Badge>
	);

	const change = async () => {
		setIsSaving(true);
		try {
			await updateHolidayStatus(holiday.id, !holiday.isClosed);
			toast.success(t("statusChangeSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	// Offered-then-rejected is worse than not offered: the API refuses this for
	// a finished holiday, so it reads as a locked badge instead.
	if (hasPassed) {
		return (
			<span className="inline-flex items-center gap-1" title={t("pastStatusLocked")}>
				{badge}
				<Lock className="text-muted-foreground size-3" />
			</span>
		);
	}

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.ALL,
				PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
				PERMISSIONS.ACADEMICS.HOLIDAYS.EDIT,
			]}
			fallback={badge}
		>
			<ConfirmationModal
				onConfirm={change}
				title={tc("changeStatus")}
				description={
					holiday.isClosed ? t("changeToOpenDesc") : t("changeToClosedDesc")
				}
				confirmText={tc("changeStatus")}
				variant="default"
				isLoading={isSaving}
			>
				<AlertDialogTrigger asChild>
					<button
						type="button"
						// Rows around this have their own click targets.
						onClick={(e) => e.stopPropagation()}
						className="cursor-pointer transition-opacity hover:opacity-80"
						aria-label={tc("changeStatus")}
					>
						{badge}
					</button>
				</AlertDialogTrigger>
			</ConfirmationModal>
		</PermissionGuard>
	);
}
