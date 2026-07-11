"use client";

import { Button } from "@/shared/components/ui/button";
import { AlertCircle } from "lucide-react";

function relativeTime(savedAt: number) {
	const diffMs = Math.max(Date.now() - savedAt, 0);
	const minutes = Math.floor(diffMs / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.floor(hours / 24);
	return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DraftRestorationBanner({
	savedAt,
	onRestore,
	onDiscard,
}: {
	savedAt: number;
	onRestore: () => void;
	onDiscard: () => void;
}) {
	return (
		<div className="sticky bottom-0 z-40 mx-auto mb-6 flex w-full max-w-5xl flex-col gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
				<div>
					<p className="font-medium text-amber-100">Unsaved draft found</p>
					<p className="text-muted-foreground">
						Last saved {relativeTime(savedAt)}. Restore it or discard it.
					</p>
				</div>
			</div>
			<div className="flex gap-2 sm:justify-end">
				<Button type="button" variant="outline" size="sm" onClick={onDiscard}>
					Discard
				</Button>
				<Button type="button" size="sm" onClick={onRestore}>
					Restore
				</Button>
			</div>
		</div>
	);
}
