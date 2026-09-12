"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { useSessionStore } from "@/shared/stores/session-store";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Holiday, holidayCategoryColors } from "../dto/holiday.dto";
import { deleteHoliday } from "../hooks/use-holiday-mutations";
import { useHolidays } from "../hooks/use-holidays";
import HolidayFilterBar from "./HolidayFilterBar";
import HolidayStatusControl from "./HolidayStatusControl";

export type HolidayFilter = {
	search: string;
	category: string[];
	isClosed: string[];
};

const initialFilters: HolidayFilter = { search: "", category: [], isClosed: [] };

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

export default function HolidayList({
	onEditHoliday,
}: {
	onEditHoliday: (holiday: Holiday) => void;
}) {
	const t = useTranslations("Holidays");
	const tc = useTranslations("Common");
	const { selectedSessionId } = useSessionStore();

	const [filter, setFilter] = useState<HolidayFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data, meta, isLoading } = useHolidays({
		page,
		limit,
		sessionId: selectedSessionId || undefined,
		search: filter.search || undefined,
		category: filter.category.length ? filter.category.join(",") : undefined,
		isClosed: filter.isClosed[0],
	});

	const confirmDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteHoliday(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeletingId(null);
		}
	};

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	const columns: ColumnDef<Holiday>[] = [
		{
			id: "title",
			header: t("titleEn"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-0">
						<p className="truncate font-medium">{item.title}</p>
						{item.titleBn ? (
							<p className="text-muted-foreground truncate text-xs">{item.titleBn}</p>
						) : null}
					</div>
				);
			},
		},
		{
			id: "category",
			header: t("category"),
			cell: ({ row }) => {
				const colors = holidayCategoryColors[row.original.category];
				return (
					<Badge className={cn("border-transparent font-normal", colors.bg, colors.text)}>
						{t(row.original.category.toLowerCase())}
					</Badge>
				);
			},
		},
		{
			id: "dateRange",
			header: t("dateRange"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<span className="text-sm tabular-nums">
						{formatDate(item.startDate)}
						{item.startDate !== item.endDate ? ` - ${formatDate(item.endDate)}` : ""}
					</span>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => <HolidayStatusControl holiday={row.original} />,
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
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.EDIT,
							]}
						>
							<Button
								variant="outline"
								size="icon-sm"
								title={t("editHolidayTitle")}
								onClick={() => onEditHoliday(item)}
							>
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.DELETE,
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

	return (
		<div className="space-y-4">
			<HolidayFilterBar filter={filter} setFilter={setFilter} />
			<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
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
		</div>
	);
}
