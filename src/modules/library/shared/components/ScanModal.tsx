"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ELEMENT_ID = "library-scanner-region";

/**
 * A camera scanner that hands back whatever it read.
 *
 * The app's existing QrBarcodeScannerModal is student-specific — it takes a
 * roster and navigates to a profile — so it cannot resolve a book. This one
 * knows nothing about what it is scanning and simply returns the string, which
 * is what both panels of the circulation desk need.
 *
 * It is a fallback, not the main path: a USB barcode scanner types into the
 * focused input and presses Enter, which needs no code at all. The camera is
 * for a tablet at the desk, and needs HTTPS or localhost to get permission.
 */
export default function ScanModal({
	open,
	onOpenChange,
	onScan,
	title,
	description,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onScan: (value: string) => void;
	title?: string;
	description?: string;
}) {
	const t = useTranslations("LibraryCirculation");
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;

		let cancelled = false;

		const stop = async () => {
			const scanner = scannerRef.current;
			scannerRef.current = null;
			if (scanner?.isScanning) {
				try {
					await scanner.stop();
				} catch {
					// The dialog is closing either way.
				}
			}
		};

		const start = async () => {
			try {
				const devices = await Html5Qrcode.getCameras();
				if (cancelled) return;
				if (!devices?.length) {
					setError(t("noCamera"));
					return;
				}
				// Prefer the rear camera — the desk points it at the book.
				const back = devices.find((device) =>
					/back|environment|rear/i.test(device.label || ""),
				);
				const scanner = new Html5Qrcode(ELEMENT_ID);
				scannerRef.current = scanner;
				await scanner.start(
					(back || devices[0]).id,
					{
						fps: 15,
						qrbox: (width, height) => {
							const size = Math.max(160, Math.floor(Math.min(width, height) * 0.7));
							return { width: size, height: size };
						},
					},
					(decoded: string) => {
						if (!decoded) return;
						void stop();
						onScan(decoded.trim());
					},
					() => {
						// Scans fail continuously until something is in frame — silent.
					},
				);
			} catch {
				if (!cancelled) {
					// The usual cause is an insecure origin: getUserMedia needs HTTPS
					// or literal localhost, so a plain-HTTP subdomain is blocked.
					setError(t("cameraBlocked"));
				}
			}
		};

		setError(null);
		void start();

		return () => {
			cancelled = true;
			void stop();
		};
	}, [open, onScan, t]);

	useEffect(() => {
		if (error) toast.error(error);
	}, [error]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title || t("scanWithCamera")}</DialogTitle>
					<DialogDescription>
						{description || t("scanWithCameraHelper")}
					</DialogDescription>
				</DialogHeader>
				{error ? (
					<div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
						{error}
					</div>
				) : (
					<div id={ELEMENT_ID} className="overflow-hidden rounded-md" />
				)}
			</DialogContent>
		</Dialog>
	);
}
