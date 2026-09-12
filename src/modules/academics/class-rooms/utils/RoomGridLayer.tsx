"use client";

export function RoomGridLayer({ cols, rows }: { cols: number; rows: number }) {
	const vLines = [];
	for (let i = 1; i < cols; i++) {
		const x = (i / cols) * 100;
		const isMajor = i % 5 === 0;
		vLines.push(
			<line
				key={`v-${i}`}
				x1={`${x}%`}
				y1="0"
				x2={`${x}%`}
				y2="100%"
				stroke={isMajor ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
				strokeWidth={isMajor ? 1 : 0.5}
			/>
		);
	}
	const hLines = [];
	for (let i = 1; i < rows; i++) {
		const y = (i / rows) * 100;
		const isMajor = i % 5 === 0;
		hLines.push(
			<line
				key={`h-${i}`}
				x1="0"
				y1={`${y}%`}
				x2="100%"
				y2={`${y}%`}
				stroke={isMajor ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
				strokeWidth={isMajor ? 1 : 0.5}
			/>
		);
	}
	return (
		<svg
			className="pointer-events-none absolute inset-0 h-full w-full"
			xmlns="http://www.w3.org/2000/svg"
		>
			{vLines}
			{hLines}
		</svg>
	);
}
