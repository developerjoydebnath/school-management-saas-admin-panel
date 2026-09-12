"use client";

import { Button } from "@/shared/components/ui/button";
import { GeoStatus } from "@/shared/hooks/use-geolocation";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, Loader2, MapPin, ShieldAlert } from "lucide-react";

type Props = {
	status: GeoStatus;
	error?: string | null;
	onRetry?: () => void;
	className?: string;
};

const COPY: Record<
	GeoStatus,
	{ title: string; body: string; tone: "info" | "warn" | "error" } | null
> = {
	idle: null,
	granted: null,
	prompting: {
		title: "Getting your location…",
		body: "Allow location access when your browser asks.",
		tone: "info",
	},
	// The lvh.me case. Distinct from `denied` because no amount of retrying
	// helps — the browser blocks the API outright on an insecure origin.
	insecure: {
		title: "Location needs a secure connection",
		body: "This page is served over plain HTTP, so the browser blocks location access. Open the panel over HTTPS, or use http://localhost:3000 for testing.",
		tone: "warn",
	},
	unsupported: {
		title: "This browser cannot read your location",
		body: "Ask an administrator to mark your attendance instead.",
		tone: "warn",
	},
	denied: {
		title: "Location permission denied",
		body: "Enable location for this site in your browser settings, then try again.",
		tone: "error",
	},
	unavailable: {
		title: "Location unavailable",
		body: "Your device could not get a fix. Move outdoors and try again.",
		tone: "error",
	},
	timeout: {
		title: "Timed out getting your location",
		body: "The signal may be weak indoors. Move near a window or outdoors and retry.",
		tone: "error",
	},
};

export function LocationStatus({ status, error, onRetry, className }: Props) {
	const copy = COPY[status];
	if (!copy) return null;

	const tone =
		copy.tone === "error"
			? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
			: copy.tone === "warn"
				? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
				: "border-border bg-muted/50 text-muted-foreground";

	const Icon =
		status === "prompting"
			? Loader2
			: copy.tone === "error"
				? ShieldAlert
				: copy.tone === "warn"
					? AlertTriangle
					: MapPin;

	return (
		<div className={cn("rounded-lg border p-4", tone, className)}>
			<div className="flex items-start gap-3">
				<Icon className={cn("mt-0.5 size-4 shrink-0", status === "prompting" && "animate-spin")} />
				<div className="min-w-0 space-y-1">
					<p className="text-sm font-medium">{copy.title}</p>
					<p className="text-xs opacity-90">{error || copy.body}</p>
					{onRetry && status !== "prompting" && status !== "insecure" && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="mt-2"
							onClick={onRetry}
						>
							Try again
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
