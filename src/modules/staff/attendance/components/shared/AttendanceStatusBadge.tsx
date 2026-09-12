"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { AttendanceStatus } from "../../dto/staff-attendance.dto";

const STYLES: Record<AttendanceStatus, { label: string; className: string }> = {
	PRESENT: {
		label: "Present",
		className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	},
	LATE: {
		label: "Late",
		className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
	},
	HALF_DAY: {
		label: "Half Day",
		className: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-400",
	},
	ON_LEAVE: {
		label: "On Leave",
		className: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
	},
	ABSENT: {
		label: "Absent",
		className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
	},
	PENDING: {
		label: "Not marked",
		className: "border-border bg-muted/60 text-muted-foreground",
	},
};

export function AttendanceStatusBadge({
	status,
	className,
}: {
	status: AttendanceStatus;
	className?: string;
}) {
	const style = STYLES[status] || STYLES.PENDING;
	return (
		<Badge variant="outline" className={cn(style.className, className)}>
			{style.label}
		</Badge>
	);
}
