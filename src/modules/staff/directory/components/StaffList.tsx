"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import { deleteStaff, updateStaffEmploymentStatus } from "../hooks/use-staff-mutations";
import { useStaffList } from "../hooks/use-staff-list";
import { StaffModel } from "../models/staff.model";
import StaffFilterBar from "./StaffFilterBar";

export type StaffFilter = {
	search: string;
	status?: string[];
	designationId?: string[];
	employmentType?: string[];
	bloodGroup?: string[];
	gender?: string[];
	divisionId?: string;
	districtId?: string;
	upazilaId?: string;
	isMpoListed?: string;
};

const initialFilters: StaffFilter = { search: "" };

const statusOptions = [
	{ label: "Active", value: "active" },
	{ label: "On Leave", value: "on_leave" },
	{ label: "Suspended", value: "suspended" },
	{ label: "Resigned", value: "resigned" },
	{ label: "Retired", value: "retired" },
	{ label: "Terminated", value: "terminated" },
	{ label: "Transferred", value: "transferred" },
	{ label: "Deceased", value: "deceased" },
];

export default function StaffList() {
	const [filter, setFilter] = useState<StaffFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [itemToChangeStatus, setItemToChangeStatus] = useState<StaffModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("StaffDirectory");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { staff, meta, isLoading } = useStaffList({
		page,
		limit,
		...filter,
	});

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsDeleting(true);
		try {
			await deleteStaff(id);
			toast.success("Staff member deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const confirmStatusChange = async (item: StaffModel, newStatus: string) => {
		setItemToChangeStatus(item);
		setIsChangingStatus(true);
		try {
			await updateStaffEmploymentStatus(item.id, newStatus);
			toast.success(`Status updated to ${newStatus}`);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsChangingStatus(false);
			setItemToChangeStatus(null);
		}
	};

	const columns: ColumnDef<StaffModel>[] = [
		{
			id: "employeeCode",
			header: t("employeeCode"),
			cell: ({ row }) => <span className="font-medium">{row.original.employeeCode}</span>,
		},
		{
			id: "fullName",
			header: t("staffName"),
			cell: ({ row }) => <span>{row.original.fullName}</span>,
		},
		{
			id: "phone",
			header: t("phone"),
			cell: ({ row }) => <span>{row.original.phone}</span>,
		},
		{
			id: "designation",
			header: t("designation"),
			cell: ({ row }) => <span>{row.original.designation?.name || "-"}</span>,
		},
		{
			id: "status",
			header: t("employmentStatus"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<Badge variant={item.status === "active" ? "default" : "secondary"} className="capitalize">
						{item.status?.replace(/_/g, " ") || "-"}
					</Badge>
				);
			},
		},
		{
			id: "statusAction",
			header: t("changeStatus"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.DIRECTORY.EDIT,
							PERMISSIONS.STAFF.DIRECTORY.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									disabled={isChangingStatus && itemToChangeStatus?.id === item.id}
								>
									Change
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{statusOptions.map((option) => (
									<DropdownMenuItem
										key={option.value}
										disabled={option.value === item.status}
										onSelect={() => confirmStatusChange(item, option.value)}
										className="capitalize"
									>
										{option.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.DIRECTORY.VIEW,
								PERMISSIONS.STAFF.DIRECTORY.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.STAFF.DIRECTORY.DETAILS(item.id)}>
									<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.DIRECTORY.EDIT,
								PERMISSIONS.STAFF.DIRECTORY.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.STAFF.DIRECTORY.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.DIRECTORY.DELETE,
								PERMISSIONS.STAFF.DIRECTORY.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(item.id)}
								title={tc("deleteTitle")}
								description={tc("deleteDescription")}
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
				<StaffFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [PERMISSIONS.STAFF.DIRECTORY.ALL, PERMISSIONS.STAFF.ALL])
					}
				/>
				<DataTable
					columns={columns}
					data={staff || []}
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
