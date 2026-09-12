"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { Download, IdCard, Info, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RoomListRow, SeatPlanSummaryRow } from "../dto/seat-planning.dto";
import { downloadSeatPlanPdf } from "../hooks/use-seat-planning-mutations";
import { useRooms, useSeatPlanSummary } from "../hooks/use-seat-planning";

function RoomInfoDialog({
	room,
	summary,
	open,
	onOpenChange,
}: {
	room: RoomListRow | null;
	summary?: SeatPlanSummaryRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const hasClasses = Boolean(summary?.byClass.length);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{room?.name}</DialogTitle>
					<DialogDescription>
						Room {room?.roomNo} · Capacity {room?.capacity}
					</DialogDescription>
				</DialogHeader>

				{!hasClasses ? (
					<p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
						No students seated in this room yet.
					</p>
				) : (
					<div className="overflow-hidden rounded-lg border">
						{/* Fixed column widths (not auto) so the header and each data row —
						    separate grid containers — line up consistently; auto tracks
						    would size independently per row based on that row's own content. */}
						<div className="bg-muted/40 grid grid-cols-[1fr_88px_64px] gap-4 px-3 py-2 text-xs font-medium">
							<span>Class</span>
							<span className="text-right">Roll Range</span>
							<span className="text-right">Seated</span>
						</div>
						<div className="divide-y">
							{summary!.byClass.map((c) => (
								<div
									key={c.classId}
									className="grid grid-cols-[1fr_88px_64px] items-center gap-4 px-3 py-2.5 text-sm"
								>
									<span className="min-w-0 truncate font-medium">{c.className}</span>
									<span className="text-muted-foreground text-right tabular-nums">
										{c.rollMin !== null && c.rollMax !== null
											? `${c.rollMin} – ${c.rollMax}`
											: "-"}
									</span>
									<span className="text-right tabular-nums">{c.seatedCount}</span>
								</div>
							))}
						</div>
						<div className="bg-primary/5 border-border flex items-center justify-between border-t px-3 py-3">
							<span className="flex items-center gap-2 text-sm font-semibold">
								<Users className="h-4 w-4" />
								Hall Total
							</span>
							<span className="text-base font-semibold tabular-nums">{summary!.seatedCount}</span>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export function SeatPlanningRoomsList({ examId }: { examId: string }) {
	const { data: rooms, isLoading } = useRooms(examId);
	const { data: summary } = useSeatPlanSummary(examId);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);
	const [infoRoomId, setInfoRoomId] = useState<string | null>(null);

	const summaryByRoom = new Map(summary.map((s) => [s.classRoomId, s]));
	const infoRoom = rooms.find((r) => r.id === infoRoomId) || null;

	const handleDownload = async (classRoomId?: string) => {
		setDownloadingId(classRoomId || "all");
		try {
			await downloadSeatPlanPdf({
				examId,
				classRoomId,
				fileName: classRoomId ? `seat-plan-${classRoomId}.pdf` : "seat-plan-all-rooms.pdf",
			});
		} finally {
			setDownloadingId(null);
		}
	};

	if (isLoading) {
		return (
			<Card className="space-y-3 p-5 shadow-none ring-0">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-16 w-full rounded-md" />
				))}
			</Card>
		);
	}

	return (
		<Card className="p-5 shadow-none ring-0">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="font-semibold">Class Rooms</h3>
					<p className="text-muted-foreground mt-1 text-sm">
						Open a room to seat students. A room can host students from multiple classes.
					</p>
				</div>
				<div className="flex items-center gap-2">
					{summary.length ? (
						<Button asChild variant="outline">
							<Link href={PATHS.EXAMINATIONS.SEAT_PLANNING.TOKENS(examId)}>
								<IdCard className="h-4 w-4" />
								Print All Tokens
							</Link>
						</Button>
					) : (
						<Button type="button" variant="outline" disabled>
							<IdCard className="h-4 w-4" />
							Print All Tokens
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						disabled={!summary.length || downloadingId !== null}
						onClick={() => handleDownload(undefined)}
					>
						<Download className="h-4 w-4" />
						{downloadingId === "all" ? "Preparing..." : "Download All (PDF)"}
					</Button>
				</div>
			</div>

			<div className="mt-4 space-y-3">
				{rooms.map((room) => (
					<div
						key={room.id}
						className="border-border flex flex-col gap-3 rounded-md border p-3 @xl/body:flex-row @xl/body:items-center @xl/body:justify-between"
					>
						<div className="min-w-0">
							<p className="font-medium">{room.name}</p>
							<p className="text-muted-foreground text-xs">
								Room {room.roomNo} · Capacity {room.capacity} · {room.seatedCount} seated
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="icon"
								title="Summary"
								onClick={() => setInfoRoomId(room.id)}
							>
								<Info className="h-4 w-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								title="Download PDF"
								disabled={!room.seatedCount || downloadingId !== null}
								onClick={() => handleDownload(room.id)}
							>
								<Download className="h-4 w-4" />
							</Button>
							{room.seatedCount ? (
								<Button asChild variant="outline" size="icon" title="Print Tokens">
									<Link
										href={`${PATHS.EXAMINATIONS.SEAT_PLANNING.TOKENS(examId)}?classRoomId=${room.id}`}
									>
										<IdCard className="h-4 w-4" />
									</Link>
								</Button>
							) : (
								<Button type="button" variant="outline" size="icon" title="Print Tokens" disabled>
									<IdCard className="h-4 w-4" />
								</Button>
							)}
							<Button asChild variant="outline">
								<Link href={PATHS.EXAMINATIONS.SEAT_PLANNING.ROOM(examId, room.id)}>
									Open Seat Plan
								</Link>
							</Button>
						</div>
					</div>
				))}
			</div>

			<RoomInfoDialog
				room={infoRoom}
				summary={infoRoomId ? summaryByRoom.get(infoRoomId) : undefined}
				open={infoRoomId !== null}
				onOpenChange={(open) => !open && setInfoRoomId(null)}
			/>
		</Card>
	);
}
