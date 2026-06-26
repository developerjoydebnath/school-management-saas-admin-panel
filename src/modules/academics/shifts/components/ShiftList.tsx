"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ShiftModel } from "@/shared/models/shift.model";
import { useAuthStore } from "@/shared/stores/authStore";
import { StatusEnum } from "@/shared/types/enums";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { deleteShift, updateShift } from "../hooks/use-shift-mutations";
import { useShifts } from "../hooks/use-shifts";
import { ShiftCreate } from "./ShiftCreate";
import ShiftFilterBar from "./ShiftFilterBar";
import ShiftForm from "./ShiftForm";

export type ShiftFilter = {
	search: string;
};

const initialFilters: ShiftFilter = { search: "" };

export default function ShiftList() {
	const [filter, setFilter] = useState<ShiftFilter>(initialFilters);
	const t = useTranslations("Shifts");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [editingShift, setEditingShift] = useState<ShiftModel | null>(null);
	const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [shiftToChangeStatus, setShiftToChangeStatus] = useState<ShiftModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	const { user } = useAuthStore((state) => state.auth);

	const {
		data: shifts,
		meta,
		isLoading,
	} = useShifts({
		page,
		limit,
		search: filter.search,
	});

	const confirmDelete = async (id: string) => {
		setShiftToDelete(id);
		setIsDeleting(true);
		try {
			await deleteShift(id);
			toast.success("Shift deleted successfully");
		} catch (err: any) {
			toast.error("Failed to delete the shift. Please try again.");
		} finally {
			setIsDeleting(false);
			setShiftToDelete(null);
		}
	};

	const confirmStatusChange = async (shift: ShiftModel, newStatus: boolean) => {
		setShiftToChangeStatus(shift);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? "ACTIVE" : "INACTIVE";
			await updateShift(shift.id, { status });
			toast.success(`Status updated to ${status}`);
		} catch (err: any) {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setShiftToChangeStatus(null);
		}
	};

	const columns: ColumnDef<ShiftModel>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("shiftName"),
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			id: "startTime",
			accessorKey: "startTime",
			header: t("shiftStartTime"),
			cell: ({ row }) => <span className="font-medium">{row.original.startTime}</span>,
		},
		{
			id: "endTime",
			accessorKey: "endTime",
			header: t("shiftEndTime"),
			cell: ({ row }) => <span className="font-medium">{row.original.endTime}</span>,
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const shift = row.original;
				const isActive = shift.status === StatusEnum.ACTIVE;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={
								[
									PERMISSIONS.ACADEMICS.SHIFTS.EDIT,
									PERMISSIONS.ACADEMICS.ALL,
								].filter(Boolean) as string[]
							}
						>
							<ConfirmationModal
								onConfirm={() => confirmStatusChange(shift, !isActive)}
								title={t("statusChangeTitle")}
								description={
									isActive
										? tc("changeToInactiveDesc")
										: tc("changeToActiveDesc")
								}
								confirmText={tc("changeStatus")}
								variant="default"
								isLoading={
									isChangingStatus && shiftToChangeStatus?.id === shift.id
								}
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
						</PermissionGuard>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const shift = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={
								[
									PERMISSIONS.ACADEMICS.SHIFTS.EDIT,
									PERMISSIONS.ACADEMICS.ALL,
								].filter(Boolean) as string[]
							}
						>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setEditingShift(shift)}
							>
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={
								[
									PERMISSIONS.ACADEMICS.SHIFTS.DELETE,
									PERMISSIONS.ACADEMICS.ALL,
								].filter(Boolean) as string[]
							}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(shift.id)}
								title={t("deleteShiftTitle")}
								description={t("deleteShiftDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && shiftToDelete === shift.id}
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
				<ShiftFilterBar filter={filter} setFilter={setFilter}>
					<ShiftCreate />
				</ShiftFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.SHIFTS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>

				<DataTable<ShiftModel>
					data={shifts || []}
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
					columns={columns}
				/>
			</CardContent>

			<ShiftForm
				isOpen={!!editingShift}
				initialData={editingShift}
				onClose={() => setEditingShift(null)}
			/>
		</Card>
	);
}
