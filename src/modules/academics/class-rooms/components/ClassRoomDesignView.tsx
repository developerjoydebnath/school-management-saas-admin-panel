"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { ArrowLeft, Box, Grip, RotateCw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useClassRoomDesign } from "../hooks/use-class-room";
import { useClassRoomAssignedInventory } from "../hooks/use-class-room-inventory";
import { updateClassRoomDesign } from "../hooks/use-class-room-mutations";

type DimensionUnit = "feet" | "meter";
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
	x: number; // percentage of canvas width
	y: number; // percentage of canvas height
	rotation: number;
	seats?: number;
	physicalWidth: number;
	physicalHeight: number;
};

type PaletteItem = {
	type: LayoutItemType;
	label: string;
	count: number;
	seats?: number;
	physicalWidth: number;
	physicalHeight: number;
};

type ActiveDrag =
	| {
			kind: "canvas";
			itemId: string;
			startX: number;
			startY: number;
			originXPct: number;
			originYPct: number;
	  }
	| {
			kind: "palette";
			item: PaletteItem;
			startX: number;
			startY: number;
			curX: number;
			curY: number;
	  };

// ─── Conversion ───────────────────────────────────────────────────────────────
const FEET_TO_METER = 0.3048;
const METER_TO_FEET = 3.28084;

function convertUnit(value: number, from: string, to: DimensionUnit): number {
	if (!value || isNaN(value)) return 0;
	const f = (from || "").toLowerCase();
	const t = to.toLowerCase();
	if (f === t) return value;
	if (f === "meter" && t === "feet") return value * METER_TO_FEET;
	if (f === "feet" && t === "meter") return value * FEET_TO_METER;
	return value;
}

function detectItemType(name: string): LayoutItemType {
	const lower = name.toLowerCase();
	if (lower.includes("bench")) return "bench";
	if (lower.includes("chair")) return "chair";
	if (lower.includes("table") || lower.includes("desk")) return "table";
	if (lower.includes("board") || lower.includes("blackboard") || lower.includes("whiteboard"))
		return "board";
	if (lower.includes("projector")) return "projector";
	if (lower.includes("fan")) return "fan";
	if (lower.includes("light") || lower.includes("lamp")) return "light";
	return "generic";
}

const DEFAULT_SIZES: Record<LayoutItemType, { w: number; h: number }> = {
	bench: { w: 6, h: 2 },
	chair: { w: 1.5, h: 1.5 },
	table: { w: 3, h: 2 },
	board: { w: 6, h: 1.5 },
	projector: { w: 1.5, h: 1.5 },
	fan: { w: 2, h: 2 },
	light: { w: 2, h: 2 },
	generic: { w: 2, h: 2 },
};

function placedCount(items: LayoutItem[], label: string) {
	return items.filter((i) => i.label === label).length;
}

function clamp(v: number, lo: number, hi: number) {
	return Math.min(Math.max(v, lo), hi);
}

