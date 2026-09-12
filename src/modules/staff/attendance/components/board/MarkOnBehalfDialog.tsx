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
import { Textarea } from "@/shared/components/ui/textarea";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RosterEntry } from "../../dto/staff-attendance.dto";
import { markOnBehalf } from "../../hooks/use-staff-attendance-mutations";

type Props = {
	entry: RosterEntry | null;
	onOpenChange: (open: boolean) => void;
};

/**
 * The accessibility floor: guards, cleaners and peons frequently carry feature
 * phones and can never self-check-in, so an admin must always be able to punch
 * for them. Never gated on marking mode or the geofence.
 */
export function MarkOnBehalfDialog({ entry, onOpenChange }: Props) {
	const [remarks, setRemarks] = useState("");
	const [busy, setBusy] = useState<"in" | "out" | null>(null);

	const submit = async (action: "in" | "out") => {
		if (!entry) return;
		setBusy(action);
		try {
			await markOnBehalf({
				employeeType: entry.employeeType,
				employeeId: entry.employeeId,
				action,
				...(remarks ? { remarks } : {}),
			});
			toast.success(
				action === "in"
					? `Checked in ${entry.fullName}`
					: `Checked out ${entry.fullName}`
			);
			setRemarks("");
			onOpenChange(false);
		} catch {
			// Global axios interceptor already toasts the error.
		} finally {
			setBusy(null);
		}
	};

	return (
		<Dialog open={!!entry} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Mark on behalf</DialogTitle>
					<DialogDescription>
						Record a punch for {entry?.fullName} from the office. No location is
						captured — use this for staff without a smartphone.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="bg-muted/40 rounded-md border p-3 text-sm">
						<div className="font-medium">{entry?.fullName}</div>
						<div className="text-muted-foreground text-xs">
							{entry?.employeeCode} · {entry?.designationName || "—"}
						</div>
						{entry?.attendance?.checkInAt && (
							<div className="text-muted-foreground mt-2 text-xs">
								Already checked in — use Check out to close the shift.
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="onBehalfRemarks">Remarks (optional)</Label>
						<Textarea
							id="onBehalfRemarks"
							value={remarks}
							onChange={(event) => setRemarks(event.target.value)}
							placeholder="e.g. Arrived on time, marked at the office desk"
							className="h-20"
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => submit("out")}
							disabled={!!busy || !entry?.attendance?.checkInAt}
						>
							{busy === "out" ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<LogOut className="size-4" />
							)}
							Check out
						</Button>
						<Button onClick={() => submit("in")} disabled={!!busy}>
							{busy === "in" ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<LogIn className="size-4" />
							)}
							Check in
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
