"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download, Edit2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { usePayments } from "../../hooks/use-payments";
import { PaymentModel } from "../../models/payment.model";
import { PaymentCreateButton } from "./PaymentCreateButton";
import PaymentFilterBar from "./PaymentFilterBar";

export type PaymentFilter = {
	search: string;
	status: string[];
	method: string[];
	paidFrom: string;
	paidTo: string;
};

const initialFilters: PaymentFilter = {
	search: "",
	status: [],
	method: [],
	paidFrom: "",
	paidTo: "",
};

export function PaymentList() {
	const [filter, setFilter] = useState<PaymentFilter>(initialFilters);
	const t = useTranslations("SchoolsManagementPayments");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const {
		data: payments,
		meta,
		isLoading,
	} = usePayments({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		method: filter.method,
		paidFrom: filter.paidFrom,
		paidTo: filter.paidTo,
	});

	const columns: ColumnDef<PaymentModel>[] = [
		{
			id: "school",
			header: t("school"),
			cell: ({ row }) => (
				<div className="font-medium text-primary">
					{row.original.school?.schoolName || "Unknown School"}
				</div>
			),
		},
		{
			id: "subscription",
			header: t("subscription"),
			cell: ({ row }) => (
				<div>
					{row.original.subscription?.plan?.name || "N/A"}
				</div>
			),
		},
		{
			id: "amount",
			header: t("amount"),
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.amount.toLocaleString()} {row.original.currency}
				</div>
			),
		},
		{
			id: "method",
			header: t("method"),
			cell: ({ row }) => (
				<span className="capitalize">{row.original.method.replace(/_/g, " ")}</span>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<Badge
						variant={
							status === "completed"
								? "default"
								: status === "failed"
									? "destructive"
									: "secondary"
						}
						className="capitalize"
					>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "paidAt",
			header: t("paidAt"),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.paidAt
						? format(new Date(row.original.paidAt), "MMM d, yyyy")
						: "N/A"}
				</span>
			),
		},
		{
			id: "references",
			header: t("references"),
			cell: ({ row }) => (
				<div className="text-muted-foreground text-xs">
					<div>TRX: {row.original.transactionId || "N/A"}</div>
					<div>INV: {row.original.invoiceId || "N/A"}</div>
				</div>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const payment = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.PAYMENTS.VIEW]}>
							<Button asChild variant="outline" size="icon">
								<Link href={PATHS.SCHOOLS_MANAGEMENT.PAYMENTS.DETAILS(payment.id)}>
									<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.PAYMENTS.EDIT]}>
							<Button asChild variant="outline" size="icon">
								<Link href={PATHS.SCHOOLS_MANAGEMENT.PAYMENTS.EDIT(payment.id)}>
									<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.PAYMENTS.VIEW]}>
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									downloadPdf(
										`/superadmin/payments/${payment.id}/invoice`,
										`invoice-${payment.id}.pdf`
									)
								}
							>
								<Download className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
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
				<PaymentFilterBar filter={filter} setFilter={setFilter}>
					<PaymentCreateButton />
				</PaymentFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={payments || []}
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
