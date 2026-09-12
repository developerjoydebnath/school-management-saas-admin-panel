"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Save, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	OnlineClassAttendanceStatusEnum,
	OnlineClassStatusEnum,
	attendanceStatusOptions,
} from "../dto/online-class.dto";
import { saveOnlineClassAttendance } from "../hooks/use-online-class-mutations";
import { useOnlineClass, useOnlineClassRoster } from "../hooks/use-online-classes";

type Props = {
	id: string;
	open: boolean;
};

function Item({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<div className="text-sm">{value || "-"}</div>
		</div>
	);
}

const titleCase = (value: string) =>
	value
		.split("_")
		.map((part) => part.charAt(0) + part.slice(1).toLowerCase())
		.join(" ");

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

const statusVariant = (status: OnlineClassStatusEnum) => {
	switch (status) {
		case OnlineClassStatusEnum.SCHEDULED:
		case OnlineClassStatusEnum.ONGOING:
			return "default" as const;
		case OnlineClassStatusEnum.COMPLETED:
			return "secondary" as const;
		case OnlineClassStatusEnum.CANCELLED:
			return "destructive" as const;
		default:
			return "outline" as const;
	}
};

const attendanceVariant = (status: OnlineClassAttendanceStatusEnum) => {
	switch (status) {
		case OnlineClassAttendanceStatusEnum.PRESENT:
			return "default" as const;
		case OnlineClassAttendanceStatusEnum.ABSENT:
			return "destructive" as const;
		default:
			return "secondary" as const;
	}
};

/**
 * Present/absent marking only makes sense while the class is actually
 * happening — the backend rejects a save outside Ongoing, and `editable`
 * (from the roster response, not re-derived from `data.status` here) is the
 * authoritative signal for whether the controls should be live.
 */
