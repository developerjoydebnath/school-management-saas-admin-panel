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
import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { updateClassRoomDesign } from "../hooks/use-class-room-mutations";
import { useClassRoomDesign } from "../hooks/use-class-room";

type DimensionUnit = "feet" | "meter";
type LayoutItemType = "bench" | "chair" | "table" | "board" | "projector" | "fan" | "light";

type LayoutItem = {
	id: string;
	type: LayoutItemType;
	label: string;
	x: number;
	y: number;
	rotation: number;
	seats?: number;
};

type PaletteItem = {
	type: LayoutItemType;
	label: string;
	count: number;
	seats?: number;
};

const itemSize: Record<LayoutItemType, { width: number; height: number }> = {
	bench: { width: 92, height: 34 },
	chair: { width: 42, height: 42 },
	table: { width: 58, height: 42 },
	board: { width: 88, height: 20 },
	projector: { width: 42, height: 42 },
	fan: { width: 42, height: 42 },
	light: { width: 42, height: 42 },
};

function placedCount(items: LayoutItem[], type: LayoutItemType) {
	return items.filter((item) => item.type === type).length;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function createLayoutItem(item: PaletteItem, x: number, y: number): LayoutItem {
	return {
		id: `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		type: item.type,
		label: item.label,
		x,
		y,
		rotation: 0,
		seats: item.seats,
	};
}

function DesignItem({
	item,
	selected,
	onSelect,
}: {
	item: LayoutItem;
	selected: boolean;
	onSelect: () => void;
}) {
	const size = itemSize[item.type];

	return (
		<button
			type="button"
			draggable
			onClick={(event) => {
				event.stopPropagation();
				onSelect();
			}}
			onDragStart={(event) => {
				event.dataTransfer.setData("application/json", JSON.stringify({ source: "layout", itemId: item.id }));
			}}
			className={`absolute flex cursor-grab items-center justify-center rounded border bg-background/95 text-xs font-semibold shadow-sm transition active:cursor-grabbing ${
				selected ? "border-primary ring-primary/40 ring-2" : "border-border"
			}`}
			style={{
				left: `${item.x}%`,
				top: `${item.y}%`,
				width: size.width,
				height: size.height,
				transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
			}}
		>
			{item.type === "bench" ? (
				<div className="flex w-full items-center justify-around px-2">
					{Array.from({ length: item.seats || 3 }).map((_, index) => (
						<span key={index} className="bg-primary/25 border-primary/40 h-5 w-5 rounded-full border" />
					))}
				</div>
			) : (
				<span className="line-clamp-1 px-1">{item.label}</span>
			)}
		</button>
	);
}

export default function ClassRoomDesignView({ id }: { id: string }) {
	const { data: room, isLoading, mutate } = useClassRoomDesign(id);
	const roomRef = useRef<HTMLDivElement>(null);
	const [roomLength, setRoomLength] = useState("");
	const [roomWidth, setRoomWidth] = useState("");
	const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>("feet");
	const [items, setItems] = useState<LayoutItem[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!room) return;

		const nextLength = room.roomLength ? String(room.roomLength) : "";
		const nextWidth = room.roomWidth ? String(room.roomWidth) : "";
		const savedItems = Array.isArray(room.layoutConfig?.items) ? room.layoutConfig.items : [];

		setRoomLength(nextLength);
		setRoomWidth(nextWidth);
		setDimensionUnit(room.dimensionUnit);
		setItems(savedItems);
		setIsReady(Boolean(nextLength && nextWidth));
	}, [room]);

	const palette = useMemo<PaletteItem[]>(() => {
		if (!room) return [];

		const items: PaletteItem[] = [
			{ type: "bench", label: "3-Seater Bench", count: Math.max(room.highBench, room.lowBench), seats: 3 },
			{ type: "chair", label: "Chair", count: room.chair },
			{ type: "table", label: "Table", count: room.table },
			{ type: "board", label: "Board", count: room.board },
			{ type: "projector", label: "Projector", count: room.projector },
			{ type: "fan", label: "Fan", count: room.fan },
			{ type: "light", label: "Light", count: room.light },
		];

		return items.filter((item) => item.count > 0);
	}, [room]);

	const lengthNumber = Number(roomLength);
	const widthNumber = Number(roomWidth);
	const selectedItem = items.find((item) => item.id === selectedId);

	const handleMakeVisualization = () => {
		if (!lengthNumber || !widthNumber || lengthNumber <= 0 || widthNumber <= 0) {
			toast.error("Enter valid room length and width first");
			return;
		}

		setIsReady(true);
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (!roomRef.current) return;

		const payload = event.dataTransfer.getData("application/json");
		if (!payload) return;

		const rect = roomRef.current.getBoundingClientRect();
		const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96);
		const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 4, 96);
		const data = JSON.parse(payload) as { source: "palette" | "layout"; itemId?: string; item?: PaletteItem };

		if (data.source === "layout" && data.itemId) {
			setItems((current) => current.map((item) => (item.id === data.itemId ? { ...item, x, y } : item)));
			return;
		}

		if (data.source === "palette" && data.item) {
			const remaining = data.item.count - placedCount(items, data.item.type);
			if (remaining <= 0) return;

			const newItem = createLayoutItem(data.item, x, y);
			setItems((current) => [...current, newItem]);
			setSelectedId(newItem.id);
		}
	};

	const rotateSelected = () => {
		if (!selectedId) return;
		setItems((current) =>
			current.map((item) =>
				item.id === selectedId ? { ...item, rotation: (item.rotation + 90) % 360 } : item,
			),
		);
	};

	const removeSelected = () => {
		if (!selectedId) return;
		setItems((current) => current.filter((item) => item.id !== selectedId));
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
				layoutConfig: {
					version: 1,
					items,
					updatedAt: new Date().toISOString(),
				},
			});
			await mutate();
			toast.success("Class room design saved successfully");
		} catch {
			// Global axios interceptor handles API errors.
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
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
		<div className="space-y-6">
			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
					<div>
						<h2 className="text-lg font-semibold">{room.name}</h2>
						<p className="text-muted-foreground text-sm">
							Room {room.roomNo} - {room.building || "No building"} - {room.floor || "No floor"}
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
							onChange={(event) => setRoomLength(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Room Width</Label>
						<Input
							type="number"
							min={1}
							placeholder="e.g. 20"
							value={roomWidth}
							onChange={(event) => setRoomWidth(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Unit</Label>
						<Select value={dimensionUnit} onValueChange={(value) => setDimensionUnit(value as DimensionUnit)}>
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
				<Card className="p-5 shadow-none ring-0">
					<h3 className="font-semibold">Room Items</h3>
					<p className="text-muted-foreground mt-1 text-sm">
						Drag available furniture into the room plan.
					</p>
					<div className="mt-4 space-y-3">
						{palette.length === 0 ? (
							<p className="border-border text-muted-foreground rounded-md border border-dashed p-4 text-sm">
								No furniture count is configured for this room.
							</p>
						) : (
							palette.map((item) => {
								const used = placedCount(items, item.type);
								const remaining = Math.max(item.count - used, 0);
								return (
									<div
										key={item.type}
										draggable={remaining > 0}
										onDragStart={(event) => {
											event.dataTransfer.setData(
												"application/json",
												JSON.stringify({ source: "palette", item }),
											);
										}}
										className={`border-border flex items-center justify-between gap-3 rounded-md border p-3 ${
											remaining > 0 ? "cursor-grab bg-card active:cursor-grabbing" : "bg-muted/30 opacity-60"
										}`}
									>
										<div className="flex min-w-0 items-center gap-2">
											<Grip className="text-muted-foreground h-4 w-4 shrink-0" />
											<div className="min-w-0">
												<p className="line-clamp-1 text-sm font-medium">{item.label}</p>
												<p className="text-muted-foreground text-xs">
													Used {used} of {item.count}
												</p>
											</div>
										</div>
										<span className="bg-muted rounded-full px-2 py-1 text-xs font-semibold">{remaining}</span>
									</div>
								);
							})
						)}
					</div>
				</Card>

				<Card className="overflow-hidden p-5 shadow-none ring-0">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<div>
							<h3 className="font-semibold">Visual Layout</h3>
							<p className="text-muted-foreground text-sm">
								Place furniture according to the actual room arrangement.
							</p>
						</div>
						<div className="flex gap-2">
							<Button type="button" variant="outline" disabled={!selectedItem} onClick={rotateSelected}>
								<RotateCw className="h-4 w-4" />
								Rotate
							</Button>
							<Button type="button" variant="destructive" disabled={!selectedItem} onClick={removeSelected}>
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
							onClick={() => setSelectedId(null)}
							onDragOver={(event) => event.preventDefault()}
							onDrop={handleDrop}
							className="border-border bg-muted/20 relative mx-auto min-h-[420px] w-full max-w-5xl overflow-hidden rounded-md border-2 border-dashed"
							style={{
								aspectRatio: `${widthNumber || 20} / ${lengthNumber || 30}`,
							}}
						>
							<div className="bg-background/80 text-muted-foreground border-border absolute left-3 top-3 rounded border px-2 py-1 text-xs">
								{widthNumber || 0} x {lengthNumber || 0} {dimensionUnit}
							</div>
							{items.map((item) => (
								<DesignItem
									key={item.id}
									item={item}
									selected={selectedId === item.id}
									onSelect={() => setSelectedId(item.id)}
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
