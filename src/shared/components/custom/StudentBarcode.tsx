"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

interface StudentBarcodeProps {
	studentId: string;
	className?: string;
	height?: number;
	width?: number;
	displayValue?: boolean;
}

export function StudentBarcode({
	studentId,
	className,
	height = 40,
	width = 1.5,
	displayValue = false,
}: StudentBarcodeProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (svgRef.current && studentId) {
			try {
				JsBarcode(svgRef.current, studentId, {
					format: "CODE128",
					width: width,
					height: height,
					displayValue: displayValue,
					font: "monospace",
					fontSize: 10,
					textMargin: 4,
					margin: 0,
					lineColor: "currentColor",
					background: "transparent",
				});
			} catch (err) {
				console.error("Error generating Barcode:", err);
			}
		}
	}, [studentId, height, width, displayValue]);

	return <svg ref={svgRef} className={className} />;
}
