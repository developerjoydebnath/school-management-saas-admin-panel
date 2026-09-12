"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useGeolocation } from "@/shared/hooks/use-geolocation";
import { cn } from "@/shared/lib/utils";
import { distanceToGeofenceMeters, formatDistance } from "@/shared/utils/geo";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	DUTY_REASON_OPTIONS,
	DutyReason,
	PunchCard,
} from "../../dto/staff-attendance.dto";
import { selfCheckIn, selfCheckOut } from "../../hooks/use-staff-attendance-mutations";
import { GeofenceMap } from "../shared/GeofenceMap";
import { LocationStatus } from "./LocationStatus";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	card: PunchCard;
	action: "in" | "out";
	onDone?: () => void;
};

export function PunchDialog({ open, onOpenChange, card, action, onDone }: Props) {
	const { policy } = card;
	const geo = useGeolocation({ watch: true });
	const [dutyReason, setDutyReason] = useState<DutyReason | "">("");
	const [dutyNote, setDutyNote] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// The permission prompt must be tied to the user's click, so this only
	// fires once the dialog is actually opened — never on page mount.
	useEffect(() => {
		if (open) geo.request();
		else geo.stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const distanceMeters = useMemo(() => {
		if (!geo.position || !policy.geofence || !policy.geofenceEnabled) return null;
		return distanceToGeofenceMeters(geo.position, policy.geofence);
	}, [geo.position, policy.geofence, policy.geofenceEnabled]);

	// Mirrors the server's tolerance so the UI never promises something the
	// server will refuse. The server still recomputes and has the final say.
	const isOutside = useMemo(() => {
		if (distanceMeters === null || !geo.position) return false;
		if (policy.geofenceExempt) return false;
		return distanceMeters > (geo.accuracy || 0) + policy.accuracyBufferMeters;
	}, [distanceMeters, geo.position, geo.accuracy, policy]);

	const accuracyTooLow =
		policy.geofenceEnabled &&
		geo.accuracy !== null &&
		geo.accuracy > policy.maxAccuracyMeters;

	const needsReason =
		isOutside && policy.requireReasonOutsideGeofence && !dutyReason;

	const blockedOutside = isOutside && !policy.allowOutsideGeofencePunch;

	const canSubmit =
		geo.status === "granted" &&
		!!geo.position &&
		!accuracyTooLow &&
		!needsReason &&
		!blockedOutside &&
		!isSubmitting;

	const accuracyTone =
		geo.accuracy === null
			? "text-muted-foreground"
			: geo.accuracy <= 20
				? "text-emerald-600 dark:text-emerald-400"
				: geo.accuracy <= 50
					? "text-amber-600 dark:text-amber-400"
					: "text-red-600 dark:text-red-400";

	const handleSubmit = async () => {
		if (!geo.position) return;
		setIsSubmitting(true);
		try {
			const payload = {
				lat: geo.position.lat,
				lng: geo.position.lng,
				accuracyMeters: Math.round(geo.position.accuracy),
				capturedAt: geo.position.capturedAt,
				...(dutyReason ? { dutyReason } : {}),
				...(dutyNote ? { dutyNote } : {}),
				deviceInfo: {
					ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
					platform: typeof navigator !== "undefined" ? navigator.platform : "",
				},
			};
			const result =
				action === "in" ? await selfCheckIn(payload) : await selfCheckOut(payload);
			toast.success(result?.message || "Attendance recorded");
			onOpenChange(false);
			onDone?.();
		} catch {
			// The global axios interceptor already surfaces the error toast.
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{action === "in" ? "Check in" : "Check out"}
					</DialogTitle>
					<DialogDescription>
						{policy.geofenceEnabled
							? "Confirm your location, then submit."
							: "Your school does not use a campus boundary — just submit."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{geo.status === "granted" && geo.position ? (
						<GeofenceMap
							geofence={policy.geofence}
							position={geo.position}
							accuracyMeters={geo.accuracy}
							bufferMeters={policy.accuracyBufferMeters}
							height="h-56"
						/>
					) : (
						<LocationStatus
							status={geo.status}
							error={geo.error}
							onRetry={geo.refresh}
						/>
					)}

					<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
						<div className="flex items-center gap-2">
							<MapPin className="text-muted-foreground size-4" />
							{distanceMeters === null ? (
								<span className="text-muted-foreground">
									{policy.geofenceEnabled
										? "Waiting for your location…"
										: "No campus boundary set"}
								</span>
							) : isOutside ? (
								<span className="text-amber-600 dark:text-amber-400">
									≈ {formatDistance(distanceMeters)} outside campus
								</span>
							) : (
								<span className="text-emerald-600 dark:text-emerald-400">
									Inside campus
								</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							{geo.accuracy !== null && (
								<span className={cn("text-xs font-medium", accuracyTone)}>
									±{Math.round(geo.accuracy)} m
								</span>
							)}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={geo.refresh}
								disabled={geo.isRefreshing || geo.status === "insecure"}
							>
								{geo.isRefreshing ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<LocateFixed className="size-4" />
								)}
								Refresh location
							</Button>
						</div>
					</div>

					{policy.geofenceExempt && (
						<p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
							Your role is exempt from the campus boundary, so this punch will
							not need approval. Your coordinates are still recorded.
						</p>
					)}

					{accuracyTooLow && (
						<p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
							Waiting for a better signal — your reading is ±
							{Math.round(geo.accuracy || 0)} m, and the school requires ±
							{policy.maxAccuracyMeters} m or better. Move outdoors and refresh.
						</p>
					)}

					{blockedOutside && (
						<p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-400">
							Your school does not allow attendance from outside the campus. Ask
							an administrator to mark you instead.
						</p>
					)}

					{isOutside && !blockedOutside && (
						<div className="space-y-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
							<p className="text-xs text-amber-700 dark:text-amber-400">
								You are outside the campus. Tell the school why — exam centre
								duty, training and field trips are all normal reasons.
							</p>
							<div className="space-y-2">
								<Label htmlFor="dutyReason">
									Reason{policy.requireReasonOutsideGeofence ? " *" : ""}
								</Label>
								<NativeSelect
									id="dutyReason"
									value={dutyReason}
									onChange={(event) =>
										setDutyReason(event.target.value as DutyReason)
									}
								>
									<NativeSelectOption value="">Select a reason</NativeSelectOption>
									{DUTY_REASON_OPTIONS.map((option) => (
										<NativeSelectOption key={option.value} value={option.value}>
											{option.label}
										</NativeSelectOption>
									))}
								</NativeSelect>
							</div>
							<div className="space-y-2">
								<Label htmlFor="dutyNote">Note (optional)</Label>
								<Textarea
									id="dutyNote"
									value={dutyNote}
									onChange={(event) => setDutyNote(event.target.value)}
									placeholder="e.g. SSC centre duty at Rampura High School"
									className="h-20"
								/>
							</div>
						</div>
					)}

					<div className="flex justify-end gap-2 pt-1">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={!canSubmit}
							className={cn(
								isOutside &&
									!blockedOutside &&
									"bg-amber-600 text-white hover:bg-amber-700"
							)}
						>
							{isSubmitting && <Loader2 className="size-4 animate-spin" />}
							{isOutside && !blockedOutside
								? `Check ${action} from outside campus`
								: `Check ${action}`}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
