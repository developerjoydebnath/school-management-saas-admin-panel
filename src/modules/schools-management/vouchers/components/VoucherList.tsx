"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useVouchers } from "../../hooks/use-vouchers";
import { VoucherModel } from "../../models/voucher.model";
import VoucherFilterBar from "./VoucherFilterBar";
import { PATHS } from "@/shared/configs/paths.config";
import Link from "next/link";
import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { format } from "date-fns";

export type VoucherFilter = {
	search: string;
	status: string;
	discountType: string;
};

const initialFilters: VoucherFilter = {
	search: "",
	status: "",
	discountType: "",
};

export function VoucherList() {
	const [filter, setFilter] = useState<VoucherFilter>(initialFilters);
	const t = useTranslations("SchoolsManagement");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const { mutate } = useSWRConfig();

	const {
		data: vouchers,
		meta,
		isLoading,
	} = useVouchers({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		discountType: filter.discountType,
	});

	const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setVoucherToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/superadmin/vouchers/${id}`);
			toast.success("Voucher deleted successfully");
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/vouchers"));
		} catch (error: any) {
			// Toast is handled automatically by axios singleton
		} finally {
			setIsDeleting(false);
			setVoucherToDelete(null);
		}
	};

	const columns: ColumnDef<VoucherModel>[] = [
		{
			id: "code",
			accessorKey: "code",
			header: "Voucher Code",
			cell: ({ row }) => <div className="font-mono font-medium text-primary bg-muted p-1 rounded inline-block">{row.original.code}</div>,
		},
		{
			id: "discount",
			header: "Discount",
			cell: ({ row }) => (
				<div>
					{row.original.discountType === "percentage" 
						? `${row.original.discountValue}%` 
						: `BDT ${row.original.discountValue.toLocaleString()}`}
				</div>
			),
		},
		{
			id: "usage",
			header: "Usage",
			cell: ({ row }) => (
				<div className="text-sm">
					{row.original.usedCount} / {row.original.maxUses || "∞"}
				</div>
			),
		},
		{
			id: "validity",
			header: "Validity",
			cell: ({ row }) => (
				<div className="text-sm">
					<div className="text-muted-foreground">From: {row.original.validFrom ? format(new Date(row.original.validFrom), "MMM d, yyyy") : "N/A"}</div>
					<div className="text-muted-foreground">To: {row.original.validUntil ? format(new Date(row.original.validUntil), "MMM d, yyyy") : "N/A"}</div>
				</div>
			),
		},
		{
			id: "status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status;
				const isExpired = row.original.validUntil && new Date(row.original.validUntil) < new Date();
				return (
					<Badge
						variant={status === "active" && !isExpired ? "default" : "secondary"}
						className="capitalize"
					>
						{isExpired ? "Expired" : status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const voucher = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.EDIT]}>
							<Button asChild variant="outline" size="icon">
								<Link href={PATHS.SCHOOLS_MANAGEMENT.VOUCHERS.EDIT(voucher.id)}>
									<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.DELETE]}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(voucher.id)}
								title="Delete Voucher"
								description="Are you sure you want to delete this voucher? This action cannot be undone."
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && voucherToDelete === voucher.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="outline" size="icon">
										<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
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
				<VoucherFilterBar filter={filter} setFilter={setFilter}>
					<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.CREATE]}>
						<Button asChild>
							<Link href={PATHS.SCHOOLS_MANAGEMENT.VOUCHERS.CREATE}>
								<Plus className="size-4" />
								Add Voucher
							</Link>
						</Button>
					</PermissionGuard>
				</VoucherFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={vouchers || []}
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
