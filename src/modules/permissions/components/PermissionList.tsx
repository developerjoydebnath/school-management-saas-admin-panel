"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { PermissionModel } from "@/shared/models/permission.model";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { deletePermission } from "../hooks/use-permission-mutations";
import { usePermissions } from "../hooks/use-permissions";
import { PermissionCreate } from "./PermissionCreate";
import { PermissionDetailsDialog } from "./PermissionDetailsDialog";
import PermissionFilterBar from "./PermissionFilterBar";
import { PermissionForm } from "./PermissionForm";

export type PermissionFilter = {
	search: string;
	modules: string[];
};

const initialFilters: PermissionFilter = {
	search: "",
	modules: [],
};

export function PermissionList() {
	const [filter, setFilter] = useState<PermissionFilter>(initialFilters);
	const t = useTranslations("PermissionsPage");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const { mutate } = useSWRConfig();

	const {
		data: permissions,
		meta,
		isLoading,
	} = usePermissions({
		page,
		limit,
		search: filter.search,
		modules: filter.modules,
	});

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedPermission, setSelectedPermission] = useState<PermissionModel | null>(null);
	const [permissionToDelete, setPermissionToDelete] = useState<number | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: number) => {
		setPermissionToDelete(id);
		setIsDeleting(true);
		try {
			await deletePermission(id);
			toast.success("Permission deleted successfully");
			mutate((key: any) => typeof key === "string" && key.startsWith("/permissions"));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete permission");
		} finally {
			setIsDeleting(false);
			setPermissionToDelete(null);
		}
	};

	const columns: ColumnDef<PermissionModel>[] = [
		{
			id: "name",
			accessorKey: "permissionName",
			header: t("permissionName"),
			cell: ({ row }) => <div className="font-medium">{row.original.permissionName}</div>,
		},
		{
			id: "key",
			accessorKey: "permissionKey",
			header: t("permissionKey"),
			cell: ({ row }) => (
				<code className="bg-muted rounded px-1.5 py-0.5 text-xs">
					{row.original.permissionKey}
				</code>
			),
		},
		{
			id: "group",
			accessorKey: "groupName",
			header: t("groupName"),
			cell: ({ row }) => <Badge variant="secondary">{row.original.groupName}</Badge>,
		},
		{
			id: "modules",
			accessorKey: "moduleName",
			header: t("modules"),
			cell: ({ row }) => (
				<div className="flex flex-wrap gap-1">
					{row.original.moduleName?.map((mod, idx) => (
						<Badge key={idx} variant="outline" className="text-[10px]">
							{mod}
						</Badge>
					))}
				</div>
			),
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const permission = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionDetailsDialog permissionId={permission.id} />
						<PermissionGuard
							permissions={[
								PERMISSIONS.ROLES.ALL,
								PERMISSIONS.ROLES.MATRIX.ALL,
								PERMISSIONS.ROLES.MATRIX.EDIT,
							]}
						>
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									setSelectedPermission(permission);
									setIsFormOpen(true);
								}}
							>
								<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ROLES.ALL,
								PERMISSIONS.ROLES.MATRIX.ALL,
								PERMISSIONS.ROLES.MATRIX.DELETE,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(permission.id)}
								title={t("deletePermissionTitle")}
								description={t("deletePermissionDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && permissionToDelete === permission.id}
							>
								<AlertDialogTrigger asChild><Button variant="outline" size="icon">
											<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
										</Button></AlertDialogTrigger>
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
				<PermissionFilterBar filter={filter} setFilter={setFilter}>
					<PermissionCreate />
				</PermissionFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={permissions || []}
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

			<PermissionForm
				isOpen={isFormOpen}
				initialData={selectedPermission}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedPermission(null);
				}}
			/>
		</Card>
	);
}
