"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { Geofence } from "@/shared/utils/geo";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AttendanceSettings, MarkingMode } from "../../dto/staff-attendance.dto";
import { useAttendanceSettings } from "../../hooks/use-staff-attendance";
import { updateAttendanceSettings } from "../../hooks/use-staff-attendance-mutations";
import { GeofenceEditor } from "./GeofenceEditor";

const MODE_COPY: Record<MarkingMode, string> = {
	register:
		"The office marks everyone from a roster. Nobody needs a smartphone — this is the safest default.",
	self_checkin:
		"Employees punch in and out from their own phone with GPS. An admin can still mark on their behalf.",
	hybrid:
		"Both: employees may punch themselves, and the office can mark anyone. A register submit never overwrites a GPS punch.",
};

function Row({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			{children}
			{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
		</div>
	);
}

function ToggleRow({
	label,
	hint,
	checked,
	onChange,
}: {
	label: string;
	hint: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-md border p-3">
			<div className="min-w-0 space-y-1">
				<p className="text-sm font-medium">{label}</p>
				<p className="text-muted-foreground text-xs">{hint}</p>
			</div>
			<Switch checked={checked} onCheckedChange={onChange} />
		</div>
	);
}

export function AttendanceSettingsForm() {
	const { settings, isLoading, mutate } = useAttendanceSettings();
	const [form, setForm] = useState<AttendanceSettings | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (settings) setForm(settings);
	}, [settings]);

	if (isLoading || !form) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-52 rounded-md" />
				<Skeleton className="h-96 rounded-md" />
			</div>
		);
	}

	const set = <K extends keyof AttendanceSettings>(
		key: K,
		value: AttendanceSettings[K]
	) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await updateAttendanceSettings({
				markingMode: form.markingMode,
				workdayStart: form.workdayStart,
				workdayEnd: form.workdayEnd,
				graceMinutes: Number(form.graceMinutes),
				halfDayMinutes: Number(form.halfDayMinutes),
				allowBackdatedDays: Number(form.allowBackdatedDays),
				geofenceEnabled: form.geofenceEnabled,
				geofence: form.geofence,
				accuracyBufferMeters: Number(form.accuracyBufferMeters),
				maxAccuracyMeters: Number(form.maxAccuracyMeters),
				allowOutsideGeofencePunch: form.allowOutsideGeofencePunch,
				requireReasonOutsideGeofence: form.requireReasonOutsideGeofence,
				selfCheckinRequiresApproval: form.selfCheckinRequiresApproval,
				notifyOnOutsidePunch: form.notifyOnOutsidePunch,
			});
			toast.success("Attendance settings saved");
			await mutate();
		} catch {
			// Global axios interceptor already toasts the error.
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="@container/page space-y-6">
			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>How attendance is marked</CardTitle>
					<CardDescription>{MODE_COPY[form.markingMode]}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-5 @3xl/page:grid-cols-3">
					<Row label="Marking mode">
						<NativeSelect
							value={form.markingMode}
							onChange={(event) => set("markingMode", event.target.value as MarkingMode)}
						>
							<NativeSelectOption value="register">Register only</NativeSelectOption>
							<NativeSelectOption value="self_checkin">Self check-in</NativeSelectOption>
							<NativeSelectOption value="hybrid">Hybrid</NativeSelectOption>
						</NativeSelect>
					</Row>
					<Row label="Workday start">
						<Input
							type="time"
							value={form.workdayStart}
							onChange={(event) => set("workdayStart", event.target.value)}
						/>
					</Row>
					<Row
						label="Workday end"
						hint="An end earlier than the start means an overnight shift, e.g. a night guard on 18:00–06:00."
					>
						<Input
							type="time"
							value={form.workdayEnd}
							onChange={(event) => set("workdayEnd", event.target.value)}
						/>
					</Row>
					<Row label="Grace period (minutes)" hint="Arrivals within this window are not late.">
						<Input
							type="number"
							min={0}
							max={180}
							value={form.graceMinutes}
							onChange={(event) => set("graceMinutes", Number(event.target.value))}
						/>
					</Row>
					<Row
						label="Half day under (minutes)"
						hint="A shorter completed shift is recorded as a half day."
					>
						<Input
							type="number"
							min={30}
							max={720}
							value={form.halfDayMinutes}
							onChange={(event) => set("halfDayMinutes", Number(event.target.value))}
						/>
					</Row>
					<Row
						label="Allow backdating (days)"
						hint="0 means the register can only be filled for today."
					>
						<Input
							type="number"
							min={0}
							max={31}
							value={form.allowBackdatedDays}
							onChange={(event) => set("allowBackdatedDays", Number(event.target.value))}
						/>
					</Row>
				</CardContent>
			</Card>

			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>Campus boundary</CardTitle>
					<CardDescription>
						Used only for self check-in. Punches from outside are still accepted
						by default — they are recorded with a reason and sent for approval,
						because exam-centre duty, training and field trips are normal.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<ToggleRow
						label="Check location on self check-in"
						hint="Off means punches are accepted from anywhere without a location check."
						checked={form.geofenceEnabled}
						onChange={(value) => set("geofenceEnabled", value)}
					/>

					<GeofenceEditor
						value={form.geofence}
						onChange={(fence: Geofence | null) => set("geofence", fence)}
						bufferMeters={Number(form.accuracyBufferMeters) || 0}
					/>

					<div className="grid grid-cols-1 gap-5 @3xl/page:grid-cols-2">
						<Row
							label="Accuracy buffer (metres)"
							hint="Added to the phone's own accuracy before deciding inside or outside. Raise it if staff inside the building are wrongly flagged."
						>
							<Input
								type="number"
								min={0}
								max={1000}
								value={form.accuracyBufferMeters}
								onChange={(event) =>
									set("accuracyBufferMeters", Number(event.target.value))
								}
							/>
						</Row>
						<Row
							label="Reject readings worse than (metres)"
							hint="A very poor GPS fix carries no information about where someone is, so it is refused rather than guessed at."
						>
							<Input
								type="number"
								min={20}
								max={2000}
								value={form.maxAccuracyMeters}
								onChange={(event) => set("maxAccuracyMeters", Number(event.target.value))}
							/>
						</Row>
					</div>

					<div className="space-y-3">
						<ToggleRow
							label="Allow check-in from outside campus"
							hint="Turning this off blocks off-campus punches entirely — staff on exam duty would then need an admin to mark them."
							checked={form.allowOutsideGeofencePunch}
							onChange={(value) => set("allowOutsideGeofencePunch", value)}
						/>
						<ToggleRow
							label="Require a reason when outside"
							hint="Asks for the duty — exam centre, training, field trip — so the approver has context."
							checked={form.requireReasonOutsideGeofence}
							onChange={(value) => set("requireReasonOutsideGeofence", value)}
						/>
						<ToggleRow
							label="Approve every self check-in"
							hint="Sends even on-campus punches for approval. Most schools leave this off."
							checked={form.selfCheckinRequiresApproval}
							onChange={(value) => set("selfCheckinRequiresApproval", value)}
						/>
						<ToggleRow
							label="Email the school on an outside punch"
							hint="Notifies the school's contact address so approvals are not missed."
							checked={form.notifyOnOutsidePunch}
							onChange={(value) => set("notifyOnOutsidePunch", value)}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="bg-background/80 sticky bottom-4 z-10 flex justify-end gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button onClick={handleSave} disabled={isSaving} size="lg">
					{isSaving ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Save className="size-4" />
					)}
					Save settings
				</Button>
			</div>
		</div>
	);
}
