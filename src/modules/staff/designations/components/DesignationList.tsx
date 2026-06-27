"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { Switch } from "@/shared/components/ui/switch";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteDesignation, updateDesignation } from "../hooks/use-designation-mutations";
import { useDesignations } from "../hooks/use-designations";
import { DesignationModel } from "../models/designation.model";
import { DesignationCreate } from "./DesignationCreate";
import { DesignationDetailsSheet } from "./DesignationDetailsSheet";
import DesignationFilterBar from "./DesignationFilterBar";

export type DesignationFilter = {
	search: string;
	isActive: string[];
	category: string[];
};

const initialFilters: DesignationFilter = { search: "", isActive: [], category: [] };

function DesignationDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("Designations");

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm" title={t("viewDetails")}>
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<DesignationDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export default function DesignationList() {
	const [filter, setFilter] = useState<DesignationFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [itemToChangeStatus, setItemToChangeStatus] = useState<DesignationModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("Designations");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { designations, meta, isLoading } = useDesignations({
		page,
		limit,
		search: filter.search,
		isActive: filter.isActive.length === 1 ? filter.isActive[0] === "true" : undefined,
		category: filter.category,
	});

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsDeleting(true);
		try {
			await deleteDesignation(id);
			toast.success("Designation deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const confirmStatusChange = async (item: DesignationModel, newStatus: boolean) => {
		setItemToChangeStatus(item);
		setIsChangingStatus(true);
		try {
			await updateDesignation(item.id, { isActive: newStatus });
			toast.success(`Status updated to ${newStatus ? "Active" : "Inactive"}`);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsChangingStatus(false);
			setItemToChangeStatus(null);
		}
	};

	const columns: ColumnDef<DesignationModel>[] = [
		{
			id: "name",
			header: t("name"),
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			id: "category",
			header: t("category"),
			cell: ({ row }) => <span className="font-medium">{row.original.category}</span>,
		},
		{
			id: "level",
			header: t("level"),
			cell: ({ row }) => <span className="font-medium">{row.original.level}</span>,
		},
		{
			id: "isActive",
			header: t("isActive"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.DESIGNATIONS.EDIT,
							PERMISSIONS.STAFF.DESIGNATIONS.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(item, !item.isActive)}
							title="Change Status"
							description={item.isActive ? tc("changeToInactiveDesc") : tc("changeToActiveDesc")}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && itemToChangeStatus?.id === item.id}
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
								PERMISSIONS.STAFF.DESIGNATIONS.EDIT,
								PERMISSIONS.STAFF.DESIGNATIONS.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<DesignationDetailsAction id={item.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.DESIGNATIONS.EDIT,
								PERMISSIONS.STAFF.DESIGNATIONS.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.STAFF.DESIGNATIONS.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.DESIGNATIONS.DELETE,
								PERMISSIONS.STAFF.DESIGNATIONS.ALL,
								PERMISSIONS.STAFF.ALL,
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
				<DesignationFilterBar filter={filter} setFilter={setFilter}>
					<DesignationCreate />
				</DesignationFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.STAFF.DESIGNATIONS.ALL,
							PERMISSIONS.STAFF.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={designations || []}
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
