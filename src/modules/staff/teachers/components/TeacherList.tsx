"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
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
import { deleteTeacher, updateTeacherEmploymentStatus } from "../hooks/use-teacher-mutations";
import { useTeachers } from "../hooks/use-teachers";
import { TeacherModel } from "../models/teacher.model";
import TeacherFilterBar from "./TeacherFilterBar";

export type TeacherFilter = {
	search: string;
	status?: string[];
	designationId?: string[];
	departmentId?: string[];
	primarySubjectId?: string[];
	employmentType?: string[];
	bloodGroup?: string[];
	gender?: string[];
	divisionId?: string;
	districtId?: string;
	upazilaId?: string;
	isMpoListed?: string;
	ntrcaRegistered?: string;
};

const initialFilters: TeacherFilter = { search: "" };

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

export default function TeacherList() {
	const [filter, setFilter] = useState<TeacherFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [itemToChangeStatus, setItemToChangeStatus] = useState<TeacherModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("Teachers");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { teachers, meta, isLoading } = useTeachers({
		page,
		limit,
		...filter,
	});

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsDeleting(true);
		try {
			await deleteTeacher(id);
			toast.success("Teacher deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const confirmStatusChange = async (item: TeacherModel, newStatus: string) => {
		setItemToChangeStatus(item);
		setIsChangingStatus(true);
		try {
			await updateTeacherEmploymentStatus(item.id, newStatus);
			toast.success(`Status updated to ${newStatus}`);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsChangingStatus(false);
			setItemToChangeStatus(null);
		}
	};

	const columns: ColumnDef<TeacherModel>[] = [
		{
			id: "employeeCode",
			header: t("employeeCode"),
			cell: ({ row }) => <span className="font-medium">{row.original.employeeCode}</span>,
		},
		{
			id: "fullName",
			header: t("teacherName"),
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
			id: "department",
			header: t("department"),
			cell: ({ row }) => <span>{row.original.department?.name || "-"}</span>,
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
							PERMISSIONS.STAFF.TEACHERS.EDIT,
							PERMISSIONS.STAFF.TEACHERS.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" disabled={isChangingStatus && itemToChangeStatus?.id === item.id}>
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
								PERMISSIONS.STAFF.TEACHERS.VIEW,
								PERMISSIONS.STAFF.TEACHERS.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.STAFF.TEACHERS.DETAILS(item.id)}>
									<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.TEACHERS.EDIT,
								PERMISSIONS.STAFF.TEACHERS.ALL,
								PERMISSIONS.STAFF.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.STAFF.TEACHERS.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.TEACHERS.DELETE,
								PERMISSIONS.STAFF.TEACHERS.ALL,
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
				<TeacherFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.STAFF.TEACHERS.ALL,
							PERMISSIONS.STAFF.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={teachers || []}
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
