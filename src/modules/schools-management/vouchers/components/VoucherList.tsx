"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { VoucherModel } from "../../models/voucher.model";
import { deleteVoucher, updateVoucherStatus } from "../hooks/use-voucher-mutations";
import { useVouchers } from "../hooks/use-vouchers";
import { VoucherCreateButton } from "./VoucherCreateButton";
import { VoucherDetailsDialog } from "./VoucherDetailsDialog";
import VoucherFilterBar from "./VoucherFilterBar";

export type VoucherFilter = {
	search: string;
	isActive: string[];
	discountType: string[];
};

const initialFilters: VoucherFilter = {
	search: "",
	isActive: [],
	discountType: [],
};

export function VoucherList() {
	const [filter, setFilter] = useState<VoucherFilter>(initialFilters);
	const t = useTranslations("VouchersPage");
	const tc = useTranslations("Common");
	const tf = useTranslations("Forms");
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
		isActive: filter.isActive,
		discountType: filter.discountType,
	});

	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsDeleting(true);
		try {
			await deleteVoucher(id);
			toast.success(t("deleteSuccess"));
			mutate((key: any) => typeof key === "string" && key.startsWith("/vouchers"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const handleStatusToggle = async (id: string, currentStatus: boolean) => {
		const newStatus = !currentStatus;
		try {
			await updateVoucherStatus(id, newStatus);
			toast.success(t("statusUpdateSuccess") || "Status updated successfully");
			mutate((key: any) => typeof key === "string" && key.startsWith("/vouchers"));
		} catch {
			// Global interceptor handles error toast
		}
	};

	const columns: ColumnDef<VoucherModel>[] = [
		{
			id: "code",
			accessorKey: "code",
			header: t("code"),
			cell: ({ row }) => <div className="text-primary font-bold">{row.original.code}</div>,
		},
		{
			id: "name",
			accessorKey: "name",
			header: t("name"),
			cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		},
		{
			id: "discount",
			header: t("discount"),
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
			header: t("usage"),
			cell: ({ row }) => (
				<div className="text-sm">
					{row.original.currentRedemptions} / {row.original.maxRedemptions || "∞"}
				</div>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const isActive = row.original.isActive;
				return (
					<ConfirmationModal
						onConfirm={() => handleStatusToggle(row.original.id, row.original.isActive)}
						title={t("confirmStatusChange")}
						description={
							isActive ? tc("changeToInactiveDesc") : tc("changeToActiveDesc")
						}
						confirmText={tc("changeStatus")}
						variant="default"
					>
						<AlertDialogTrigger asChild>
							<div className="group flex w-fit cursor-pointer items-center gap-2">
								<Switch checked={isActive} className="pointer-events-none" />
								<span className="text-sm capitalize">
									{isActive ? "Active" : "Inactive"}
								</span>
							</div>
						</AlertDialogTrigger>
					</ConfirmationModal>
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
						<VoucherDetailsDialog voucherId={voucher.id} />
						<PermissionGuard
							permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.EDIT]}
						>
							<Button asChild variant="outline" size="icon">
								<Link href={PATHS.SCHOOLS_MANAGEMENT.VOUCHERS.EDIT(voucher.id)}>
									<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.DELETE]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(voucher.id)}
								title={t("deleteVoucherTitle")}
								description={t("deleteVoucherDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && itemToDelete === voucher.id}
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
					<VoucherCreateButton />
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
