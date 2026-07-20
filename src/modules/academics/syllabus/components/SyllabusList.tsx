"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Activity, Eye, History, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { SyllabusStatusEnum } from "../dto/syllabus.dto";
import { deleteSyllabus, updateSyllabusStatus } from "../hooks/use-syllabus-mutations";
import { useSyllabuses } from "../hooks/use-syllabuses";
import { SyllabusModel } from "../models/syllabus.model";
import { SyllabusCreate } from "./SyllabusCreate";
import { SyllabusDetailsSheet } from "./SyllabusDetailsSheet";
import SyllabusFilterBar from "./SyllabusFilterBar";

export type SyllabusFilter = {
	search: string;
	sessionId: string[];
	status: string[];
};

const initialFilters: SyllabusFilter = { search: "", sessionId: [], status: [] };

const format = (value?: string) =>
	value ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "-";

const syllabusStatusOptions = Object.values(SyllabusStatusEnum).map((value) => ({
	label: format(value),
	value,
}));

function SyllabusDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("Syllabus");

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
			<SyllabusDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

function SyllabusStatusCell({ syllabus }: { syllabus: SyllabusModel }) {
	const [pendingStatus, setPendingStatus] = useState<SyllabusStatusEnum | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const t = useTranslations("Syllabus");
	const tc = useTranslations("Common");

	const handleConfirm = async () => {
		if (!pendingStatus || pendingStatus === syllabus.status) return;

		setIsUpdating(true);
		try {
			await updateSyllabusStatus(syllabus.id, pendingStatus);
			toast.success(t("updateSuccess"));
			setPendingStatus(null);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<Select
				value={syllabus.status}
				disabled={isUpdating}
				onValueChange={(value) => {
					if (value === syllabus.status) return;
					setPendingStatus(value as SyllabusStatusEnum);
				}}
			>
				<SelectTrigger className="h-8 min-w-32">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{syllabusStatusOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<ConfirmationModal
				open={!!pendingStatus}
				onOpenChange={(open) => {
					if (!open && !isUpdating) setPendingStatus(null);
				}}
				onConfirm={handleConfirm}
				title={t("status")}
				description={
					pendingStatus
						? t("statusChangeDescription", { status: format(pendingStatus) })
						: undefined
				}
				confirmText={tc("changeStatus")}
				isLoading={isUpdating}
			/>
		</>
	);
}

export default function SyllabusList() {
	const [filter, setFilter] = useState<SyllabusFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [syllabusToDelete, setSyllabusToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations("Syllabus");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { data: syllabuses, meta, isLoading } = useSyllabuses({
		page,
		limit,
		search: filter.search,
		sessionId: filter.sessionId,
		status: filter.status,
	});

	const confirmDelete = async (id: string) => {
		setSyllabusToDelete(id);
		setIsDeleting(true);
		try {
			await deleteSyllabus(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setSyllabusToDelete(null);
		}
	};

	const columns: ColumnDef<SyllabusModel>[] = [
		{
			id: "exam",
			header: t("exam"),
			cell: ({ row }) => <span className="font-medium">{row.original.exam?.name || "-"}</span>,
		},
		{
			id: "class",
			header: t("class"),
			cell: ({ row }) => (
				<span>
					{row.original.class?.enName || "-"}
					{row.original.section?.name ? ` / ${row.original.section.name}` : ""}
				</span>
			),
		},
		{
			id: "content",
			header: t("content"),
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.totalSubjects} subject, {row.original.totalChapters} chapter, {row.original.totalTopics} topic
				</span>
			),
		},
		{
			id: "progress",
			header: t("progress"),
			cell: ({ row }) => (
				<div className="min-w-32 space-y-1">
					<div className="flex justify-between text-xs">
						<span>
							{row.original.completedTopics}/{row.original.totalTopics}
						</span>
						<span>{row.original.completionPercent.toFixed(0)}%</span>
					</div>
					<Progress value={row.original.completionPercent} className="h-1.5" />
				</div>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const syllabus = row.original;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.ACADEMICS.SYLLABUS.EDIT,
							PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						]}
						fallback={<span>{format(syllabus.status)}</span>}
					>
						<SyllabusStatusCell syllabus={syllabus} />
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const syllabus = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SYLLABUS.VIEW,
								PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<SyllabusDetailsAction id={syllabus.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SYLLABUS.EDIT,
								PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm" title={t("updateProgress")}>
								<Link href={PATHS.ACADEMICS.SYLLABUS.PROGRESS(syllabus.id)}>
									<Activity className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SYLLABUS.VIEW,
								PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm" title={t("history")}>
								<Link href={PATHS.ACADEMICS.SYLLABUS.HISTORY(syllabus.id)}>
									<History className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SYLLABUS.EDIT,
								PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm" title={t("editSyllabus")}>
								<Link href={PATHS.ACADEMICS.SYLLABUS.EDIT(syllabus.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SYLLABUS.DELETE,
								PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(syllabus.id)}
								title={t("deleteTitle")}
								description={t("deleteConfirm")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && syllabusToDelete === syllabus.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm" title={t("deleteTitle")}>
										<Trash2 />
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
				<SyllabusFilterBar filter={filter} setFilter={setFilter}>
					<SyllabusCreate />
				</SyllabusFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={syllabuses || []}
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
