"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { OnlineClass } from "../dto/online-class.dto";
import OnlineClassFilterBar from "./OnlineClassFilterBar";
import OnlineClassForm from "./OnlineClassForm";

export type OnlineClassFilter = {
	search: string;
	status: string[];
	platform: string[];
};

const initialFilters: OnlineClassFilter = { search: "", status: [], platform: [] };

export default function OnlineClassList() {
	const [filter, setFilter] = useState<OnlineClassFilter>(initialFilters);
	const t = useTranslations("OnlineClasses");
	const tc = useTranslations("Common");
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [editingClass, setEditingClass] = useState<OnlineClass | null>(null);
	const [viewingClass, setViewingClass] = useState<OnlineClass | null>(null);
	const [classToDelete, setClassToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: classesData,
		meta,
		isLoading,
		mutate,
	} = useTableData("/onlineClasses", {
		// page,
		// limit,
		// ...filter
	});

	const confirmDelete = async (id: string) => {
		setClassToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/onlineClasses/${id}`);
			toast.success(t("deleteSuccess"));
			mutate();
		} catch (err: any) {
			toast.error(t("deleteError"));
		} finally {
			setIsDeleting(false);
			setClassToDelete(null);
		}
	};

	const columns: ColumnDef<OnlineClass>[] = [
		{
			id: "title",
			accessorKey: "title",
			header: t("classTitle"),
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
			id: "date",
			accessorKey: "date",
			header: t("date"),
			cell: ({ row }) => row.original.date,
		},
		{
			id: "time",
			header: t("startTime"),
			cell: ({ row }) => (
				<span className="text-xs whitespace-nowrap">
					{row.original.startTime} - {row.original.endTime}
				</span>
			),
		},
		{
			id: "platform",
			accessorKey: "platform",
			header: t("platform"),
			cell: ({ row }) => row.original.platform,
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const status = row.original.status;
				let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
				if (status === "Scheduled") variant = "default";
				if (status === "Ongoing") variant = "default";
				if (status === "Completed") variant = "secondary";
				if (status === "Cancelled") variant = "destructive";

				return (
					<Badge
						variant={variant}
						className={status === "Ongoing" ? "bg-green-500 hover:bg-green-600" : ""}
					>
						{t(status.toLowerCase())}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const cls = row.original;
				return (
					<div className="flex items-center gap-2">
						{cls.meetingLink &&
							cls.status !== "Completed" &&
							cls.status !== "Cancelled" && (
								<Button asChild variant="default" size="icon-sm">
									<Link
										href={cls.meetingLink}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Video className="h-4 w-4" />
									</Link>
								</Button>
							)}

						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setViewingClass(cls)}
						>
							<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
						</Button>

						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setEditingClass(cls)}
						>
							<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
						</Button>

						<ConfirmationModal
							onConfirm={() => confirmDelete(cls.id)}
							title={t("deleteConfirmTitle")}
							description={t("deleteConfirmDesc")}
							confirmText={tc("delete")}
							variant="destructive"
							isLoading={isDeleting && classToDelete === cls.id}
						>
							<AlertDialogTrigger asChild><Button variant="destructive" size="icon-sm">
										<Trash2 className="h-4 w-4" />
									</Button></AlertDialogTrigger>
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
					<OnlineClassFilterBar filter={filter} setFilter={setFilter} />
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={setFilter}
						resetFilters={resetFilters}
					/>

					<DataTable<OnlineClass>
						data={classesData || []}
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

			<Dialog open={!!viewingClass} onOpenChange={(open) => !open && setViewingClass(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{t("viewOnlineClassTitle")}</DialogTitle>
					</DialogHeader>
					{viewingClass && (
						<div className="mt-4 space-y-6">
							<div className="grid grid-cols-2 gap-x-4 gap-y-6">
								<div className="col-span-2">
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("classTitle")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingClass.title}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("class")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingClass.className}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("subject")}
									</p>
									<p className="text-foreground text-sm font-medium capitalize">
										{viewingClass.subjectName}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("teacher")}
									</p>
									<p className="text-foreground text-sm font-medium capitalize">
										{viewingClass.teacherName}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("date")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingClass.date}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("startTime")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingClass.startTime} - {viewingClass.endTime}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("platform")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingClass.platform}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("status")}
									</p>
									<Badge
										variant={
											viewingClass.status === "Scheduled" ||
											viewingClass.status === "Ongoing"
												? "default"
												: viewingClass.status === "Completed"
													? "secondary"
													: "destructive"
										}
										className={
											viewingClass.status === "Ongoing"
												? "bg-green-500 hover:bg-green-600"
												: ""
										}
									>
										{t(viewingClass.status.toLowerCase())}
									</Badge>
								</div>
								{viewingClass.meetingLink && (
									<div className="col-span-2">
										<p className="text-muted-foreground mb-1 text-xs font-medium">
											{t("meetingLink")}
										</p>
										<Link
											href={viewingClass.meetingLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm break-all text-blue-500 hover:underline"
										>
											{viewingClass.meetingLink}
										</Link>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("editOnlineClassTitle")}</DialogTitle>
					</DialogHeader>
					{editingClass && (
						<OnlineClassForm
							initialData={editingClass}
							onSuccess={() => setEditingClass(null)}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
