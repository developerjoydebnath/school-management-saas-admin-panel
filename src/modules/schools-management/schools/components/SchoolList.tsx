"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { deleteSchool } from "../../hooks/use-school-mutations";
import { useSchools } from "../../hooks/use-schools";
import { SchoolModel } from "../../models/school.model";
import SchoolFilterBar from "./SchoolFilterBar";

export type SchoolFilter = {
	search: string;
	status: string;
	schoolType: string;
};

const initialFilters: SchoolFilter = {
	search: "",
	status: "",
	schoolType: "",
};

export function SchoolList() {
	const [filter, setFilter] = useState<SchoolFilter>(initialFilters);
	const t = useTranslations("SchoolsManagement");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const { mutate } = useSWRConfig();

	const {
		data: schools,
		meta,
		isLoading,
	} = useSchools({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		schoolType: filter.schoolType,
	});

	const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setSchoolToDelete(id);
		setIsDeleting(true);
		try {
			await deleteSchool(id);
			toast.success("School deleted successfully");
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/schools"));
		} catch (error: any) {
			// Toast is handled automatically by axios singleton
		} finally {
			setIsDeleting(false);
			setSchoolToDelete(null);
		}
	};

	const columns: ColumnDef<SchoolModel>[] = [
		{
			id: "schoolName",
			accessorKey: "schoolName",
			header: "School Name",
			cell: ({ row }) => (
				<div>
					<div className="font-medium text-primary">{row.original.schoolName}</div>
					<div className="text-muted-foreground text-xs">{row.original.contactEmail}</div>
				</div>
			),
		},
		{
			id: "type",
			accessorKey: "schoolType",
			header: "Type",
			cell: ({ row }) => <span className="capitalize">{row.original.schoolType.replace("_", " ")}</span>,
		},
		{
			id: "status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<Badge
						variant={
							status === "active"
								? "default"
								: status === "pending"
									? "secondary"
									: status === "rejected" || status === "suspended"
										? "destructive"
										: "secondary"
						}
						className="capitalize"
					>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "contactPerson",
			accessorKey: "contactPersonName",
			header: "Contact Person",
			cell: ({ row }) => (
				<div>
					<div>{row.original.contactPersonName || "N/A"}</div>
					<div className="text-muted-foreground text-xs">{row.original.contactPhone}</div>
				</div>
			),
		},
		{
			id: "createdAt",
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "N/A"}
				</span>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const school = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOLS.VIEW]}>
							<Button asChild variant="outline" size="icon">
	<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.DETAILS(school.id)} >
		<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
	</Link>
</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOLS.EDIT]}>
							<Button asChild variant="outline" size="icon">
	<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.EDIT(school.id)} >
		<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
	</Link>
</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOLS.DELETE]}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(school.id)}
								title="Delete School"
								description="Are you sure you want to delete this school? This action cannot be undone."
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && schoolToDelete === school.id}
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
				<SchoolFilterBar filter={filter} setFilter={setFilter}>
					<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOLS.CREATE]}>
						<Button asChild >
	<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.CREATE} >
		<Plus className="size-4" />
							Add School
	</Link>
</Button>
					</PermissionGuard>
				</SchoolFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={schools || []}
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
