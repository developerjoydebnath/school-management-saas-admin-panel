"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { formatDistance } from "@/shared/utils/geo";
import { Check, Loader2, MapPin, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApprovalItem } from "../../dto/staff-attendance.dto";
import { useAttendanceApprovals, useAttendanceSettings } from "../../hooks/use-staff-attendance";
import {
	approveAttendance,
	rejectAttendance,
} from "../../hooks/use-staff-attendance-mutations";
import { GeofenceMap } from "../shared/GeofenceMap";

const formatTime = (value?: string | null) =>
	value
		? new Date(value).toLocaleString("en-GB", {
				day: "2-digit",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";

export function ApprovalQueue() {
	const [status, setStatus] = useState("pending");
	const { approvals, isLoading, mutate } = useAttendanceApprovals({ status });
	const { settings } = useAttendanceSettings();
	const [busyId, setBusyId] = useState<string | null>(null);
	const [rejecting, setRejecting] = useState<ApprovalItem | null>(null);
	const [reason, setReason] = useState("");

	const handleApprove = async (item: ApprovalItem) => {
		setBusyId(item.id);
		try {
			await approveAttendance(item.id);
			toast.success(`Approved ${item.employee?.fullName || "record"}`);
			await mutate();
		} catch {
			// Global axios interceptor already toasts the error.
		} finally {
			setBusyId(null);
		}
	};

	const handleReject = async () => {
		if (!rejecting || !reason.trim()) return;
		setBusyId(rejecting.id);
		try {
			await rejectAttendance(rejecting.id, reason.trim());
			toast.success("Record rejected and marked absent");
			setRejecting(null);
			setReason("");
			await mutate();
		} catch {
			// Global axios interceptor already toasts the error.
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="@container/page space-y-4">
			<Tabs value={status} onValueChange={setStatus}>
				<TabsList>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="approved">Approved</TabsTrigger>
					<TabsTrigger value="rejected">Rejected</TabsTrigger>
				</TabsList>
			</Tabs>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className="h-40 rounded-md" />
					))}
				</div>
			) : !approvals.length ? (
				<Card className="shadow-none">
					<CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-14 text-sm">
						<ShieldCheck className="size-6" />
						{status === "pending"
							? "Nothing is waiting for approval."
							: `No ${status} records.`}
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-2">
					{approvals.map((item) => (
						<Card key={item.id} className="bg-card/70 shadow-none">
							<CardHeader className="pb-3">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="min-w-0">
										<CardTitle className="truncate text-base">
											{item.employee?.fullName || "Unknown employee"}
										</CardTitle>
										<p className="text-muted-foreground text-xs">
											{item.employee?.employeeCode} ·{" "}
											{item.employee?.designationName || "—"}
										</p>
									</div>
									<Badge variant="outline" className="capitalize">
										{item.shiftDate}
									</Badge>
								</div>
							</CardHeader>

							<CardContent className="space-y-3">
								{item.checkInLat && item.checkInLng && (
									<GeofenceMap
										geofence={settings?.geofence || null}
										position={{ lat: item.checkInLat, lng: item.checkInLng }}
										accuracyMeters={item.checkInAccuracyM}
										height="h-40"
									/>
								)}

								<div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
									<div>
										<div className="text-muted-foreground text-xs">Checked in</div>
										<div>{formatTime(item.checkInAt)}</div>
									</div>
									<div>
										<div className="text-muted-foreground text-xs">Checked out</div>
										<div>{formatTime(item.checkOutAt)}</div>
									</div>
									<div>
										<div className="text-muted-foreground text-xs">Location</div>
										<div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
											<MapPin className="size-3.5" />
											{item.checkInDistanceM
												? `${formatDistance(item.checkInDistanceM)} outside`
												: "Outside campus"}
										</div>
									</div>
									<div>
										<div className="text-muted-foreground text-xs">Reason</div>
										<div>{item.dutyReasonLabel || "—"}</div>
									</div>
								</div>

								{item.dutyNote && (
									<p className="bg-muted/40 text-muted-foreground rounded-md border p-2 text-xs">
										{item.dutyNote}
									</p>
								)}

								{item.rejectionReason && (
									<p className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-700 dark:text-red-400">
										Rejected: {item.rejectionReason}
									</p>
								)}

								{status === "pending" && (
									<div className="flex justify-end gap-2 pt-1">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setRejecting(item);
												setReason("");
											}}
											disabled={busyId === item.id}
										>
											<X className="size-4" /> Reject
										</Button>
										<ConfirmationModal
											title="Approve this attendance?"
											description={`This confirms ${item.employee?.fullName || "the employee"} was on official duty away from campus.`}
											confirmText="Approve"
											onConfirm={() => handleApprove(item)}
											isLoading={busyId === item.id}
										>
											<AlertDialogTrigger asChild>
												<Button size="sm" disabled={busyId === item.id}>
													{busyId === item.id ? (
														<Loader2 className="size-4 animate-spin" />
													) : (
														<Check className="size-4" />
													)}
													Approve
												</Button>
											</AlertDialogTrigger>
										</ConfirmationModal>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Reject attendance</DialogTitle>
						<DialogDescription>
							The record will be marked absent. Tell the employee why.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="e.g. No approved duty order for this date"
						className="h-24"
					/>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setRejecting(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={!reason.trim() || !!busyId}
						>
							{busyId ? <Loader2 className="size-4 animate-spin" /> : null}
							Reject
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
