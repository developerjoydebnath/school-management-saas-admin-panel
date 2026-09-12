"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ExamClassOption } from "../dto/seat-planning.dto";
import { useAvailableStudents } from "../hooks/use-seat-planning";
import { createSeatAssignment } from "../hooks/use-seat-planning-mutations";

function localizedLabel(value: unknown, locale: string) {
	return typeof value === "object" && value !== null ? getLocalizedName(value, locale) : String(value ?? "");
}

export function SeatAssignDialog({
	open,
	onOpenChange,
	examId,
	classRoomId,
	examClasses,
	benchItemId,
	seatIndex,
	isOverflowSeat,
	onAssigned,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	examId: string;
	classRoomId: string;
	examClasses: ExamClassOption[];
	benchItemId: string;
	seatIndex: number;
	isOverflowSeat: boolean;
	onAssigned: () => void;
}) {
	const { selectedSessionId } = useSessionStore();
	const locale = useLocale();
	const [sessionId, setSessionId] = useState("");
	const [classId, setClassId] = useState("");
	const [sectionId, setSectionId] = useState("");
	const [search, setSearch] = useState("");
	const [assigningId, setAssigningId] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setSessionId(selectedSessionId || "");
			setClassId("");
			setSectionId("");
			setSearch("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	// Same data source SessionSelect uses, rendered as a plain <select> instead
	// of Radix Select — Radix Select opens a portalled popup, which is what
	// makes clicking "outside the options but inside the dialog" a fragile
	// interaction; a native <select>'s dropdown is browser-native chrome and
	// never fights the Dialog's own outside-click/focus handling.
	const { data: sessionsResponse } = useSWR(open ? "/sessions/active-list" : null);
	const sessions = useMemo(() => {
		const payload = sessionsResponse?.data || sessionsResponse || [];
		return (Array.isArray(payload) ? payload : []).filter((s: any) => s.status === "ACTIVE");
	}, [sessionsResponse]);

	// Same data source SectionSelect uses.
	const sectionsEndpoint = classId && sessionId
		? "/session-class-sections/setup"
		: classId
			? "/classes/sections/active-list"
			: null;
	const { data: sectionsResponse } = useSWR(
		open ? sectionsEndpoint : null,
		classId && sessionId ? { classId, sessionId } : { classId }
	);
	const sections = useMemo(() => {
		const payload = sectionsResponse?.data || sectionsResponse;
		if (Array.isArray(payload?.items)) {
			return payload.items
				.filter((item: any) => item?.status === "ACTIVE" && item?.section?.id)
				.map((item: any) => ({
					id: item.section.id,
					name: item.section.name,
					bnName: item.section.bnName,
				}));
		}
		return Array.isArray(payload) ? payload : [];
	}, [sectionsResponse]);

	// Clear a stale section if the class/session change made it unavailable.
	useEffect(() => {
		if (sectionId && !sections.some((s: any) => s.id === sectionId)) {
			setSectionId("");
		}
	}, [sections, sectionId]);

	const selectedExamClass = examClasses.find((c) => c.classId === classId);

	const { data: students, isLoading } = useAvailableStudents(open && sessionId && classId ? examId : undefined, {
		sessionId: sessionId || undefined,
		classId: classId || undefined,
		sectionId: sectionId || undefined,
		search: search || undefined,
	});

	const handleAssign = async (studentId: string) => {
		if (!selectedExamClass) return;
		setAssigningId(studentId);
		try {
			await createSeatAssignment(examId, classRoomId, {
				studentId,
				classId,
				benchItemId,
				seatIndex,
			});
			toast.success("Student seated successfully");
			onAssigned();
			onOpenChange(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setAssigningId(null);
		}
	};

	const searchEnabled = Boolean(sessionId && classId);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-lg overflow-hidden">
				<DialogHeader>
					<DialogTitle>Assign Seat</DialogTitle>
					<DialogDescription>
						Seat {seatIndex + 1}
						{isOverflowSeat ? " · Overflow seat" : ""}
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-3">
					<NativeSelect
						value={sessionId}
						onChange={(e) => {
							setSessionId(e.target.value);
							setClassId("");
							setSectionId("");
						}}
					>
						<NativeSelectOption value="">Select session</NativeSelectOption>
						{sessions.map((s: any) => (
							<NativeSelectOption key={s.id} value={s.id}>
								{localizedLabel(s.name, locale)}
							</NativeSelectOption>
						))}
					</NativeSelect>

					<NativeSelect
						value={classId}
						onChange={(e) => {
							setClassId(e.target.value);
							setSectionId("");
						}}
						disabled={!sessionId}
					>
						<NativeSelectOption value="">
							{!sessionId ? "Select a session first" : "Select class"}
						</NativeSelectOption>
						{examClasses.map((c) => (
							<NativeSelectOption key={c.classId} value={c.classId}>
								{c.className}
							</NativeSelectOption>
						))}
					</NativeSelect>
				</div>

				<NativeSelect
					value={sectionId}
					onChange={(e) => setSectionId(e.target.value)}
					disabled={!classId}
				>
					<NativeSelectOption value="">
						{!classId ? "Select a class first" : "Select section"}
					</NativeSelectOption>
					{sections.map((s: any) => (
						<NativeSelectOption key={s.id} value={s.id}>
							{localizedLabel(s.name, locale)}
						</NativeSelectOption>
					))}
				</NativeSelect>

				<Input
					placeholder={
						searchEnabled ? "Search by name, ID, or roll" : "Select session and class first"
					}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					disabled={!searchEnabled}
				/>

				<ScrollArea className="h-72 rounded-md border">
					<div className="divide-y">
						{!searchEnabled ? (
							<p className="text-muted-foreground p-4 text-sm">
								Select a session and class to see unassigned students.
							</p>
						) : isLoading ? (
							<p className="text-muted-foreground p-4 text-sm">Loading...</p>
						) : students.length === 0 ? (
							<p className="text-muted-foreground p-4 text-sm">
								No unassigned students match this filter.
							</p>
						) : (
							students.map((s) => (
								<button
									key={s.id}
									type="button"
									disabled={assigningId === s.id}
									onClick={() => handleAssign(s.id)}
									className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 p-3 text-left text-sm disabled:opacity-50"
								>
									<div className="min-w-0">
										<p className="truncate font-medium">{s.fullName}</p>
										<p className="text-muted-foreground text-xs">
											{s.studentId}
											{s.roll ? ` · Roll ${s.roll}` : ""}
											{s.sectionName ? ` · ${s.sectionName}` : ""}
										</p>
									</div>
									<Badge variant="secondary" className="shrink-0">
										{assigningId === s.id ? "Seating..." : "Select"}
									</Badge>
								</button>
							))
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
