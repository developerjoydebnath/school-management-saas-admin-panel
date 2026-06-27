"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { RoleModel } from "@/shared/models/role.model";
import { StatusEnum } from "@/shared/types/enums";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, ShieldAlert, Trash2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { deleteRole } from "../hooks/use-role-mutations";
import { useRoles } from "../hooks/use-roles";
import { RoleCreate } from "./RoleCreate";
import { RoleDetailsSheet } from "./RoleDetailsSheet";
import RoleFilterBar from "./RoleFilterBar";
import { RoleForm } from "./RoleForm";

export type RoleFilter = {
	search: string;
};

const initialFilters: RoleFilter = { search: "" };

function RoleDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("RolesPage");

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" title={t("viewDetails") || "View Details"}>
					<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
				</Button>
			</SheetTrigger>
			<RoleDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export function RoleList() {
	const [filter, setFilter] = useState<RoleFilter>(initialFilters);
	const t = useTranslations("RolesPage");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const {
		data: roles,
		meta,
		isLoading,
		mutate,
	} = useRoles({
		page,
		limit,
		search: filter.search,
	});

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<RoleModel | null>(null);
	const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setRoleToDelete(id);
		setIsDeleting(true);
		try {
			await deleteRole(id);
			toast.success("Role deleted successfully");
			mutate();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete role");
		} finally {
			setIsDeleting(false);
			setRoleToDelete(null);
		}
	};

	const columns: ColumnDef<RoleModel>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("roleName"),
			cell: ({ row }) => {
				const role = row.original;
				return (
					<div>
						<div className="flex items-center gap-2 font-medium">
							{role.name}
							{role.isSystem && <ShieldAlert className="size-4 text-orange-500" />}
						</div>
						{role.description && (
							<p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
								{role.description}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "permissions",
			accessorKey: "permissions",
			header: t("permissions"),
			cell: ({ row }) => (
				<Badge variant="secondary">{row.original.permissions.length} Permissions</Badge>
			),
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const role = row.original;
				let variant: "default" | "secondary" | "destructive" = "default";
				if (role.status === StatusEnum.INACTIVE) variant = "destructive";
				if (role.status === StatusEnum.PENDING) variant = "secondary";

				return (
					<Badge variant={variant} className="capitalize">
						{role.status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const role = row.original;
				return (
					<div className="flex items-center gap-2">
						<RoleDetailsAction id={role.id} />
						<PermissionGuard
							permissions={[
								PERMISSIONS.ROLES.ALL,
								PERMISSIONS.ROLES.MANAGEMENT.ALL,
								PERMISSIONS.ROLES.MANAGEMENT.EDIT,
							]}
						>
							<Button
								variant="outline"
								size="icon"
								disabled={role.isSystem}
								onClick={() => {
									setSelectedRole(role);
									setIsFormOpen(true);
								}}
							>
								<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ROLES.ALL,
								PERMISSIONS.ROLES.MANAGEMENT.ALL,
								PERMISSIONS.ROLES.MANAGEMENT.DELETE,
							]}
						>
							{role.isSystem ? (
								<Button variant="outline" size="icon" disabled>
									<Trash2 className="h-4 w-4 text-red-500 opacity-50" />
								</Button>
							) : (
								<ConfirmationModal
									onConfirm={() => confirmDelete(role.id)}
									title={t("deleteRoleTitle")}
									description={t("deleteRoleDescription")}
									confirmText={tc("delete")}
									variant="destructive"
									isLoading={isDeleting && roleToDelete === role.id}
								>
									<AlertDialogTrigger asChild><Button variant="outline" size="icon">
												<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
											</Button></AlertDialogTrigger>
								</ConfirmationModal>
							)}
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
				<RoleFilterBar filter={filter} setFilter={setFilter}>
					<RoleCreate />
				</RoleFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={roles || []}
					isLoading={isLoading}
					pagination={{
						page: meta?.page || 1,
						limit: meta?.limit || 10,
						total: meta?.total || 0,
						totalPages: meta?.totalPages || 1,
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
				/>
			</CardContent>

			{/* Form for Editing */}
			<RoleForm
				isOpen={isFormOpen}
				initialData={selectedRole}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedRole(null);
				}}
				onSuccess={() => mutate()}
			/>
		</Card>
	);
}
