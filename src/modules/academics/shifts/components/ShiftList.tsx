"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { ShiftModel } from "@/shared/models/shift.model";
import { StatusEnum } from "@/shared/types/enums";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
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

	const {
		data: shifts,
		meta,
		isLoading,
		mutate,
	} = useTableData("/shifts", {
		// page,
		// limit,
		// search: filter.search
	});

	// serialize the data
	const serializedShifts = shifts?.map((shift: any) => new ShiftModel(shift));

	const confirmDelete = async (id: string) => {
		setShiftToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/shifts/${id}`);
			toast.success("Shift deleted successfully");
			mutate();
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
			const status = newStatus ? "Active" : "Inactive";
			await axios.patch(`/shifts/${shift.id}`, { status });
			toast.success(`Status updated to ${status}`);
			mutate();
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
			cell: ({ row }) => row.original.startTime || "-",
		},
		{
			id: "endTime",
			accessorKey: "endTime",
			header: t("shiftEndTime"),
			cell: ({ row }) => row.original.endTime || "-",
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const shift = row.original;
				return (
					<div className="flex items-center gap-2">
						<ConfirmationModal
							onConfirm={() =>
								confirmStatusChange(shift, shift.status !== StatusEnum.ACTIVE)
							}
							title={t("statusChangeTitle")}
							description={
								shift.status === StatusEnum.ACTIVE
									? tc("changeToInactiveDesc")
									: tc("changeToActiveDesc")
							}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && shiftToChangeStatus?.id === shift.id}
						>
							<AlertDialogTrigger asChild>
								<Switch checked={shift.status === StatusEnum.ACTIVE} />
							</AlertDialogTrigger>
						</ConfirmationModal>
						<div
							className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
								shift.status === StatusEnum.ACTIVE
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{shift.status}
						</div>
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
									PERMISSIONS.ACADEMICS.ALL,
									PERMISSIONS.ACADEMICS.SHIFTS?.ALL,
									PERMISSIONS.ACADEMICS.SHIFTS?.EDIT,
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
									PERMISSIONS.ACADEMICS.ALL,
									PERMISSIONS.ACADEMICS.SHIFTS?.ALL,
									PERMISSIONS.ACADEMICS.SHIFTS?.DELETE,
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

	// reset filters
	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	return (
		<>
			<Card className="p-6 shadow-none ring-0">
				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={setFilter}
						resetFilters={resetFilters}
					/>

					<DataTable<ShiftModel>
						data={serializedShifts || []}
						isLoading={isLoading}
						pagination={{
							page: meta.page,
							limit: meta.limit,
							total: meta.total,
							totalPages: meta.totalPages,
							onPageChange: setPage,
							onLimitChange: setLimit,
						}}
						columns={columns}
					/>
				</CardContent>
			</Card>

			<Dialog open={!!editingShift} onOpenChange={(open) => !open && setEditingShift(null)}>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>Edit Shift</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						{editingShift && (
							<ShiftForm
								initialData={editingShift}
								onSuccess={() => setEditingShift(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
