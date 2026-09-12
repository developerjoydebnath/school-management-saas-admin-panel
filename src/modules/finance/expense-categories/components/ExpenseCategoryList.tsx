"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Lock, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
	deleteExpenseCategory,
	updateExpenseCategory,
} from "../hooks/use-expense-category-mutations";
import { useExpenseCategories } from "../hooks/use-expense-categories";
import { ExpenseCategoryModel } from "../models/expense-category.model";
import { ExpenseCategoryCreate } from "./ExpenseCategoryCreate";
import ExpenseCategoryFilterBar from "./ExpenseCategoryFilterBar";

export type ExpenseCategoryFilter = {
	search: string;
	isActive: string[];
	recurrence: string[];
	source: string[];
};

const initialFilters: ExpenseCategoryFilter = {
	search: "",
	isActive: [],
	recurrence: [],
	source: [],
};

const intervalLabels: Record<string, string> = {
	MONTHLY: "Monthly",
	QUARTERLY: "Quarterly",
	HALF_YEARLY: "Half-yearly",
	YEARLY: "Yearly",
};

const sourceLabels: Record<string, string> = {
	MANUAL: "Manual",
	INVENTORY: "Inventory",
	PAYROLL: "Payroll",
};

export default function ExpenseCategoryList() {
	const [filter, setFilter] = useState<ExpenseCategoryFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [itemToChangeStatus, setItemToChangeStatus] = useState<string | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("ExpenseCategories");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { categories, meta, isLoading } = useExpenseCategories({
		page,
		limit,
		search: filter.search,
		isActive: filter.isActive.length === 1 ? filter.isActive[0] : undefined,
		recurrence: filter.recurrence,
		source: filter.source,
	});

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsDeleting(true);
		try {
			await deleteExpenseCategory(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const confirmStatusChange = async (item: ExpenseCategoryModel, newStatus: boolean) => {
		setItemToChangeStatus(item.id);
		setIsChangingStatus(true);
		try {
			await updateExpenseCategory(item.id, { isActive: newStatus });
			toast.success(`Status updated to ${newStatus ? "Active" : "Inactive"}`);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsChangingStatus(false);
			setItemToChangeStatus(null);
		}
	};

	const columns: ColumnDef<ExpenseCategoryModel>[] = [
		{
			id: "name",
			header: t("name"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-40 space-y-0.5">
						<div className="flex items-center gap-1.5">
							<span className="font-medium">{item.name}</span>
							{item.isSystem && (
								<Lock className="text-muted-foreground size-3" aria-label={t("builtIn")} />
							)}
						</div>
						{item.nameBn && <p className="text-muted-foreground text-xs">{item.nameBn}</p>}
					</div>
				);
			},
		},
		{
			id: "recurrence",
			header: t("recurrence"),
			cell: ({ row }) => {
				const item = row.original;
				const isRecurring = item.recurrence === "RECURRING";
				return (
					<div className="flex items-center gap-2">
						<Badge variant={isRecurring ? "default" : "outline"}>
							{isRecurring ? t("recurring") : t("oneOff")}
						</Badge>
						{isRecurring && item.interval && (
							<span className="text-muted-foreground text-xs">
								{intervalLabels[item.interval] || item.interval}
							</span>
						)}
					</div>
				);
			},
		},
		{
			id: "source",
			header: t("source"),
			cell: ({ row }) => (
				<Badge variant="outline">{sourceLabels[row.original.source] || row.original.source}</Badge>
			),
		},
		{
			id: "sortOrder",
			header: t("sortOrder"),
			cell: ({ row }) => <span className="tabular-nums">{row.original.sortOrder}</span>,
		},
		{
			id: "isActive",
			header: t("status"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.EDIT,
							PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.ALL,
							PERMISSIONS.FINANCE.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(item, !item.isActive)}
							title={tc("changeStatus")}
							description={item.isActive ? tc("changeToInactiveDesc") : tc("changeToActiveDesc")}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && itemToChangeStatus === item.id}
						>
							<AlertDialogTrigger asChild>
								<div className="group flex w-fit cursor-pointer items-center gap-2">
									<Switch checked={item.isActive} className="pointer-events-none" />
									<span className="text-sm">{item.isActive ? "Active" : "Inactive"}</span>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.EDIT,
								PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.ALL,
								PERMISSIONS.FINANCE.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.FINANCE.EXPENSE_CATEGORIES.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						{/* Seeded categories back the automatic Inventory entries and historical
						    rows, so the API refuses to delete them. Hide the button rather than
						    let someone click into a guaranteed error. */}
						{!item.isSystem && (
							<PermissionGuard
								permissions={[
									PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.DELETE,
									PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.ALL,
									PERMISSIONS.FINANCE.ALL,
								]}
							>
								<ConfirmationModal
									onConfirm={() => confirmDelete(item.id)}
									title={t("deleteTitle")}
									description={t("deleteDescription")}
									confirmText={tc("delete")}
									variant="destructive"
									isLoading={isDeleting && itemToDelete === item.id}
								>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" size="icon-sm">
											<Trash2 />
										</Button>
									</AlertDialogTrigger>
								</ConfirmationModal>
							</PermissionGuard>
						)}
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
				<ExpenseCategoryFilterBar filter={filter} setFilter={setFilter}>
					<ExpenseCategoryCreate />
				</ExpenseCategoryFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.ALL,
							PERMISSIONS.FINANCE.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={categories || []}
					isLoading={isLoading}
					pagination={{
						page: meta.page,
						limit: meta.limit,
						total: meta.total,
						totalPages: meta.totalPages,
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
				/>
			</CardContent>
		</Card>
	);
}