function OnlineClassAttendanceSection({ id, open }: { id: string; open: boolean }) {
	const t = useTranslations("OnlineClasses");
	const { roster, editable, isLoading, mutate } = useOnlineClassRoster(open ? id : undefined);
	const [draft, setDraft] = useState<Record<string, OnlineClassAttendanceStatusEnum>>({});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!roster.length) return;
		setDraft(Object.fromEntries(roster.map((row) => [row.student.id, row.status])));
	}, [roster]);

	const setRowStatus = (studentId: string, status: OnlineClassAttendanceStatusEnum) =>
		setDraft((current) => ({ ...current, [studentId]: status }));

	const markAll = (status: OnlineClassAttendanceStatusEnum) =>
		setDraft((current) =>
			Object.fromEntries(Object.keys(current).map((studentId) => [studentId, status]))
		);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await saveOnlineClassAttendance(
				id,
				Object.entries(draft).map(([studentId, status]) => ({ studentId, status }))
			);
			toast.success(t("attendanceSaved"));
			await mutate();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section className="bg-card rounded-md border p-4">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div>
					<h3 className="text-sm font-normal">{t("students")}</h3>
					<p className="text-muted-foreground mt-1 text-xs">
						{editable ? t("attendanceEditableHint") : t("attendanceLockedHint")}
					</p>
				</div>
				{editable && roster.length ? (
					<Button type="button" size="sm" onClick={handleSave} disabled={isSaving}>
						<Save className="h-4 w-4" />
						{isSaving ? t("saving") : t("saveAttendance")}
					</Button>
				) : null}
			</div>

			{isLoading ? (
				<div className="mt-3 space-y-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-full" />
					))}
				</div>
			) : !roster.length ? (
				<p className="text-muted-foreground mt-3 text-xs">{t("noStudents")}</p>
			) : (
				<>
					{editable ? (
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<span className="text-muted-foreground text-xs">{t("markAll")}:</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => markAll(OnlineClassAttendanceStatusEnum.PRESENT)}
							>
								{t("present")}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => markAll(OnlineClassAttendanceStatusEnum.ABSENT)}
							>
								{t("absent")}
							</Button>
						</div>
					) : null}

					<div className="mt-3">
						<div className="bg-muted/40 text-muted-foreground grid grid-cols-[1fr_140px] gap-3 rounded-t-md px-3 py-2 text-xs font-medium">
							<span>{t("student")}</span>
							<span>{t("status")}</span>
						</div>
						<div className="divide-y rounded-b-md border border-t-0">
							{roster.map((row) => {
								const status = draft[row.student.id] ?? row.status;
								return (
									<div
										key={row.student.id}
										className="grid grid-cols-[1fr_140px] items-center gap-3 px-3 py-2"
									>
										<div className="min-w-0">
											<p className="truncate text-sm">{row.student.fullNameEn}</p>
											<p className="text-muted-foreground text-xs">
												{row.student.rollNumber ? `Roll ${row.student.rollNumber} · ` : ""}
												{row.student.studentIdNo}
											</p>
										</div>
										{editable ? (
											<NativeSelect
												value={status}
												onChange={(e) =>
													setRowStatus(
														row.student.id,
														e.target.value as OnlineClassAttendanceStatusEnum
													)
												}
											>
												{attendanceStatusOptions.map((option) => (
													<NativeSelectOption key={option.value} value={option.value}>
														{option.label}
													</NativeSelectOption>
												))}
											</NativeSelect>
										) : (
											<Badge variant={attendanceVariant(status)} className="w-fit font-normal">
												{t(status.toLowerCase())}
											</Badge>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</>
			)}
		</section>
	);
}

export default function OnlineClassDetailsSheet({ id, open }: Props) {
	const t = useTranslations("OnlineClasses");
	const { data, isLoading } = useOnlineClass(open ? id : undefined);

	const canJoin =
		!!data?.meetingLink &&
		(data.status === OnlineClassStatusEnum.SCHEDULED ||
			data.status === OnlineClassStatusEnum.ONGOING);

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[56vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">{t("detailsTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>

			<ScrollArea className="h-[calc(100vh-73px)]">
				<div className="space-y-4 p-4">
					{isLoading || !data ? (
						<div className="space-y-3">
							<Skeleton className="h-40 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					) : (
						<>
							<section className="bg-card rounded-md border p-4">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="min-w-0">
										<h3 className="text-sm font-medium">{data.title}</h3>
										{data.titleBn ? (
											<p className="text-muted-foreground mt-0.5 text-xs">{data.titleBn}</p>
										) : null}
									</div>
									<div className="flex flex-wrap items-center gap-1.5">
										<Badge variant="secondary" className="font-normal">
											{titleCase(data.platform)}
										</Badge>
										<Badge variant={statusVariant(data.status)} className="font-normal">
											{titleCase(data.status)}
										</Badge>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-1 gap-3 @xl/body:grid-cols-3">
									<Item
										label={t("classSection")}
										value={`${data.class?.enName || "-"} / ${
											data.section?.name || t("allSections")
										}`}
									/>
									<Item label={t("subject")} value={data.subject?.enName} />
									<Item label={t("teacher")} value={data.teacher?.fullName} />
									<Item label={t("date")} value={formatDate(data.classDate)} />
									<Item
										label={t("startTime")}
										value={`${data.startTime} - ${data.endTime}`}
									/>
									<Item
										label={t("targetStudents")}
										value={data.targetStudentCount ?? "-"}
									/>
								</div>

								{canJoin ? (
									<Button asChild className="mt-4">
										<Link href={data.meetingLink} target="_blank" rel="noopener noreferrer">
											<Video className="h-4 w-4" />
											{t("joinClass")}
										</Link>
									</Button>
								) : null}
							</section>

							<section className="bg-card rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("meetingDetails")}</h3>
								<div className="mt-3 grid grid-cols-1 gap-3 @xl/body:grid-cols-3">
									<Item
										label={t("meetingLink")}
										value={
											<Link
												href={data.meetingLink}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary break-all hover:underline"
											>
												{data.meetingLink}
											</Link>
										}
									/>
									<Item label={t("meetingId")} value={data.meetingId} />
									<Item label={t("passcode")} value={data.passcode} />
								</div>
							</section>

							{data.description ? (
								<section className="bg-card rounded-md border p-4">
									<h3 className="text-sm font-normal">{t("descriptionLabel")}</h3>
									<p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
										{data.description}
									</p>
								</section>
							) : null}

							<section className="bg-card rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("notification")}</h3>
								{data.notifiedAt ? (
									<p className="text-muted-foreground mt-2 text-xs">
										{t("notifiedAt", {
											date: new Date(data.notifiedAt).toLocaleString(),
										})}
									</p>
								) : (
									<p className="text-muted-foreground mt-2 text-xs">
										{data.status === OnlineClassStatusEnum.DRAFT
											? t("notificationPendingDraft")
											: t("notificationNotSent")}
									</p>
								)}
								<p className="text-muted-foreground mt-1 text-[11px]">
									{t("notificationDeliveryHint")}
								</p>
							</section>

							<OnlineClassAttendanceSection id={id} open={open} />
						</>
					)}
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