function makeId(type: string) {
	return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * AABB collision check in percentage space.
 * Each item is a rectangle centered at (x,y)% with half-extents computed
 * from physical dimensions relative to the room.
 * A small tolerance gap (2% of room) is applied so items aren't flush.
 */
function itemHalfExtents(
	item: { physicalWidth: number; physicalHeight: number; rotation: number },
	roomW: number,
	roomL: number
) {
	const isRotated = item.rotation === 90 || item.rotation === 270;
	const hw = (((isRotated ? item.physicalHeight : item.physicalWidth) / roomW) * 100) / 2;
	const hh = (((isRotated ? item.physicalWidth : item.physicalHeight) / roomL) * 100) / 2;
	return { hw, hh };
}

function checkOverlap(
	ax: number,
	ay: number,
	a: { physicalWidth: number; physicalHeight: number; rotation: number },
	bx: number,
	by: number,
	b: { physicalWidth: number; physicalHeight: number; rotation: number },
	roomW: number,
	roomL: number,
	gap = 0.5
): boolean {
	const ea = itemHalfExtents(a, roomW, roomL);
	const eb = itemHalfExtents(b, roomW, roomL);
	const overlapX = Math.abs(ax - bx) < ea.hw + eb.hw + gap;
	const overlapY = Math.abs(ay - by) < ea.hh + eb.hh + gap;
	return overlapX && overlapY;
}

/**
 * Spiral outward from (tx, ty) to find the nearest position that doesn't
 * overlap any existing item. Returns the original position if nothing found.
 */
function findNearestEmptyPosition(
	tx: number,
	ty: number,
	movingItem: { physicalWidth: number; physicalHeight: number; rotation: number },
	others: LayoutItem[],
	roomW: number,
	roomL: number
): { x: number; y: number } {
	const isOverlapping = (x: number, y: number) =>
		others.some((o) => checkOverlap(x, y, movingItem, o.x, o.y, o, roomW, roomL));

	if (!isOverlapping(tx, ty)) return { x: tx, y: ty };

	// Step sizes based on item dimensions
	const { hw, hh } = itemHalfExtents(movingItem, roomW, roomL);
	const stepX = hw * 1.2;
	const stepY = hh * 1.2;

	// Spiral search: try positions in expanding rings
	for (let ring = 1; ring <= 30; ring++) {
		const candidates: { x: number; y: number }[] = [];
		for (let ix = -ring; ix <= ring; ix++) {
			for (let iy = -ring; iy <= ring; iy++) {
				// Only check the perimeter of this ring
				if (Math.abs(ix) !== ring && Math.abs(iy) !== ring) continue;
				candidates.push({ x: tx + ix * stepX, y: ty + iy * stepY });
			}
		}
		// Sort candidates by distance from target
		candidates.sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty));
		for (const pos of candidates) {
			const cx = clamp(pos.x, 1, 99);
			const cy = clamp(pos.y, 1, 99);
			if (!isOverlapping(cx, cy)) return { x: cx, y: cy };
		}
	}

	return { x: tx, y: ty };
}

// ─── Grid overlay ─────────────────────────────────────────────────────────────
function GridLayer({ cols, rows }: { cols: number; rows: number }) {
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

// ─── Canvas Item ──────────────────────────────────────────────────────────────
function DesignItem({
	item,
	selected,
	onSelect,
	onPointerDown,
	roomWidthPx,
	roomHeightPx,
	roomWidthFt,
	roomLengthFt,
	dragging,
}: {
	item: LayoutItem;
	selected: boolean;
	onSelect: () => void;
	onPointerDown: (e: React.PointerEvent) => void;
	roomWidthPx: number;
	roomHeightPx: number;
	roomWidthFt: number;
	roomLengthFt: number;
	dragging: boolean;
}) {
	// Physical pixel dimensions — CSS transform handles visual rotation
	// DO NOT swap width/height here; rotate() transform rotates the whole element including seats.
	const widthPx = (item.physicalWidth / roomWidthFt) * roomWidthPx;
	const heightPx = (item.physicalHeight / roomLengthFt) * roomHeightPx;

	// Seat dot size fits inside the SHORT dimension so they look correct at any rotation
	const shortSide = Math.min(widthPx, heightPx);
	const dotSize = Math.max(Math.min(shortSide * 0.55, 18), 6);

	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				onSelect();
			}}
			onPointerDown={(e) => {
				e.stopPropagation();
				onPointerDown(e);
			}}
			className={`bg-background/90 absolute flex cursor-grab items-center justify-around overflow-hidden rounded border px-1 text-xs font-semibold shadow-sm select-none ${
				selected ? "border-primary ring-primary/40 ring-2" : "border-border"
			} ${dragging ? "cursor-grabbing opacity-80 shadow-xl ring-2 ring-yellow-400/40" : ""}`}
			style={{
				left: `${item.x}%`,
				top: `${item.y}%`,
				width: `${Math.max(widthPx, 28)}px`,
				height: `${Math.max(heightPx, 20)}px`,
				// Rotation applied to the WHOLE element — seats rotate together with the bench
				transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
				touchAction: "none",
				zIndex: dragging ? 50 : selected ? 20 : 10,
				transition: dragging ? "none" : "box-shadow 0.15s",
			}}
		>
			{item.type === "bench" && item.seats ? (
				<>
					{Array.from({ length: item.seats }).map((_, index) => (
						<span
							key={index}
							title={`Seat ${index + 1} — click in exam mode to assign a student`}
							className="bg-primary/30 border-primary/50 hover:bg-primary/60 hover:border-primary shrink-0 cursor-pointer rounded-full border transition-all hover:scale-110"
							onClick={(e) => {
								e.stopPropagation();
								// TODO: open seat assignment dialog in exam mode
								// For now just log — exam seat planning will be implemented next
								console.log(`Seat ${index + 1} of ${item.label} clicked`);
							}}
							style={{ width: dotSize, height: dotSize }}
						/>
					))}
				</>
			) : item.type === "fan" ? (
				<span className="text-[10px] opacity-70">⊕</span>
			) : item.type === "light" ? (
				<span className="text-[10px] opacity-70">💡</span>
			) : (
				<span
					className="line-clamp-1 px-1 text-center leading-tight"
					style={{ fontSize: Math.max(Math.min(displayH * 0.35, 11), 7) }}
				>
					{item.label}
				</span>
			)}
		</div>
	);
}

