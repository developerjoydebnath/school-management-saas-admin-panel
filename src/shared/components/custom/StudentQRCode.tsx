"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import Image from "./Image";

interface StudentQRCodeProps {
	studentId: string;
	className?: string;
	size?: number;
}

export function StudentQRCode({ studentId, className, size = 100 }: StudentQRCodeProps) {
	const [qrDataUrl, setQrDataUrl] = useState<string>("");

	useEffect(() => {
		if (studentId) {
			QRCode.toDataURL(studentId, {
				width: size,
				margin: 1,
				color: {
					dark: "#0f172a", // slate-900
					light: "#ffffff",
				},
			})
				.then((url) => setQrDataUrl(url))
				.catch((err) => console.error("Error generating QR code:", err));
		}
	}, [studentId, size]);

	if (!qrDataUrl) {
		return <div style={{ width: size, height: size }} className="bg-slate-100 animate-pulse rounded-lg" />;
	}

	return (
		<Image
			src={qrDataUrl}
			alt={`QR Code for ${studentId}`}
			className={className}
			width={size}
			height={size}
		/>
	);
}
