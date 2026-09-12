"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { useSessionStore } from "@/shared/stores/session-store";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeftRight, Eye, Pencil, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
	ONLINE_CLASS_STATUS_TRANSITIONS,
	OnlineClass,
	OnlineClassStatusEnum,
} from "../dto/online-class.dto";
import { deleteOnlineClass, updateOnlineClassStatus } from "../hooks/use-online-class-mutations";
import { useOnlineClasses } from "../hooks/use-online-classes";
import { OnlineClassCreate } from "./OnlineClassCreate";
import OnlineClassDetailsSheet from "./OnlineClassDetailsSheet";
import OnlineClassFilterBar from "./OnlineClassFilterBar";

export type OnlineClassFilter = {
	search: string;
	status: string[];
	platform: string[];
	classId: string[];
	sectionId: string[];
	subjectId: string[];
	teacherId: string[];
};

const initialFilters: OnlineClassFilter = {
	search: "",
	status: [],
	platform: [],
	classId: [],
	sectionId: [],
	subjectId: [],
	teacherId: [],
};

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

/** `hasOpened` defers the detail fetch until the row's sheet is actually opened. */
function OnlineClassDetailsAction({ id }: { id: string }) {
	const t = useTranslations("OnlineClasses");
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm" title={t("detailsTitle")}>
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<OnlineClassDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

/**
 * A fresh transition into Scheduled or Ongoing emails the whole target
 * roster in the background (see OnlineClassesService.notifyInBackground),
 * so it goes through the same confirm-before-apply flow as the Exam status
 * control rather than applying instantly on click. Only the transitions the
 * backend actually accepts are offered — Completed and Cancelled are
 * terminal, so the control doesn't render for those.
 */
function OnlineClassStatusAction({ item }: { item: OnlineClass }) {
	const t = useTranslations("OnlineClasses");
	const tc = useTranslations("Common");
	const [pendingStatus, setPendingStatus] = useState<OnlineClassStatusEnum | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const nextOptions = ONLINE_CLASS_STATUS_TRANSITIONS[item.status];
	if (!nextOptions.length) return null;

	const handleConfirm = async () => {
		if (!pendingStatus || pendingStatus === item.status) return;
		setIsUpdating(true);
		try {
			const response = await updateOnlineClassStatus(item.id, pendingStatus);
			toast.success(t("statusUpdateSuccess"));
			if (response?.data?.notifying) toast.info(t("notifyingInBackground"));
			setPendingStatus(null);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon-sm" title={tc("changeStatus")}>
						<ArrowLeftRight className="text-muted-foreground hover:text-foreground h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>{tc("changeStatus")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{nextOptions.map((status) => (
						<DropdownMenuItem key={status} onClick={() => setPendingStatus(status)}>
							{t(status.toLowerCase())}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmationModal
				open={!!pendingStatus}
				onOpenChange={(nextOpen) => {
					if (!nextOpen && !isUpdating) setPendingStatus(null);
				}}
				onConfirm={handleConfirm}
				title={t("statusChangeTitle")}
				description={
					pendingStatus
						? t("statusChangeDescription", { status: t(pendingStatus.toLowerCase()) })
						: undefined
				}
				confirmText={tc("changeStatus")}
				isLoading={isUpdating}
			/>
		</>
	);
}

export default function OnlineClassList() {
	const t = useTranslations("OnlineClasses");
	const tc = useTranslations("Common");
	const { selectedSessionId } = useSessionStore();
	const { user } = useAuthStore((state) => state.auth);

	const [filter, setFilter] = useState<OnlineClassFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data, meta, isLoading } = useOnlineClasses({
		page,
		limit,
		sessionId: selectedSessionId || undefined,
		search: filter.search || undefined,
		status: filter.status.length ? filter.status.join(",") : undefined,
		platform: filter.platform.length ? filter.platform.join(",") : undefined,
		classId: filter.classId.length ? filter.classId.join(",") : undefined,
		sectionId: filter.sectionId.length ? filter.sectionId.join(",") : undefined,
		subjectId: filter.subjectId.length ? filter.subjectId.join(",") : undefined,
		teacherId: filter.teacherId.length ? filter.teacherId.join(",") : undefined,
	});

	const confirmDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteOnlineClass(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeletingId(null);
		}
	};

	const columns: ColumnDef<OnlineClass>[] = [
		{
			id: "title",
			header: t("classTitle"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-0">
						<p className="truncate font-medium">{item.title}</p>
						<p className="text-muted-foreground text-xs">
							{item.subject?.enName}
							{item.teacher?.fullName ? ` · ${item.teacher.fullName}` : ""}
						</p>
					</div>
				);
			},
		},
		{
			id: "target",
			header: t("classSection"),
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.class?.enName || "-"}
					{row.original.section?.name ? ` / ${row.original.section.name}` : ` / ${t("allSections")}`}
				</span>
			),
		},
		{
			id: "dateTime",
			header: t("date"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="space-y-0.5">
						<p className="text-sm tabular-nums">{formatDate(item.classDate)}</p>
						<p className="text-muted-foreground text-xs tabular-nums">
							{item.startTime} - {item.endTime}
						</p>
					</div>
				);
			},
		},
		{
			id: "platform",
			header: t("platform"),
			cell: ({ row }) => (
				<Badge variant="secondary" className="font-normal">
					{row.original.platform.charAt(0) + row.original.platform.slice(1).toLowerCase()}
				</Badge>
			),
		},
		{
			id: "attendance",
			header: t("attendanceColumn"),
			cell: ({ row }) => {
				const s = row.original.attendanceSummary;
				// Nothing marked yet reads better as a dash than as 0%.
				if (!s || s.marked === 0) {
					return <span className="text-muted-foreground text-xs">—</span>;
				}
				const percent = Math.round((s.present / s.marked) * 100);
				return (
					<div className="min-w-28 space-y-1">
						<div className="flex justify-between text-xs tabular-nums">
							<span>
								{s.present}{t("presentShort")} / {s.absent}{t("absentShort")}
							</span>
							<span>{percent}%</span>
						</div>
						<Progress value={percent} className="h-1.5" />
					</div>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<Badge variant={statusVariant(row.original.status)} className="font-normal">
					{t(row.original.status.toLowerCase())}
				</Badge>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const item = row.original;
				const canJoin =
					!!item.meetingLink &&
					(item.status === OnlineClassStatusEnum.SCHEDULED ||
						item.status === OnlineClassStatusEnum.ONGOING);
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.VIEW,
							]}
						>
							<OnlineClassDetailsAction id={item.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.EDIT,
							]}
						>
							<OnlineClassStatusAction item={item} />
						</PermissionGuard>
						{canJoin ? (
							<Button asChild variant="default" size="icon-sm" title={t("joinClass")}>
								<Link href={item.meetingLink} target="_blank" rel="noopener noreferrer">
									<Video className="h-4 w-4" />
								</Link>
							</Button>
						) : null}
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.EDIT,
							]}
						>
							<Button asChild variant="outline" size="icon-sm" title={t("editOnlineClassTitle")}>
								<Link href={PATHS.ACADEMICS.ONLINE_CLASSES.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ONLINE_CLASSES.DELETE,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(item.id)}
								title={t("deleteConfirmTitle")}
								description={t("deleteConfirmDesc")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={deletingId === item.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm">
										<Trash2 className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
							</ConfirmationModal>
						</PermissionGuard>
					</div>
				);
			},
		},
	];

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<OnlineClassFilterBar filter={filter} setFilter={setFilter}>
					<OnlineClassCreate />
				</OnlineClassFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.ONLINE_CLASSES.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={data}
					isLoading={isLoading}
					pagination={
						meta
							? {
									page: meta.page,
									limit: meta.limit,
									total: meta.total,
									totalPages: meta.totalPages,
									onPageChange: setPage,
									onLimitChange: setLimit,
								}
							: undefined
					}
				/>
			</CardContent>
		</Card>
	);
}
