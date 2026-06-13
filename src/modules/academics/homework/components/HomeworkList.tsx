"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { TOption } from "@/shared/components/form/FilterButton";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Homework } from "../dto/homework.dto";
import HomeworkFilterBar from "./HomeworkFilterBar";
import HomeworkForm from "./HomeworkForm";

export type HomeworkFilter = {
	search: string;
	status: TOption[];
};

const initialFilters: HomeworkFilter = { search: "", status: [] };

export default function HomeworkList() {
	const [filter, setFilter] = useState<HomeworkFilter>(initialFilters);
	const t = useTranslations("Homework");
	const tc = useTranslations("Common");
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
	const [viewingHomework, setViewingHomework] = useState<Homework | null>(null);
	const [homeworkToDelete, setHomeworkToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: homeworkData,
		meta,
		isLoading,
		mutate,
	} = useTableData("/homework", {
		// page,
		// limit,
		// ...filter
	});

	const confirmDelete = async (id: string) => {
		setHomeworkToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/homework/${id}`);
			toast.success(t("deleteSuccess"));
			mutate();
		} catch (err: any) {
			toast.error(t("deleteError"));
		} finally {
			setIsDeleting(false);
			setHomeworkToDelete(null);
		}
	};

	const columns: ColumnDef<Homework>[] = [
		{
			id: "title",
			accessorKey: "title",
			header: t("homeworkTitle"),
			cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
		},
		{
			id: "classId",
			accessorKey: "className",
			header: t("class"),
			cell: ({ row }) => row.original.className,
		},
		{
			id: "subjectId",
			accessorKey: "subjectName",
			header: t("subject"),
			cell: ({ row }) => row.original.subjectName,
		},
		{
			id: "assignedDate",
			accessorKey: "assignedDate",
			header: t("assignedDate"),
			cell: ({ row }) => row.original.assignedDate,
		},
		{
			id: "dueDate",
			accessorKey: "dueDate",
			header: t("dueDate"),
			cell: ({ row }) => row.original.dueDate,
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const status = row.original.status;
				let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
				if (status === "Active") variant = "default";
				if (status === "Completed") variant = "secondary";
				if (status === "Past Due") variant = "destructive";

				return (
					<Badge variant={variant}>
						{t(status === "Past Due" ? "pastDue" : status.toLowerCase())}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const hm = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setViewingHomework(hm)}
						>
							<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
						</Button>

						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.CREATE,
							]}
						>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setEditingHomework(hm)}
							>
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>

						<ConfirmationModal
							onConfirm={() => confirmDelete(hm.id)}
							title={t("deleteConfirmTitle")}
							description={t("deleteConfirmDesc")}
							confirmText={tc("delete")}
							variant="destructive"
							isLoading={isDeleting && homeworkToDelete === hm.id}
						>
							<AlertDialogTrigger
								render={
									<Button variant="destructive" size="icon-sm">
										<Trash2 className="h-4 w-4" />
									</Button>
								}
							/>
						</ConfirmationModal>
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
		<div className="space-y-4">
			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="p-0">
					<HomeworkFilterBar filter={filter} setFilter={setFilter} />
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={setFilter}
						resetFilters={resetFilters}
					/>

					<DataTable<Homework>
						data={homeworkData || []}
						isLoading={isLoading}
						pagination={{
							page: meta?.page || 1,
							limit: meta?.limit || 10,
							total: meta?.total || 0,
							totalPages: meta?.totalPages || 1,
							onPageChange: setPage,
							onLimitChange: setLimit,
						}}
						columns={columns}
					/>
				</CardContent>
			</Card>

			<Dialog
				open={!!viewingHomework}
				onOpenChange={(open) => !open && setViewingHomework(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{t("viewHomeworkTitle")}</DialogTitle>
					</DialogHeader>
					{viewingHomework && (
						<div className="mt-4 space-y-6">
							<div className="grid grid-cols-2 gap-x-4 gap-y-6">
								<div className="col-span-2">
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("homeworkTitle")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingHomework.title}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("class")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingHomework.className}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("subject")}
									</p>
									<p className="text-foreground text-sm font-medium capitalize">
										{viewingHomework.subjectName}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("assignedDate")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingHomework.assignedDate}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("dueDate")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingHomework.dueDate}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("status")}
									</p>
									<Badge
										variant={
											viewingHomework.status === "Active"
												? "default"
												: viewingHomework.status === "Completed"
													? "secondary"
													: "destructive"
										}
									>
										{t(
											viewingHomework.status === "Past Due"
												? "pastDue"
												: viewingHomework.status.toLowerCase()
										)}
									</Badge>
								</div>
							</div>
							{viewingHomework.description && (
								<div>
									<p className="text-muted-foreground mb-2 text-xs font-medium">
										{t("descriptionLabel")}
									</p>
									<p className="text-foreground text-sm">
										{viewingHomework.description}
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!editingHomework}
				onOpenChange={(open) => !open && setEditingHomework(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("editHomeworkTitle")}</DialogTitle>
					</DialogHeader>
					{editingHomework && (
						<HomeworkForm
							initialData={editingHomework}
							onSuccess={() => setEditingHomework(null)}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