// ─── Ghost overlay while dragging from palette ─────────────────────────────────
function PaletteGhost({
	item,
	x,
	y,
	roomWidthPx,
	roomHeightPx,
	roomWidthFt,
	roomLengthFt,
}: {
	item: PaletteItem;
	x: number;
	y: number;
	roomWidthPx: number;
	roomHeightPx: number;
	roomWidthFt: number;
	roomLengthFt: number;
}) {
	const widthPx = (item.physicalWidth / roomWidthFt) * roomWidthPx;
	const heightPx = (item.physicalHeight / roomLengthFt) * roomHeightPx;
	return (
		<div
			className="border-primary bg-primary/20 pointer-events-none absolute flex items-center justify-center rounded border-2 border-dashed opacity-70"
			style={{
				left: x,
				top: y,
				width: Math.max(widthPx, 28),
				height: Math.max(heightPx, 20),
				transform: "translate(-50%, -50%)",
				zIndex: 100,
			}}
		>
			{item.type === "bench" && item.seats ? (
				<div className="flex w-full items-center justify-around px-1">
					{Array.from({ length: item.seats }).map((_, i) => (
						<span key={i} className="bg-primary/40 h-3 w-3 shrink-0 rounded-full" />
					))}
				</div>
			) : (
				<span className="line-clamp-1 px-1 text-[9px]">{item.label}</span>
			)}
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClassRoomDesignView({ id }: { id: string }) {
	const { data: room, isLoading: isRoomLoading, mutate } = useClassRoomDesign(id);
	const { data: assignedInventory, isLoading: isInventoryLoading } =
		useClassRoomAssignedInventory(id);

	const roomRef = useRef<HTMLDivElement>(null);
	const [roomWidthPx, setRoomWidthPx] = useState(600);
	const [roomHeightPx, setRoomHeightPx] = useState(400);
	const [roomLength, setRoomLength] = useState("");
	const [roomWidth, setRoomWidth] = useState("");
	const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>("feet");
	const [items, setItems] = useState<LayoutItem[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

	// Keep a ref to items for use inside pointer event handlers without stale closure
	const itemsRef = useRef(items);
	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	// Measure canvas pixel size
	const measureCanvas = useCallback(() => {
		if (!roomRef.current) return;
		const r = roomRef.current.getBoundingClientRect();
		setRoomWidthPx(r.width);
		setRoomHeightPx(r.height);
	}, []);

	useEffect(() => {
		measureCanvas();
		const obs = new ResizeObserver(measureCanvas);
		if (roomRef.current) obs.observe(roomRef.current);
		return () => obs.disconnect();
	}, [measureCanvas, isReady]);

	// Seed from saved design
	useEffect(() => {
		if (!room) return;
		const nextLength = room.roomLength ? String(room.roomLength) : "";
		const nextWidth = room.roomWidth ? String(room.roomWidth) : "";
		const savedItems = Array.isArray(room.layoutConfig?.items) ? room.layoutConfig.items : [];
		setRoomLength(nextLength);
		setRoomWidth(nextWidth);
		setDimensionUnit(room.dimensionUnit ?? "feet");
		setItems(savedItems);
		setIsReady(Boolean(nextLength && nextWidth));
	}, [room]);

	const palette = useMemo<PaletteItem[]>(() => {
		if (!assignedInventory || !Array.isArray(assignedInventory)) return [];
		const map = new Map<string, PaletteItem>();
		for (const record of assignedInventory) {
			const itemName: string = record.item?.name || "Unknown Item";
			const quantity = Number(record.quantity) || 0;
			if (quantity <= 0) continue;
			const type = detectItemType(itemName);
			const rawW = Number(record.item?.length) || 0;
			const rawH = Number(record.item?.width) || 0;
			const itemDimUnit = (record.item?.dimensionUnit || "feet").toLowerCase();
			const seats = record.item?.isSeatingItem
				? Number(record.item?.seatingCapacity) || undefined
				: undefined;
			const physicalWidth = rawW
				? convertUnit(rawW, itemDimUnit, dimensionUnit)
				: DEFAULT_SIZES[type].w;
			const physicalHeight = rawH
				? convertUnit(rawH, itemDimUnit, dimensionUnit)
				: DEFAULT_SIZES[type].h;
			if (map.has(itemName)) {
				map.get(itemName)!.count += quantity;
			} else {
				map.set(itemName, {
					type,
					label: itemName,
					count: quantity,
					seats,
					physicalWidth,
					physicalHeight,
				});
			}
		}
		return Array.from(map.values());
	}, [assignedInventory, dimensionUnit]);

	const lengthNumber = Number(roomLength);
	const widthNumber = Number(roomWidth);
	const selectedItem = items.find((i) => i.id === selectedId);

	// ── Pointer helpers ──────────────────────────────────────────────────────
	const pctFromCanvasPointer = useCallback((clientX: number, clientY: number) => {
		if (!roomRef.current) return { x: 50, y: 50 };
		const rect = roomRef.current.getBoundingClientRect();
		const x = clamp(((clientX - rect.left) / rect.width) * 100, 1, 99);
		const y = clamp(((clientY - rect.top) / rect.height) * 100, 1, 99);
		return { x, y };
	}, []);

	// Start dragging a canvas item
	const handleCanvasItemPointerDown = useCallback((e: React.PointerEvent, itemId: string) => {
		e.preventDefault();
		const item = itemsRef.current.find((i) => i.id === itemId);
		if (!item) return;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		setActiveDrag({
			kind: "canvas",
			itemId,
			startX: e.clientX,
			startY: e.clientY,
			originXPct: item.x,
			originYPct: item.y,
		});
	}, []);

	// Start dragging from palette
	const handlePalettePointerDown = useCallback(
		(e: React.PointerEvent, paletteItem: PaletteItem) => {
			if (placedCount(itemsRef.current, paletteItem.label) >= paletteItem.count) return;
			e.preventDefault();
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
			setActiveDrag({
				kind: "palette",
				item: paletteItem,
				startX: e.clientX,
				startY: e.clientY,
				curX: e.clientX,
				curY: e.clientY,
			});
		},
		[]
	);

	// Global pointer move — FREE movement, no collision check
	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!activeDrag) return;
			e.preventDefault();

			if (activeDrag.kind === "canvas") {
				if (!roomRef.current) return;
				const rect = roomRef.current.getBoundingClientRect();
				const dx = ((e.clientX - activeDrag.startX) / rect.width) * 100;
				const dy = ((e.clientY - activeDrag.startY) / rect.height) * 100;
				const newX = clamp(activeDrag.originXPct + dx, 1, 99);
				const newY = clamp(activeDrag.originYPct + dy, 1, 99);
				// Move freely — overlap check happens on release
				setItems((prev) =>
					prev.map((item) =>
						item.id === activeDrag.itemId ? { ...item, x: newX, y: newY } : item
					)
				);
			} else {
				setActiveDrag((prev) =>
					prev && prev.kind === "palette"
						? { ...prev, curX: e.clientX, curY: e.clientY }
						: prev
				);
			}
		},
		[activeDrag]
	);

	// Global pointer up — snap to nearest empty position on release
	const handlePointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!activeDrag) return;

			if (activeDrag.kind === "canvas") {
				// Snap the dropped item to nearest non-overlapping position
				const draggingItem = itemsRef.current.find((i) => i.id === activeDrag.itemId);
				if (draggingItem) {
					const others = itemsRef.current.filter((i) => i.id !== activeDrag.itemId);
					const snapped = findNearestEmptyPosition(
						draggingItem.x,
						draggingItem.y,
						draggingItem,
						others,
						widthNumber,
						lengthNumber
					);
					setItems((prev) =>
						prev.map((item) =>
							item.id === activeDrag.itemId
								? { ...item, x: snapped.x, y: snapped.y }
								: item
						)
					);
				}
			}

			if (activeDrag.kind === "palette" && roomRef.current) {
				const rect = roomRef.current.getBoundingClientRect();
				if (
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom
				) {
					const { x, y } = pctFromCanvasPointer(e.clientX, e.clientY);
					const candidate: LayoutItem = {
						id: makeId(activeDrag.item.type),
						type: activeDrag.item.type,
						label: activeDrag.item.label,
						x,
						y,
						rotation: 0,
						seats: activeDrag.item.seats,
						physicalWidth: activeDrag.item.physicalWidth,
						physicalHeight: activeDrag.item.physicalHeight,
					};
					// Snap palette drop to nearest empty position too
					const snapped = findNearestEmptyPosition(
						x,
						y,
						candidate,
						itemsRef.current,
						widthNumber,
						lengthNumber
					);
					candidate.x = snapped.x;
					candidate.y = snapped.y;
					setItems((prev) => [...prev, candidate]);
					setSelectedId(candidate.id);
				}
			}

			setActiveDrag(null);
		},
		[activeDrag, pctFromCanvasPointer, widthNumber, lengthNumber]
	);

	// ── Actions ──────────────────────────────────────────────────────────────
	const handleMakeVisualization = () => {
		if (!lengthNumber || !widthNumber || lengthNumber <= 0 || widthNumber <= 0) {
			toast.error("Enter valid room length and width first");
			return;
		}
		setIsReady(true);
	};

	const rotateSelected = () => {
		if (!selectedId) return;
		setItems((prev) =>
			prev.map((item) =>
				item.id === selectedId ? { ...item, rotation: (item.rotation + 90) % 360 } : item
			)
		);
	};

	const removeSelected = () => {
		if (!selectedId) return;
		setItems((prev) => prev.filter((item) => item.id !== selectedId));
		setSelectedId(null);
	};

	const saveDesign = async () => {
		if (!lengthNumber || !widthNumber || lengthNumber <= 0 || widthNumber <= 0) {
			toast.error("Enter valid room dimensions before saving");
			return;
		}
		setIsSaving(true);
		try {
			await updateClassRoomDesign(id, {
				roomLength: lengthNumber,
				roomWidth: widthNumber,
				dimensionUnit,
				layoutConfig: { version: 1, items, updatedAt: new Date().toISOString() },
			});
			await mutate();
			toast.success("Class room design saved successfully");
		} catch {
			// Global axios interceptor handles API errors.
		} finally {
			setIsSaving(false);
		}
	};

	// ── Ghost position on canvas (for palette drag preview) ───────────────────
	const ghostCanvasPos = useMemo(() => {
		if (!activeDrag || activeDrag.kind !== "palette" || !roomRef.current) return null;
		const rect = roomRef.current.getBoundingClientRect();
		if (
			activeDrag.curX < rect.left ||
			activeDrag.curX > rect.right ||
			activeDrag.curY < rect.top ||
			activeDrag.curY > rect.bottom
		)
			return null;
		return {
			x: activeDrag.curX - rect.left,
			y: activeDrag.curY - rect.top,
		};
	}, [activeDrag]);

	// ─────────────────────────────────────────────────────────────────────────
	if (isRoomLoading || isInventoryLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-40 w-full rounded-md" />
				<Skeleton className="h-[520px] w-full rounded-md" />
			</div>
		);
	}

	if (!room) {
		return (
			<Card className="p-6 shadow-none ring-0">
				<p className="text-muted-foreground text-sm">Class room not found.</p>
			</Card>
		);
	}

	return (
		<div
			className="space-y-6"
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			style={{ touchAction: "none" }}
		>
			{/* Room dimension inputs */}
			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
					<div>
						<h2 className="text-lg font-semibold">{room.name}</h2>
						<p className="text-muted-foreground text-sm">
							Room {room.roomNo} · {room.building || "No building"} ·{" "}
							{room.floor || "No floor"}
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href={PATHS.ACADEMICS.CLASS_ROOMS.ROOT}>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>
					</Button>
				</CardHeader>
				<CardContent className="mt-6 grid gap-4 @2xl/page:grid-cols-[1fr_1fr_180px_auto]">
					<div className="space-y-2">
						<Label>Room Length</Label>
						<Input
							type="number"
							min={1}
							placeholder="e.g. 30"
							value={roomLength}
							onChange={(e) => setRoomLength(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Room Width</Label>
						<Input
							type="number"
							min={1}
							placeholder="e.g. 20"
							value={roomWidth}
							onChange={(e) => setRoomWidth(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Unit</Label>
						<Select
							value={dimensionUnit}
							onValueChange={(v) => setDimensionUnit(v as DimensionUnit)}
						>
							<SelectTrigger className="h-10! w-full">
								<SelectValue placeholder="Select unit" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="feet">Feet</SelectItem>
								<SelectItem value="meter">Meter</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-end">
						<Button type="button" className="w-full" onClick={handleMakeVisualization}>
							<Box className="h-4 w-4" />
							Make Visualization
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 @5xl/page:grid-cols-[280px_minmax(0,1fr)]">
				{/* Palette */}
				<Card className="p-5 shadow-none ring-0">
					<h3 className="font-semibold">Room Items</h3>
					<p className="text-muted-foreground mt-1 text-sm">
						Drag available furniture into the room plan.
					</p>
					<div className="mt-4 space-y-3">
						{palette.length === 0 ? (
							<p className="border-border text-muted-foreground rounded-md border border-dashed p-4 text-sm">
								No furniture assigned to this room.
							</p>
						) : (
							palette.map((paletteItem) => {
								const used = placedCount(items, paletteItem.label);
								const remaining = Math.max(paletteItem.count - used, 0);
								const isDraggingThis =
									activeDrag?.kind === "palette" &&
									activeDrag.item.label === paletteItem.label;
								return (
									<div
										key={paletteItem.label}
										onPointerDown={(e) =>
											handlePalettePointerDown(e, paletteItem)
										}
										className={`border-border flex items-center justify-between gap-3 rounded-md border p-3 select-none ${
											remaining > 0
												? `bg-card cursor-grab active:cursor-grabbing ${isDraggingThis ? "opacity-50" : ""}`
												: "bg-muted/30 cursor-not-allowed opacity-60"
										}`}
										style={{ touchAction: "none" }}
									>
										<div className="flex min-w-0 items-center gap-2">
											<Grip className="text-muted-foreground h-4 w-4 shrink-0" />
											<div className="min-w-0">
												<p className="line-clamp-1 text-sm font-medium">
													{paletteItem.label}
												</p>
												<p className="text-muted-foreground text-xs">
													Used {used} of {paletteItem.count}
												</p>
												<p className="text-muted-foreground text-[10px]">
													{paletteItem.physicalWidth.toFixed(1)} ×{" "}
													{paletteItem.physicalHeight.toFixed(1)}{" "}
													{dimensionUnit}
													{paletteItem.seats
														? ` · ${paletteItem.seats} seats`
														: ""}
												</p>
											</div>
										</div>
										<span className="bg-muted rounded-full px-2 py-1 text-xs font-semibold">
											{remaining}
										</span>
									</div>
								);
							})
						)}
					</div>
				</Card>

				{/* Canvas */}
				<Card className="overflow-hidden p-5 shadow-none ring-0">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<div>
							<h3 className="font-semibold">Visual Layout</h3>
							<p className="text-muted-foreground text-sm">
								Place furniture according to the actual room arrangement.
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								disabled={!selectedItem}
								onClick={rotateSelected}
							>
								<RotateCw className="h-4 w-4" />
								Rotate
							</Button>
							<Button
								type="button"
								variant="destructive"
								disabled={!selectedItem}
								onClick={removeSelected}
							>
								<Trash2 className="h-4 w-4" />
								Remove
							</Button>
							<Button type="button" onClick={saveDesign} disabled={isSaving}>
								<Save className="h-4 w-4" />
								{isSaving ? "Saving..." : "Save Design"}
							</Button>
						</div>
					</div>

					{isReady ? (
						<div
							ref={roomRef}
							onClick={(e) => {
								// Only deselect if we clicked the canvas background (not an item)
								if (e.target === e.currentTarget) setSelectedId(null);
							}}
							className="border-border bg-muted/10 relative mx-auto w-full overflow-hidden rounded-md border-2"
							style={{
								aspectRatio: `${widthNumber} / ${lengthNumber}`,
								minHeight: 360,
								maxHeight: 640,
							}}
						>
							<GridLayer
								cols={Math.floor(widthNumber)}
								rows={Math.floor(lengthNumber)}
							/>

							{/* Dimension badge */}
							<div className="bg-background/80 text-muted-foreground border-border absolute top-3 left-3 z-10 rounded border px-2 py-1 text-xs">
								{widthNumber} × {lengthNumber} {dimensionUnit}
							</div>

							{/* Palette ghost overlay while dragging over canvas */}
							{activeDrag?.kind === "palette" && ghostCanvasPos && (
								<PaletteGhost
									item={activeDrag.item}
									x={ghostCanvasPos.x}
									y={ghostCanvasPos.y}
									roomWidthPx={roomWidthPx}
									roomHeightPx={roomHeightPx}
									roomWidthFt={widthNumber}
									roomLengthFt={lengthNumber}
								/>
							)}

							{/* Layout items */}
							{items.map((item) => (
								<DesignItem
									key={item.id}
									item={item}
									selected={selectedId === item.id}
									dragging={
										activeDrag?.kind === "canvas" &&
										activeDrag.itemId === item.id
									}
									onSelect={() => setSelectedId(item.id)}
									onPointerDown={(e) => handleCanvasItemPointerDown(e, item.id)}
									roomWidthPx={roomWidthPx}
									roomHeightPx={roomHeightPx}
									roomWidthFt={widthNumber}
									roomLengthFt={lengthNumber}
								/>
							))}
						</div>
					) : (
						<div className="border-border text-muted-foreground flex min-h-[420px] items-center justify-center rounded-md border border-dashed p-6 text-center text-sm">
							Add room length and width, then click Make Visualization.
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
