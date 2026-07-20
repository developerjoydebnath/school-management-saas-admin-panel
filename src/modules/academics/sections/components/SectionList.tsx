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
import { StatusEnum } from "@/shared/types/enums";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSection, updateSection } from "../hooks/use-section-mutations";
import { useSections } from "../hooks/use-sections";
import { SectionCreate } from "./SectionCreate";
import SectionFilterBar from "./SectionFilterBar";

export type SectionFilter = {
	search: string;
	status: string[];
};

const initialFilters: SectionFilter = {
	search: "",
	status: [],
};

export default function SectionList() {
	const [filter, setFilter] = useState<SectionFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [isWorking, setIsWorking] = useState(false);

	const { data, meta, isLoading } = useSections({
		page,
		limit,
		search: filter.search,
		status: filter.status,
	});

	const confirmDelete = async (id: string) => {
		setPendingId(id);
		setIsWorking(true);
		try {
			await deleteSection(id);
			toast.success("Section deleted successfully");
		} catch {
			toast.error("Failed to delete section");
		} finally {
			setIsWorking(false);
			setPendingId(null);
		}
	};

	const confirmStatusChange = async (section: any) => {
		setPendingId(section.id);
		setIsWorking(true);
		try {
			const status =
				section.status === StatusEnum.ACTIVE ? StatusEnum.INACTIVE : StatusEnum.ACTIVE;
			await updateSection(section.id, { status });
			toast.success(`Status updated to ${status}`);
		} catch {
			toast.error("Failed to update status");
		} finally {
			setIsWorking(false);
			setPendingId(null);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "name",
			header: "Section Name",
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			id: "bnName",
			header: "Bangla Name",
			cell: ({ row }) => <span>{row.original.bnName || "-"}</span>,
		},
		{
			id: "code",
			header: "Code",
			cell: ({ row }) => <span>{row.original.code || "-"}</span>,
		},
		{
			id: "sortOrder",
			header: "Sort",
			cell: ({ row }) => <span>{row.original.sortOrder ?? 0}</span>,
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => {
				const section = row.original;
				const isActive = section.status === StatusEnum.ACTIVE;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.ACADEMICS.CLASSES.EDIT,
							PERMISSIONS.ACADEMICS.CLASSES.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(section)}
							title="Change section status?"
							description="This will update the section master status."
							confirmText="Change Status"
							isLoading={isWorking && pendingId === section.id}
						>
							<AlertDialogTrigger asChild>
								<div className="flex w-fit cursor-pointer items-center gap-2">
									<Switch checked={isActive} className="pointer-events-none" />
									<span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const section = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASSES.EDIT,
								PERMISSIONS.ACADEMICS.CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm" title="Edit Section">
								<Link href={PATHS.ACADEMICS.SECTIONS.EDIT(section.id)}>
									<Pencil className="text-muted-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASSES.DELETE,
								PERMISSIONS.ACADEMICS.CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(section.id)}
								title="Delete section?"
								description="This section cannot be deleted if it is used in a session class setup."
								confirmText="Delete"
								variant="destructive"
								isLoading={isWorking && pendingId === section.id}
							>
								<AlertDialogTrigger asChild>
									<Button title="Delete Section" variant="destructive" size="icon-sm">
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
				<SectionFilterBar filter={filter} setFilter={setFilter}>
					<SectionCreate />
				</SectionFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
				<DataTable
					columns={columns}
					data={data || []}
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
