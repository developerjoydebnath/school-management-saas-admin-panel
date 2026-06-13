"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Html5Qrcode } from "html5-qrcode";
import { AlertCircle, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface QrBarcodeScannerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	students: any[];
}

export default function QrBarcodeScannerModal({
	open,
	onOpenChange,
	students,
}: QrBarcodeScannerModalProps) {
	const router = useRouter();
	const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
	const [activeCameraId, setActiveCameraId] = useState<string>("");
	const [cameras, setCameras] = useState<any[]>([]);
	const [isScanning, setIsScanning] = useState(false);
	const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

	const scannerElementId = "qr-barcode-reader";

	// Stop scanning when modal closes
	useEffect(() => {
		if (!open) {
			// eslint-disable-next-line react-hooks/immutability
			stopScanner();
		} else {
			// eslint-disable-next-line react-hooks/immutability
			requestCameras();
		}
		return () => {
			stopScanner();
		};
	}, [open]);

	const requestCameras = async () => {
		try {
			const devices = await Html5Qrcode.getCameras();
			if (devices && devices.length > 0) {
				setCameras(devices);
				setHasCameraPermission(true);
				// Default to environment/back camera if available, otherwise first camera
				const backCamera = devices.find((device) =>
					device.label.toLowerCase().includes("back") ||
					device.label.toLowerCase().includes("environment")
				);
				const selectedCamera = backCamera || devices[0];
				setActiveCameraId(selectedCamera.id);
				startScanner(selectedCamera.id);
			} else {
				setHasCameraPermission(false);
				toast.error("No cameras found on your device.");
			}
		} catch (err) {
			setHasCameraPermission(false);
			console.error("Camera access error:", err);
			toast.error("Camera access permission denied.");
		}
	};

	const startScanner = async (cameraId: string) => {
		stopScanner();

		try {
			setIsScanning(true);
			const html5QrCode = new Html5Qrcode(scannerElementId);
			html5QrCodeRef.current = html5QrCode;

			await html5QrCode.start(
				cameraId,
				{
					fps: 15,
					qrbox: (width, height) => {
						// Responsive scan box: 70% of smaller dimension, minimum 150px
						const minDimension = Math.min(width, height);
						const scanBoxSize = Math.max(160, Math.floor(minDimension * 0.7));
						return { width: scanBoxSize, height: scanBoxSize };
					},
				},
				onScanSuccess,
				onScanFailure
			);
		} catch (err) {
			console.error("Error starting scanner:", err);
			setIsScanning(false);
		}
	};

	const stopScanner = async () => {
		if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
			try {
				await html5QrCodeRef.current.stop();
			} catch (err) {
				console.error("Failed to stop scanner:", err);
			}
		}
		html5QrCodeRef.current = null;
		setIsScanning(false);
	};

	const onScanSuccess = (decodedText: string) => {
		if (!decodedText) return;

		// Search for student with matching studentId
		const query = decodedText.trim().toUpperCase();
		const matchedStudent = students.find(
			(s) => s.studentId?.toUpperCase() === query
		);

		if (matchedStudent) {
			toast.success(`Found student: ${matchedStudent.fullName}`);
			stopScanner();
			onOpenChange(false);
			// Redirect directly to profile
			router.push(`/students/directory/${matchedStudent.class}/${matchedStudent.id}`);
		} else {
			toast.error(`No student found with ID: ${decodedText}`);
		}
	};

	const onScanFailure = (error: any) => {
		// Silent failure (scans fail continually until code is placed in scan area)
	};

	const handleCameraChange = (cameraId: string) => {
		setActiveCameraId(cameraId);
		startScanner(cameraId);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl font-bold">
						<Camera className="text-primary size-5" />
						Scan Student QR / Barcode
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center justify-center p-4 gap-6">
					{hasCameraPermission === false ? (
						<div className="flex flex-col items-center text-center p-8 border border-dashed rounded-2xl bg-slate-50 dark:bg-slate-900/50 gap-3">
							<AlertCircle className="size-10 text-destructive" />
							<h3 className="font-semibold text-slate-800 dark:text-slate-200">Camera Access Denied</h3>
							<p className="text-xs text-muted-foreground max-w-[280px]">
								Webcam access is required to scan QR and barcodes. Please enable camera permission in your browser.
							</p>
							<Button variant="outline" size="sm" onClick={requestCameras} className="mt-2">
								Grant Permission
							</Button>
						</div>
					) : (
						<div className="w-full space-y-4">
							{/* Scanner Frame */}
							<div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-black shadow-inner flex items-center justify-center">
								{/* Live Feed Div */}
								<div id={scannerElementId} className="w-full h-full [&>video]:object-cover" />

								{/* Scanner HUD Overlay */}
								{isScanning && (
									<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
										{/* Glass Scan Region Overlay */}
										<div className="relative size-44 border-2 border-primary rounded-2xl shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] animate-pulse flex items-center justify-center">
											{/* Neon Corner Indicators */}
											<div className="absolute -top-1 -left-1 size-4 border-t-4 border-l-4 border-primary rounded-tl-md" />
											<div className="absolute -top-1 -right-1 size-4 border-t-4 border-r-4 border-primary rounded-tr-md" />
											<div className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-primary rounded-bl-md" />
											<div className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-primary rounded-br-md" />

											{/* Moving Laser Scanner Line */}
											<div className="absolute left-1 right-1 h-0.5 bg-primary/80 shadow-[0_0_8px_var(--color-primary)] animate-[bounce_2s_infinite]" />
										</div>
										<p className="text-white/80 text-[10px] font-medium tracking-widest uppercase mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
											Align Code inside Frame
										</p>
									</div>
								)}
							</div>

							{/* Controls */}
							{cameras.length > 1 && (
								<div className="flex flex-col gap-1.5">
									<label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
										Switch Active Camera
									</label>
									<select
										value={activeCameraId}
										onChange={(e) => handleCameraChange(e.target.value)}
										className="w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm shadow-sm outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-ring"
									>
										{cameras.map((camera) => (
											<option key={camera.id} value={camera.id}>
												{camera.label || `Camera ${camera.id}`}
											</option>
										))}
									</select>
								</div>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
