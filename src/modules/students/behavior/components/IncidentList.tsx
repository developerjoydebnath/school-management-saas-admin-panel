"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { PhoneCall, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { IncidentListItem } from "../dto/incident.dto";
import { deleteIncident } from "../hooks/use-behavior-incident-mutations";
import { useIncidents } from "../hooks/use-behavior-incidents";
import BehaviorFilterBar from "./BehaviorFilterBar";

export type IncidentFilter = {
	search: string;
	type: string[];
	category: string[];
	actionTaken: string[];
	status: string[];
	sessionId: string[];
	classId: string[];
	sectionId: string[];
	dateFrom: string;
	dateTo: string;
};

const initialFilters: IncidentFilter = {
	search: "",
	type: [],
	category: [],
	actionTaken: [],
	status: [],
	sessionId: [],
	classId: [],
	sectionId: [],
	dateFrom: "",
	dateTo: "",
};

export function IncidentList() {
	const t = useTranslations("StudentBehavior");
	const tc = useTranslations("Common");
	const [filter, setFilter] = useState<IncidentFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data, meta, isLoading } = useIncidents({
		page,
		limit,
		search: filter.search,
		type: filter.type,
		category: filter.category,
		actionTaken: filter.actionTaken,
		status: filter.status,
		sessionId: filter.sessionId[0] || "",
		classId: filter.classId[0] || "",
		sectionId: filter.sectionId[0] || "",
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	const confirmDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteIncident(id);
			toast.success(t("dialog.deleteSuccess"));
		} catch {
			// Global axios interceptor already shows a toast for the error.
		} finally {
			setDeletingId(null);
		}
	};

	const getTypeBadge = (type: string) => {
		switch (type) {
			case "positive":
				return (
					<Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
						{t("filters.positive")}
					</Badge>
				);
			case "negative":
				return <Badge variant="destructive">{t("filters.negative")}</Badge>;
			default:
				return <Badge variant="secondary">{t("filters.neutral")}</Badge>;
		}
	};

	const getStatusBadge = (status: string) => {
		if (status === "resolved") {
			return (
				<Badge
					variant="outline"
					className="border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
				>
					{t("statuses.resolved")}
				</Badge>
			);
		}
		return (
			<Badge
				variant="outline"
				className="border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
			>
				{t("statuses.pending")}
			</Badge>
		);
	};

	const columns: ColumnDef<IncidentListItem>[] = [
		{
			id: "date",
			header: t("table.date"),
			cell: ({ row }) => (
				<span className="font-medium">{format(new Date(row.original.date), "dd MMM, yyyy")}</span>
			),
		},
		{
			id: "student",
			header: t("table.student"),
			cell: ({ row }) => (
				<div>
					<p className="font-medium">{row.original.studentName}</p>
					<p className="text-muted-foreground text-xs">
						{row.original.studentCode}
						{row.original.className ? ` • ${row.original.className}` : ""}
						{row.original.sectionName ? ` (${row.original.sectionName})` : ""}
					</p>
				</div>
			),
		},
		{
			id: "type",
			header: t("table.type"),
			cell: ({ row }) => getTypeBadge(row.original.type),
		},
		{
			id: "category",
			header: t("table.category"),
			cell: ({ row }) => (
				<span className="text-sm">{t(`categories.${row.original.category}` as any)}</span>
			),
		},
		{
			id: "actionTaken",
			header: t("table.actionTaken"),
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5">
					<span className="text-muted-foreground text-sm">
						{t(`actions.${row.original.actionTaken}` as any)}
					</span>
					{row.original.guardianCallRequired && (
						<PhoneCall className="text-destructive h-3.5 w-3.5" />
					)}
				</div>
			),
		},
		{
			id: "status",
			header: t("table.status"),
			cell: ({ row }) => getStatusBadge(row.original.status),
		},
		{
			id: "actions",
			header: () => <div className="text-right">{t("table.actions")}</div>,
			cell: ({ row }) => (
				<div className="flex justify-end gap-2">
					<PermissionGuard
						permissions={[PERMISSIONS.STUDENTS.BEHAVIOR.EDIT, PERMISSIONS.STUDENTS.BEHAVIOR.ALL]}
					>
						<Link href={PATHS.STUDENTS.BEHAVIOR.EDIT(row.original.id)} passHref>
							<Button variant="outline" size="icon-sm">
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</Link>
					</PermissionGuard>
					<PermissionGuard
						permissions={[PERMISSIONS.STUDENTS.BEHAVIOR.DELETE, PERMISSIONS.STUDENTS.BEHAVIOR.ALL]}
					>
						<ConfirmationModal
							onConfirm={() => confirmDelete(row.original.id)}
							title={t("dialog.deleteTitle")}
							description={t("dialog.deleteDescription")}
							confirmText={tc("delete")}
							variant="destructive"
							isLoading={deletingId === row.original.id}
						>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="icon-sm">
									<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
								</Button>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</PermissionGuard>
				</div>
			),
		},
	];

	return (
		<Card className="@container/page p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0">
				<BehaviorFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
				<DataTable
					data={data || []}
					isLoading={isLoading}
					pagination={
						meta
							? {
									page: meta.page,
									limit: meta.limit,
									total: meta.total,
									totalPages: meta.totalPages,
									onPageChange: setPage,
									onLimitChange: (nextLimit: number) => {
										setLimit(nextLimit);
										setPage(1);
									},
								}
							: undefined
					}
					columns={columns}
				/>
			</CardContent>
		</Card>
	);
}
