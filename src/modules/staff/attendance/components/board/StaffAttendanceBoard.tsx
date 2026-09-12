"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import {
	CalendarOff,
	Download,
	Loader2,
	MapPin,
	Save,
	ShieldCheck,
	UserCog,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	AttendanceStatus,
	RosterEntry,
	STATUS_OPTIONS,
} from "../../dto/staff-attendance.dto";
import {
	useAttendanceOverview,
	useAttendanceRoster,
} from "../../hooks/use-staff-attendance";
import {
	downloadDailyRegisterPdf,
	submitRegister,
} from "../../hooks/use-staff-attendance-mutations";
import { AttendanceStatusBadge } from "../shared/AttendanceStatusBadge";
import { MarkOnBehalfDialog } from "./MarkOnBehalfDialog";

const todayStr = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate()
	).padStart(2, "0")}`;
};

const formatTime = (value?: string | null) =>
	value
		? new Date(value).toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";

function StatTile({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone?: "good" | "warn" | "bad";
}) {
	return (
		<div
			className={cn(
				"bg-card/70 border-border/70 rounded-md border p-4",
				tone === "good" && "border-emerald-500/40 bg-emerald-500/10",
				tone === "warn" && "border-amber-500/40 bg-amber-500/10",
				tone === "bad" && "border-red-500/40 bg-red-500/10"
			)}
		>
			<p className="text-muted-foreground truncate text-xs font-medium">{label}</p>
			<p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
		</div>
	);
}

export function StaffAttendanceBoard() {
	const [date, setDate] = useState(todayStr());
	const [employeeType, setEmployeeType] = useState("");
	const [designationId, setDesignationId] = useState("");
	const [search, setSearch] = useState("");
	const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [onBehalf, setOnBehalf] = useState<RosterEntry | null>(null);

	const params = useMemo(
		() => ({
			date,
			...(employeeType ? { employeeType } : {}),
			...(designationId ? { designationId } : {}),
			...(search ? { search } : {}),
		}),
		[date, employeeType, designationId, search]
	);

	const { roster, isLoading, mutate } = useAttendanceRoster(params);
	const { overview } = useAttendanceOverview({ date });

	// A new day (or a different filter) must not carry stale pending edits.
	useEffect(() => setDraft({}), [date]);

	const designations = useMemo(() => {
		const seen = new Map<string, string>();
		(roster?.roster || []).forEach((entry) => {
			if (entry.designationId && entry.designationName) {
				seen.set(entry.designationId, entry.designationName);
			}
		});
		return Array.from(seen.entries());
	}, [roster]);

	const keyOf = (entry: RosterEntry) => `${entry.employeeType}:${entry.employeeId}`;

	const setStatus = (entry: RosterEntry, status: AttendanceStatus) =>
		setDraft((prev) => ({ ...prev, [keyOf(entry)]: status }));

	const markAllPresent = () => {
		const next: Record<string, AttendanceStatus> = {};
		(roster?.roster || []).forEach((entry) => {
			// Never stage over a GPS punch that is through or awaiting approval —
			// the server would skip it anyway, so don't imply otherwise.
			const locked =
				entry.attendance?.mode === "self_checkin" &&
				(entry.attendance.approvalStatus === "pending" ||
					entry.attendance.approvalStatus === "approved");
			if (!locked) next[keyOf(entry)] = "PRESENT";
		});
		setDraft(next);
	};

	const pendingCount = Object.keys(draft).length;

	const handleSubmit = async () => {
		if (!roster || !pendingCount) return;
		setIsSubmitting(true);
		try {
			const records = (roster.roster || [])
				.filter((entry) => draft[keyOf(entry)])
				.map((entry) => ({
					employeeType: entry.employeeType,
					employeeId: entry.employeeId,
					status: draft[keyOf(entry)],
				}));

			const result = await submitRegister(roster.date, records);
			const skipped = result?.data?.skipped?.length || 0;
			toast.success(
				skipped
					? `Saved ${result?.data?.saved} · ${skipped} left alone (checked in by GPS)`
					: `Attendance saved for ${result?.data?.saved} employees`
			);
			setDraft({});
			await mutate();
		} catch {
			// Global axios interceptor already toasts the error.
		} finally {
			setIsSubmitting(false);
		}
	};

	const totals = overview?.totals;
	const closed = roster?.isHoliday || roster?.isWeeklyOff;

	return (
		<div className="@container/page space-y-6">
			<div className="grid grid-cols-1 gap-3 @md/page:grid-cols-2 @3xl/page:grid-cols-3 @5xl/page:grid-cols-6">
				<StatTile label="Employees" value={totals?.totalEmployees ?? 0} />
				<StatTile label="Present" value={totals?.present ?? 0} tone="good" />
				<StatTile label="Late" value={totals?.late ?? 0} tone="warn" />
				<StatTile label="Absent" value={totals?.absent ?? 0} tone="bad" />
				<StatTile label="Not marked" value={totals?.notMarked ?? 0} />
				<StatTile
					label="Awaiting approval"
					value={totals?.pendingApprovals ?? 0}
					tone={totals?.pendingApprovals ? "warn" : undefined}
				/>
			</div>

			<Card className="@container/page p-4 shadow-none ring-0 sm:p-6">
				<CardHeader className="p-0 pb-4">
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-3 @3xl/page:flex-row @3xl/page:items-center @3xl/page:justify-between">
							<div className="flex flex-wrap items-center gap-2">
								<Input
									type="date"
									value={date}
									onChange={(event) => setDate(event.target.value)}
									className="w-auto"
								/>
								<Badge variant="outline" className="capitalize">
									{roster?.mode?.replace("_", " ") || "register"} mode
								</Badge>
								{roster?.isToday && <Badge variant="secondary">Today</Badge>}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Button
									variant="outline"
									onClick={() => downloadDailyRegisterPdf(date)}
									className="gap-2"
								>
									<Download className="size-4" /> Register PDF
								</Button>
								<PermissionGuard
									permissions={[
										PERMISSIONS.STAFF.ATTENDANCE.APPROVE,
										PERMISSIONS.STAFF.ATTENDANCE.ALL,
										PERMISSIONS.STAFF.ALL,
									]}
								>
									<Button variant="outline" asChild className="gap-2">
										<Link href={PATHS.STAFF.ATTENDANCE.APPROVALS}>
											<ShieldCheck className="size-4" />
											Approvals
											{!!totals?.pendingApprovals && (
												<Badge variant="secondary">{totals.pendingApprovals}</Badge>
											)}
										</Link>
									</Button>
								</PermissionGuard>
							</div>
						</div>

						<div className="flex flex-col gap-2 @3xl/page:flex-row @3xl/page:items-center">
							<Tabs value={employeeType || "all"} onValueChange={(v) => setEmployeeType(v === "all" ? "" : v)}>
								<TabsList>
									<TabsTrigger value="all">All</TabsTrigger>
									<TabsTrigger value="teacher">Teachers</TabsTrigger>
									<TabsTrigger value="staff">Staff</TabsTrigger>
								</TabsList>
							</Tabs>
							<NativeSelect
								value={designationId}
								onChange={(event) => setDesignationId(event.target.value)}
								className="@3xl/page:w-56"
							>
								<NativeSelectOption value="">All designations</NativeSelectOption>
								{designations.map(([id, name]) => (
									<NativeSelectOption key={id} value={id}>
										{name}
									</NativeSelectOption>
								))}
							</NativeSelect>
							<Input
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search name or code"
								className="@3xl/page:max-w-64"
							/>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4 p-0">
					{closed && (
						<div className="flex items-start gap-3 rounded-md border border-sky-500/40 bg-sky-500/10 p-3 text-sm text-sky-700 dark:text-sky-400">
							<CalendarOff className="mt-0.5 size-4 shrink-0" />
							<span>
								{roster?.isHoliday
									? "School is closed on this date"
									: "This is a weekly off day"}
								— the register is disabled. Staff on official duty can still
								check in themselves and it will come through for approval.
							</span>
						</div>
					)}

					{isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 6 }).map((_, index) => (
								<Skeleton key={index} className="h-14 rounded-md" />
							))}
						</div>
					) : !roster?.roster?.length ? (
						<div className="text-muted-foreground flex flex-col items-center gap-2 rounded-md border border-dashed py-12 text-sm">
							<Users className="size-5" />
							No employees match these filters.
						</div>
					) : (
						<div className="space-y-2">
							{roster.roster.map((entry) => {
								const key = keyOf(entry);
								const staged = draft[key];
								const record = entry.attendance;
								const locked =
									record?.mode === "self_checkin" &&
									(record.approvalStatus === "pending" ||
										record.approvalStatus === "approved");

								return (
									<div
										key={key}
										className={cn(
											"flex flex-col gap-3 rounded-md border p-3 @3xl/page:flex-row @3xl/page:items-center @3xl/page:justify-between",
											staged && "border-primary/50 bg-primary/5"
										)}
									>
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<Link
														href={PATHS.STAFF.ATTENDANCE.EMPLOYEE(
															entry.employeeType,
															entry.employeeId
														)}
														className="truncate font-medium hover:underline"
													>
														{entry.fullName}
													</Link>
													{record?.mode === "self_checkin" && (
														<span
															title={
																record.checkInInside === false
																	? "Checked in from outside campus"
																	: "Checked in by GPS"
															}
														>
															<MapPin
																className={cn(
																	"size-3.5",
																	record.checkInInside === false
																		? "text-amber-600"
																		: "text-emerald-600"
																)}
															/>
														</span>
													)}
													{record?.markedOnBehalf && (
														<UserCog
															className="text-muted-foreground size-3.5"
															aria-label="Marked by an administrator"
														/>
													)}
												</div>
												<div className="text-muted-foreground truncate text-xs">
													{entry.employeeCode} · {entry.designationName || "—"} ·{" "}
													<span className="capitalize">{entry.employeeType}</span>
												</div>
											</div>
										</div>

										<div className="text-muted-foreground flex items-center gap-4 text-xs">
											<span>In {formatTime(record?.checkInAt)}</span>
											<span>Out {formatTime(record?.checkOutAt)}</span>
										</div>

										<div className="flex flex-wrap items-center gap-2">
											{locked ? (
												<div className="flex items-center gap-2">
													<AttendanceStatusBadge status={entry.status} />
													<Badge
														variant="outline"
														className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400"
													>
														GPS · {record?.approvalStatus}
													</Badge>
												</div>
											) : (
												<NativeSelect
													value={staged || (entry.status === "PENDING" ? "" : entry.status)}
													onChange={(event) =>
														setStatus(entry, event.target.value as AttendanceStatus)
													}
													disabled={!roster.editable}
													className="w-36"
												>
													<NativeSelectOption value="">Not marked</NativeSelectOption>
													{STATUS_OPTIONS.map((option) => (
														<NativeSelectOption key={option.value} value={option.value}>
															{option.label}
														</NativeSelectOption>
													))}
												</NativeSelect>
											)}

											<PermissionGuard
												permissions={[
													PERMISSIONS.STAFF.ATTENDANCE.EDIT,
													PERMISSIONS.STAFF.ATTENDANCE.ALL,
													PERMISSIONS.STAFF.ALL,
												]}
											>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setOnBehalf(entry)}
													title="Mark on behalf (for staff without a smartphone)"
												>
													<UserCog className="size-4" />
												</Button>
											</PermissionGuard>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>

				{roster?.editable && (
					<div className="bg-background/80 sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 shadow-sm backdrop-blur-md">
						<div className="text-muted-foreground text-sm">
							{pendingCount
								? `${pendingCount} change${pendingCount > 1 ? "s" : ""} ready to save`
								: "Set a status to start marking"}
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={markAllPresent}>
								Mark all present
							</Button>
							<Button onClick={handleSubmit} disabled={!pendingCount || isSubmitting}>
								{isSubmitting ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Save className="size-4" />
								)}
								Submit register
							</Button>
						</div>
					</div>
				)}
			</Card>

			<MarkOnBehalfDialog
				entry={onBehalf}
				onOpenChange={(open) => {
					if (!open) setOnBehalf(null);
					void mutate();
				}}
			/>
		</div>
	);
}
