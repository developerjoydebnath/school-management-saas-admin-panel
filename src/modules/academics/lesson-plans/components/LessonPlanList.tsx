"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
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
import { ArrowLeftRight, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
	LESSON_PLAN_STATUS_TRANSITIONS,
	LessonPlan,
	LessonPlanStatusEnum,
} from "../dto/lesson-plan.dto";
import { deleteLessonPlan, updateLessonPlanStatus } from "../hooks/use-lesson-plan-mutations";
import { useLessonPlans } from "../hooks/use-lesson-plans";
import { LessonPlanCreate } from "./LessonPlanCreate";
import LessonPlanDetailsSheet from "./LessonPlanDetailsSheet";
import LessonPlanFilterBar from "./LessonPlanFilterBar";

export type LessonPlanFilter = {
	search: string;
	status: string[];
	classId: string[];
	sectionId: string[];
	subjectId: string[];
	teacherId: string[];
};

const initialFilters: LessonPlanFilter = {
	search: "",
	status: [],
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

const statusVariant = (status: LessonPlanStatusEnum) => {
	switch (status) {
		case LessonPlanStatusEnum.PUBLISHED:
			return "default" as const;
		case LessonPlanStatusEnum.COMPLETED:
			return "secondary" as const;
		case LessonPlanStatusEnum.CANCELLED:
			return "destructive" as const;
		default:
			return "outline" as const;
	}
};

/** `hasOpened` defers the detail fetch until the row's sheet is actually opened. */
function LessonPlanDetailsAction({ id }: { id: string }) {
	const t = useTranslations("LessonPlans");
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
			<LessonPlanDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

/** Only the transitions the backend actually accepts are offered; the control disappears once terminal. */
function LessonPlanStatusAction({ item }: { item: LessonPlan }) {
	const t = useTranslations("LessonPlans");
	const tc = useTranslations("Common");
	const [pendingStatus, setPendingStatus] = useState<LessonPlanStatusEnum | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const nextOptions = LESSON_PLAN_STATUS_TRANSITIONS[item.status];
	if (!nextOptions.length) return null;

	const handleConfirm = async () => {
		if (!pendingStatus || pendingStatus === item.status) return;
		setIsUpdating(true);
		try {
			await updateLessonPlanStatus(item.id, pendingStatus);
			toast.success(t("statusUpdateSuccess"));
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

export default function LessonPlanList() {
	const t = useTranslations("LessonPlans");
	const tc = useTranslations("Common");
	const { selectedSessionId } = useSessionStore();
	const { user } = useAuthStore((state) => state.auth);

	const [filter, setFilter] = useState<LessonPlanFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data, meta, isLoading } = useLessonPlans({
		page,
		limit,
		sessionId: selectedSessionId || undefined,
		search: filter.search || undefined,
		status: filter.status.length ? filter.status.join(",") : undefined,
		classId: filter.classId.length ? filter.classId.join(",") : undefined,
		sectionId: filter.sectionId.length ? filter.sectionId.join(",") : undefined,
		subjectId: filter.subjectId.length ? filter.subjectId.join(",") : undefined,
		teacherId: filter.teacherId.length ? filter.teacherId.join(",") : undefined,
	});

	const confirmDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteLessonPlan(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeletingId(null);
		}
	};

	const columns: ColumnDef<LessonPlan>[] = [
		{
			id: "title",
			header: t("lessonTitle"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-0">
						<p className="truncate font-medium">{item.title}</p>
						<p className="text-muted-foreground truncate text-xs">{item.topic}</p>
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
			id: "subject",
			header: t("subject"),
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate text-sm">{row.original.subject?.enName}</p>
					<p className="text-muted-foreground text-xs">{row.original.teacher?.fullName}</p>
				</div>
			),
		},
		{
			id: "dateTime",
			header: t("date"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="space-y-0.5">
						<p className="text-sm tabular-nums">{formatDate(item.lessonDate)}</p>
						<p className="text-muted-foreground text-xs tabular-nums">
							{item.startTime} - {item.endTime}
						</p>
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
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.LESSON_PLANS.ALL,
								PERMISSIONS.ACADEMICS.LESSON_PLANS.VIEW,
							]}
						>
							<LessonPlanDetailsAction id={item.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.LESSON_PLANS.ALL,
								PERMISSIONS.ACADEMICS.LESSON_PLANS.EDIT,
							]}
						>
							<LessonPlanStatusAction item={item} />
							<Button asChild variant="outline" size="icon-sm" title={t("editLessonPlanTitle")}>
								<Link href={PATHS.ACADEMICS.LESSON_PLANS.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.LESSON_PLANS.ALL,
								PERMISSIONS.ACADEMICS.LESSON_PLANS.DELETE,
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
				<LessonPlanFilterBar filter={filter} setFilter={setFilter}>
					<LessonPlanCreate />
				</LessonPlanFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.LESSON_PLANS.ALL,
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
