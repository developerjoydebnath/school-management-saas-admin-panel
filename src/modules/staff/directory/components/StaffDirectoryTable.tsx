"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import AddStaffModal from "./AddStaffModal";

export default function StaffDirectoryTable() {
	const [editingStaff, setEditingStaff] = useState<any>(null);
	const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const [staffToChangeStatus, setStaffToChangeStatus] = useState<any>(null);

	const t = useTranslations("StaffDirectory");
	const tc = useTranslations("Common");
	const locale = useLocale();

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const {
		data: staffData,
		meta,
		isLoading,
		mutate,
	} = useTableData("/staff", {
		page,
		limit,
	});

	const confirmDelete = async (id: string) => {
		setStaffToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/staff/${id}`);
			toast.success("Staff deleted successfully");
			mutate();
		} catch (err: any) {
			toast.error("Failed to delete staff.");
		} finally {
			setIsDeleting(false);
			setStaffToDelete(null);
		}
	};

	const confirmStatusChange = async (staff: any, newStatus: boolean) => {
		setStaffToChangeStatus(staff);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
			await axios.patch(`/staff/${staff.id}`, { status });
			toast.success(`Status updated to ${status}`);
			mutate();
		} catch (err: any) {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setStaffToChangeStatus(null);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("staffName"),
			cell: ({ row }) => (
				<span className="font-medium">{getLocalizedName(row.original.name, locale)}</span>
			),
		},
		{
			id: "staffId",
			accessorKey: "staffId",
			header: t("staffId"),
			cell: ({ row }) => <span className="text-sm">{row.original.staffId}</span>,
		},
		{
			id: "department",
			accessorKey: "department",
			header: t("department"),
			cell: ({ row }) => <span>{row.original.department}</span>,
		},
		{
			id: "role",
			accessorKey: "role",
			header: t("role"),
			cell: ({ row }) => <span>{row.original.role}</span>,
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const staff = row.original;
				return (
					<div className="flex items-center gap-2">
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(staff, staff.status !== StatusEnum.ACTIVE)}
							title={t("statusChangeTitle")}
							description={
								staff.status === StatusEnum.ACTIVE
									? tc("changeToInactiveDesc")
									: tc("changeToActiveDesc")
							}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && staffToChangeStatus?.id === staff.id}
						>
							<AlertDialogTrigger
								nativeButton={false}
								render={<Switch checked={staff.status === StatusEnum.ACTIVE} />}
							/>
						</ConfirmationModal>
						<div
							className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
								staff.status === StatusEnum.ACTIVE
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{staff.status === StatusEnum.ACTIVE ? t("active") : t("inactive")}
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const staff = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon-sm">
							<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
						</Button>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF?.ALL || "staff.all",
								PERMISSIONS.STAFF?.DIRECTORY?.EDIT || "staff.edit",
							]}
						>
							<Button variant="outline" size="icon-sm" onClick={() => setEditingStaff(staff)}>
								<Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF?.ALL || "staff.all",
								PERMISSIONS.STAFF?.DIRECTORY?.DELETE || "staff.delete",
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(staff.id)}
								title={t("deleteStaffTitle")}
								description={t("deleteStaffDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && staffToDelete === staff.id}
							>
								<AlertDialogTrigger
									render={
										<Button variant="destructive" size="icon-sm">
											<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
										</Button>
									}
								/>
							</ConfirmationModal>
						</PermissionGuard>
					</div>
				);
			},
		},
	];

	return (
		<Card className="p-4 shadow-none ring-0 sm:p-6">
			<CardContent className="space-y-4 p-0">
				<DataTable<any>
					data={staffData || []}
					isLoading={isLoading}
					pagination={{
						page: meta?.page || 1,
						limit: meta?.limit || 10,
						total: meta?.total || 0,
						totalPages: meta?.totalPages || 0,
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
					columns={columns}
				/>
			</CardContent>

			<Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>{editingStaff?.id ? t("editStaffTitle") : t("addStaffTitle")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						{editingStaff && (
							<AddStaffModal
								initialData={editingStaff}
								onSuccess={() => setEditingStaff(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
