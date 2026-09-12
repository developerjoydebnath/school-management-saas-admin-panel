"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { ArrowLeft, Plus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useContainFitCanvas } from "@/modules/academics/class-rooms/utils/use-contain-fit-canvas";
import { RoomGridLayer } from "@/modules/academics/class-rooms/utils/RoomGridLayer";
import { RoomLayoutItem, SeatAssignment } from "../dto/seat-planning.dto";
import { useRoomCanvas } from "../hooks/use-seat-planning";
import { deleteSeatAssignment } from "../hooks/use-seat-planning-mutations";
import { SeatAssignDialog } from "./SeatAssignDialog";

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

function SeatButton({
	filled,
	size,
	isOverflow,
	assignment,
	onEmptyClick,
	onUnassign,
}: {
	filled: boolean;
	size: number;
	isOverflow: boolean;
	assignment?: SeatAssignment;
	onEmptyClick: () => void;
	onUnassign: () => void;
}) {
	if (!filled) {
		return (
			<button
				type="button"
				onClick={onEmptyClick}
				title="Assign student"
				className="border-primary/50 hover:bg-primary/20 hover:border-primary shrink-0 cursor-pointer rounded-full border border-dashed transition-all"
				style={{ width: size, height: size }}
			/>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					title={assignment?.student.fullName}
					className={`shrink-0 cursor-pointer rounded-full border text-[8px] font-semibold text-white transition-all hover:scale-110 ${
						isOverflow ? "bg-amber-600 border-amber-700" : "bg-primary border-primary/70"
					}`}
					style={{ width: size, height: size, lineHeight: `${size}px` }}
				>
					{assignment ? initials(assignment.student.fullName) : ""}
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-56 p-3" side="top">
				<p className="text-sm font-medium">{assignment?.student.fullName}</p>
				<p className="text-muted-foreground text-xs">
					{assignment?.student.studentId}
					{assignment?.student.roll ? ` · Roll ${assignment.student.roll}` : ""}
				</p>
				{isOverflow && (
					<Badge variant="destructive" className="mt-2">
						Overcrowded seat
					</Badge>
				)}
				<Button
					size="sm"
					variant="outline"
					className="mt-3 w-full"
					onClick={onUnassign}
				>
					Unassign
				</Button>
			</PopoverContent>
		</Popover>
	);
}

function CanvasItem({
	item,
	assignmentsByBench,
	roomWidthPx,
	roomHeightPx,
	roomWidthUnits,
	roomLengthUnits,
	onSeatClick,
	onUnassign,
}: {
	item: RoomLayoutItem;
	assignmentsByBench: Map<string, SeatAssignment[]>;
	roomWidthPx: number;
	roomHeightPx: number;
	roomWidthUnits: number;
	roomLengthUnits: number;
	onSeatClick: (bench: RoomLayoutItem, seatIndex: number, isOverflow: boolean) => void;
	onUnassign: (assignment: SeatAssignment) => void;
}) {
	const widthPx = (item.physicalWidth / roomWidthUnits) * roomWidthPx;
	const heightPx = (item.physicalHeight / roomLengthUnits) * roomHeightPx;
	const shortSide = Math.min(widthPx, heightPx);
	const dotSize = Math.max(Math.min(shortSide * 0.55, 20), 14);

	const benchAssignments = item.type === "bench" ? assignmentsByBench.get(item.id) || [] : [];
	const capacity = Number(item.seats) || 0;
	const highestIndex = benchAssignments.reduce((max, a) => Math.max(max, a.seatIndex), -1);
	const slotCount = Math.max(capacity, highestIndex + 1);
	const hasOverflow = benchAssignments.some((a) => a.isOverflow);
	const byIndex = new Map(benchAssignments.map((a) => [a.seatIndex, a]));

	return (
		<div
			className={`bg-background/90 absolute flex items-center justify-around overflow-hidden rounded border px-1 text-xs font-semibold shadow-sm ${
				hasOverflow ? "border-amber-500 ring-2 ring-amber-500/50" : "border-border"
			}`}
			style={{
				left: `${item.x}%`,
				top: `${item.y}%`,
				width: `${Math.max(widthPx, 28)}px`,
				height: `${Math.max(heightPx, 20)}px`,
				transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
			}}
		>
			{hasOverflow && (
				<TriangleAlert className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-amber-500 p-0.5 text-white" />
			)}
			{item.type === "bench" ? (
				<>
					{Array.from({ length: slotCount }).map((_, seatIndex) => {
						const assignment = byIndex.get(seatIndex);
						return (
							<SeatButton
								key={seatIndex}
								filled={Boolean(assignment)}
								size={dotSize}
								isOverflow={seatIndex >= capacity}
								assignment={assignment}
								onEmptyClick={() => onSeatClick(item, seatIndex, seatIndex >= capacity)}
								onUnassign={() => assignment && onUnassign(assignment)}
							/>
						);
					})}
					<button
						type="button"
						title="Add extra student to this bench"
						onClick={() => onSeatClick(item, slotCount, slotCount >= capacity)}
						className="border-muted-foreground/40 text-muted-foreground hover:bg-muted hover:text-foreground flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed"
						style={{ width: dotSize, height: dotSize }}
					>
						<Plus style={{ width: dotSize * 0.6, height: dotSize * 0.6 }} />
					</button>
				</>
			) : item.type === "fan" ? (
				<span className="text-[10px] opacity-70">⊕</span>
			) : item.type === "light" ? (
				<span className="text-[10px] opacity-70">💡</span>
			) : (
				<span
					className="line-clamp-1 px-1 text-center leading-tight"
					style={{ fontSize: Math.max(Math.min(heightPx * 0.35, 11), 7) }}
				>
					{item.label}
				</span>
			)}
		</div>
	);
}

export function RoomSeatCanvas({ examId, classRoomId }: { examId: string; classRoomId: string }) {
	const { data, isLoading, mutate } = useRoomCanvas(examId, classRoomId);
	const [dialogTarget, setDialogTarget] = useState<{
		benchItemId: string;
		seatIndex: number;
		isOverflow: boolean;
	} | null>(null);

	const assignmentsByBench = useMemo(() => {
		const map = new Map<string, SeatAssignment[]>();
		for (const assignment of data?.assignments || []) {
			const list = map.get(assignment.benchItemId) || [];
			list.push(assignment);
			map.set(assignment.benchItemId, list);
		}
		for (const list of map.values()) list.sort((a, b) => a.seatIndex - b.seatIndex);
		return map;
	}, [data?.assignments]);

	const roomWidth = Number(data?.room.roomWidth) || 0;
	const roomLength = Number(data?.room.roomLength) || 0;
	const { wrapRef, canvasPx } = useContainFitCanvas({
		widthUnits: roomWidth,
		lengthUnits: roomLength,
	});

	const items = data?.room.layoutConfig?.items || [];

	const seatedCount = data?.assignments.length || 0;
	const benchCount = items.filter((item) => item.type === "bench").length;

	const handleUnassign = async (assignment: SeatAssignment) => {
		try {
			await deleteSeatAssignment(examId, assignment.id);
			await mutate();
			toast.success("Seat unassigned");
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	if (isLoading || !data) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-20 w-full rounded-md" />
				<Skeleton className="h-[480px] w-full rounded-md" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card className="p-6 shadow-none ring-0">
				<div className="flex flex-row items-start justify-between gap-4">
					<div>
						<h2 className="text-lg font-semibold">{data.room.name}</h2>
						<p className="text-muted-foreground text-sm">
							Room {data.room.roomNo} · Capacity {data.room.capacity} · {seatedCount} seated
							across {benchCount} benches
						</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Classes in this exam: {data.examClasses.map((c) => c.className).join(", ") || "-"}
						</p>
					</div>
					<Button asChild variant="outline">
						<Link href={PATHS.EXAMINATIONS.SEAT_PLANNING.EXAM(examId)}>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>
					</Button>
				</div>
			</Card>

			<Card className="overflow-hidden p-5 shadow-none ring-0">
				<div ref={wrapRef} className="w-full">
					{roomWidth > 0 && roomLength > 0 ? (
						<div
							className="border-border bg-muted/10 relative mx-auto overflow-hidden rounded-md border-2"
							style={{ width: `${canvasPx.w}px`, height: `${canvasPx.h}px` }}
						>
							<RoomGridLayer cols={Math.floor(roomWidth)} rows={Math.floor(roomLength)} />
							<div className="bg-background/80 text-muted-foreground border-border absolute top-3 left-3 z-10 rounded border px-2 py-1 text-xs">
								{roomWidth} × {roomLength} {data.room.dimensionUnit}
							</div>
							{items.map((item) => (
								<CanvasItem
									key={item.id}
									item={item}
									assignmentsByBench={assignmentsByBench}
									roomWidthPx={canvasPx.w}
									roomHeightPx={canvasPx.h}
									roomWidthUnits={roomWidth}
									roomLengthUnits={roomLength}
									onSeatClick={(bench, seatIndex, isOverflow) =>
										setDialogTarget({ benchItemId: bench.id, seatIndex, isOverflow })
									}
									onUnassign={handleUnassign}
								/>
							))}
						</div>
					) : (
						<div className="border-border text-muted-foreground flex min-h-[300px] items-center justify-center rounded-md border border-dashed p-6 text-center text-sm">
							This room has no saved dimensions. Set up its visual layout first.
						</div>
					)}
				</div>
			</Card>

			{dialogTarget && (
				<SeatAssignDialog
					open
					onOpenChange={(open) => !open && setDialogTarget(null)}
					examId={examId}
					classRoomId={classRoomId}
					examClasses={data.examClasses}
					benchItemId={dialogTarget.benchItemId}
					seatIndex={dialogTarget.seatIndex}
					isOverflowSeat={dialogTarget.isOverflow}
					onAssigned={() => {
						mutate();
						setDialogTarget(null);
					}}
				/>
			)}
		</div>
	);
}
