"use client";

import { RoomGridLayer } from "../utils/RoomGridLayer";
import { useContainFitCanvas } from "../utils/use-contain-fit-canvas";

type LayoutItemType =
	| "bench"
	| "chair"
	| "table"
	| "board"
	| "projector"
	| "fan"
	| "light"
	| "generic";

type LayoutItem = {
	id: string;
	type: LayoutItemType;
	label: string;
	x: number;
	y: number;
	rotation: number;
	seats?: number;
	physicalWidth: number;
	physicalHeight: number;
};

const MIN_CANVAS_HEIGHT = 220;
const MAX_CANVAS_HEIGHT = 420;

function PreviewItem({
	item,
	roomWidthPx,
	roomHeightPx,
	roomWidthFt,
	roomLengthFt,
}: {
	item: LayoutItem;
	roomWidthPx: number;
	roomHeightPx: number;
	roomWidthFt: number;
	roomLengthFt: number;
}) {
	const widthPx = (item.physicalWidth / roomWidthFt) * roomWidthPx;
	const heightPx = (item.physicalHeight / roomLengthFt) * roomHeightPx;
	const shortSide = Math.min(widthPx, heightPx);
	const dotSize = Math.max(Math.min(shortSide * 0.5, 12), 4);

	return (
		<div
			className="bg-background/90 border-border absolute flex items-center justify-around overflow-hidden rounded border px-1 text-[9px] font-medium shadow-sm"
			style={{
				left: `${item.x}%`,
				top: `${item.y}%`,
				width: `${Math.max(widthPx, 18)}px`,
				height: `${Math.max(heightPx, 14)}px`,
				transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
			}}
		>
			{item.type === "bench" && item.seats ? (
				Array.from({ length: item.seats }).map((_, index) => (
					<span
						key={index}
						className="bg-primary/30 border-primary/50 shrink-0 rounded-full border"
						style={{ width: dotSize, height: dotSize }}
					/>
				))
			) : item.type === "fan" ? (
				<span className="text-[8px] opacity-70">⊕</span>
			) : item.type === "light" ? (
				<span className="text-[8px] opacity-70">💡</span>
			) : (
				<span
					className="line-clamp-1 px-0.5 text-center leading-tight"
					style={{ fontSize: Math.max(Math.min(heightPx * 0.3, 9), 6) }}
				>
					{item.label}
				</span>
			)}
		</div>
	);
}

export function RoomLayoutPreview({
	roomLength,
	roomWidth,
	dimensionUnit,
	items,
}: {
	roomLength: number;
	roomWidth: number;
	dimensionUnit: "feet" | "meter";
	items: LayoutItem[];
}) {
	const { wrapRef, canvasPx } = useContainFitCanvas({
		widthUnits: roomWidth,
		lengthUnits: roomLength,
		minHeightPx: MIN_CANVAS_HEIGHT,
		maxHeightPx: MAX_CANVAS_HEIGHT,
	});

	if (!roomWidth || !roomLength || roomWidth <= 0 || roomLength <= 0) return null;

	return (
		<div ref={wrapRef} className="w-full">
			<div
				className="border-border bg-muted/10 relative mx-auto overflow-hidden rounded-md border"
				style={{ width: `${canvasPx.w}px`, height: `${canvasPx.h}px` }}
			>
				<RoomGridLayer cols={Math.floor(roomWidth)} rows={Math.floor(roomLength)} />

				<div className="bg-background/80 text-muted-foreground border-border absolute top-2 left-2 z-10 rounded border px-1.5 py-0.5 text-[10px]">
					{roomWidth} × {roomLength} {dimensionUnit}
				</div>

				{items.map((item) => (
					<PreviewItem
						key={item.id}
						item={item}
						roomWidthPx={canvasPx.w}
						roomHeightPx={canvasPx.h}
						roomWidthFt={roomWidth}
						roomLengthFt={roomLength}
					/>
				))}
			</div>
		</div>
	);
}
