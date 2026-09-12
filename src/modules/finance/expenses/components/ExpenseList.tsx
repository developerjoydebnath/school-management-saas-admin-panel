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
import { useAuthStore } from "@/shared/stores/authStore";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Boxes, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteExpense } from "../hooks/use-expense-mutations";
import { useExpenses } from "../hooks/use-expenses";
import { ExpenseModel } from "../models/expense.model";
import { ExpenseCreate } from "./ExpenseCreate";
import ExpenseFilterBar from "./ExpenseFilterBar";

export type ExpenseFilter = {
	search: string;
	categoryId: string[];
	status: string[];
	paymentMethod: string[];
	source: string[];
	month: string;
	dateFrom: string;
	dateTo: string;
};

const initialFilters: ExpenseFilter = {
	search: "",
	categoryId: [],
	status: [],
	paymentMethod: [],
	source: [],
	month: "",
	dateFrom: "",
	dateTo: "",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	PAID: "default",
	PENDING: "secondary",
	CANCELLED: "destructive",
};

const paymentMethodLabels: Record<string, string> = {
	cash: "Cash",
	bank: "Bank",
	cheque: "Cheque",
	mobile_banking: "Mobile Banking",
	card: "Card",
	other: "Other",
};

function formatMoney(value: unknown) {
	const amount = Number(value || 0);
	return Number.isFinite(amount)
		? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
		: "0.00";
}

export default function ExpenseList() {
	const [filter, setFilter] = useState<ExpenseFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations("Expenses");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { expenses, filteredTotal, meta, isLoading } = useExpenses({
		page,
		limit,
		search: filter.search,
		categoryId: filter.categoryId,
		status: filter.status,
		paymentMethod: filter.paymentMethod,
		source: filter.source,
		month: filter.month,
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsDeleting(true);
		try {
			await deleteExpense(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const columns: ColumnDef<ExpenseModel>[] = [
		{
			id: "title",
			header: t("expenseTitle"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-48 space-y-0.5">
						<div className="flex items-center gap-1.5">
							<span className="font-medium">{item.title}</span>
							{item.isLocked && (
								<Badge variant="outline" className="gap-1 text-[10px]">
									<Boxes className="size-3" />
									{t("auto")}
								</Badge>
							)}
						</div>
						{item.payee && (
							<p className="text-muted-foreground text-xs">
								{t("payee")}: {item.payee}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "category",
			header: t("category"),
			cell: ({ row }) => (
				<span className="text-sm">{row.original.category?.name || "—"}</span>
			),
		},
		{
			id: "expenseDate",
			header: t("date"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="space-y-0.5">
						<span className="text-sm tabular-nums">{item.expenseDate}</span>
						{item.billingPeriod && (
							<p className="text-muted-foreground text-xs">
								{t("bills")} {item.billingPeriod}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "amount",
			header: t("amount"),
			cell: ({ row }) => (
				<span className="font-medium tabular-nums">BDT {formatMoney(row.original.amount)}</span>
			),
		},
		{
			id: "paymentMethod",
			header: t("paymentMethod"),
			cell: ({ row }) => {
				const method = row.original.paymentMethod;
				return (
					<span className="text-sm">
						{method ? paymentMethodLabels[method] || method : "—"}
					</span>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<Badge variant={statusVariant[row.original.status] || "outline"}>
					{row.original.status}
				</Badge>
			),
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const item = row.original;

				// Rows written by Inventory (and later Payroll) are owned by that
				// module — the purchase price there is the source of truth, so the
				// API rejects an edit or delete here. Say why instead of offering
				// buttons that can only fail.
				if (item.isLocked) {
					return <span className="text-muted-foreground text-xs">{t("managedElsewhere")}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.FINANCE.EXPENSES.EDIT,
								PERMISSIONS.FINANCE.EXPENSES.ALL,
								PERMISSIONS.FINANCE.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.FINANCE.EXPENSES.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.FINANCE.EXPENSES.DELETE,
								PERMISSIONS.FINANCE.EXPENSES.ALL,
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
				<ExpenseFilterBar filter={filter} setFilter={setFilter}>
					<ExpenseCreate />
				</ExpenseFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [PERMISSIONS.FINANCE.EXPENSES.ALL, PERMISSIONS.FINANCE.ALL])
					}
				/>

				{/* The sum of everything the filters match, not just this page — the
				    question an accountant is actually asking of a filtered list. */}
				<div className="border-border/70 bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-4 py-3">
					<span className="text-muted-foreground text-sm">
						{t("filteredTotalLabel", { count: meta.total })}
					</span>
					<span className="text-base font-semibold tabular-nums">
						BDT {formatMoney(filteredTotal)}
					</span>
				</div>

				<DataTable
					columns={columns}
					data={expenses || []}
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
