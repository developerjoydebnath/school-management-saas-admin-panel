"use client";

import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	borrowerTypeColors,
	formatDate,
	loanStatusColors,
} from "../../shared/dto/library.dto";
import { useLibraryLoans } from "../../shared/hooks/use-library-circulation";
import CirculationActions from "./CirculationActions";
import LoanActions from "./LoanActions";
import LoanRegisterFilterBar, { LoanFilter } from "./LoanRegisterFilterBar";

const initialFilters: LoanFilter = {
	search: "",
	status: [],
	overdue: [],
	borrowerType: [],
	classId: [],
	dateFrom: "",
	dateTo: "",
};

/**
 * The issue register — every loan, filterable, printable.
 *
 * The same component serves the overdue list: filtering to overdue is a query
 * over open loans, not a separate table, so one screen cannot drift from the
 * other.
 */
export default function LoanRegister() {
	const t = useTranslations("LibraryCirculation");
	const tc = useTranslations("Common");
	const [filter, setFilter] = useState<LoanFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const isOverdueView = filter.overdue[0] === "true";

	const { loans, meta, isLoading } = useLibraryLoans({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		overdue: isOverdueView,
		borrowerType: filter.borrowerType,
		classId: filter.classId,
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});

	const columns: ColumnDef<any>[] = [
		{
			id: "book",
			header: t("book"),
			cell: ({ row }) => {
				const loan = row.original;
				return (
					<div className="min-w-48 space-y-0.5">
						<p className="font-medium">{loan.book?.title}</p>
						<p className="text-muted-foreground font-mono text-xs">
							{loan.accessionNo}
						</p>
					</div>
				);
			},
		},
		{
			id: "borrower",
			header: t("borrower"),
			cell: ({ row }) => {
				const loan = row.original;
				return (
					<div className="min-w-40 space-y-1">
						<p className="text-sm">{loan.borrowerName}</p>
						<div className="flex flex-wrap items-center gap-1.5">
							<Badge
								className={cn(
									"border-transparent text-[10px] font-normal",
									borrowerTypeColors[loan.borrowerType],
								)}
							>
								{t(`borrowerTypeValue.${loan.borrowerType}`)}
							</Badge>
							{loan.borrowerCode && (
								<span className="text-muted-foreground font-mono text-xs">
									{loan.borrowerCode}
								</span>
							)}
						</div>
					</div>
				);
			},
		},
		{
			id: "dates",
			header: t("dates"),
			cell: ({ row }) => {
				const loan = row.original;
				return (
					<div className="min-w-36 space-y-0.5 text-xs">
						<p>{t("issuedOnValue", { date: formatDate(loan.issuedAt) })}</p>
						<p
							className={cn(
								loan.isOverdue && "font-medium text-amber-600 dark:text-amber-400",
							)}
						>
							{t("dueOn", { date: formatDate(loan.dueDate) })}
						</p>
						{loan.returnedAt && (
							<p className="text-muted-foreground">
								{t("returnedOnValue", { date: formatDate(loan.returnedAt) })}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const loan = row.original;
				return (
					<div className="min-w-24 space-y-1">
						<Badge
							className={cn(
								"border-transparent text-xs font-normal",
								loanStatusColors[loan.status],
							)}
						>
							{t(`loanStatusValue.${loan.status}`)}
						</Badge>
						{loan.isOverdue && (
							<p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
								<AlertTriangle className="size-3" />
								{t("daysLate", { days: loan.daysOverdue })}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => <LoanActions loan={row.original} compact />,
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
				{/* The desktop copy lives in the page header; this one only
				    renders below @3xl/page, where the header has no room. */}
				<LoanRegisterFilterBar filter={filter} setFilter={setFilter}>
					<CirculationActions />
				</LoanRegisterFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport
				/>

				<DataTable
					columns={columns}
					data={loans || []}
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
