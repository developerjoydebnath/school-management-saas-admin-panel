"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import DataTable from "@/shared/components/table/DataTable";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { getLocalizedName } from "@/shared/utils/localization";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import StudentListSectionTabs from "./StudentListSectionTabs";

interface StudentListTableProps {
	classId: string;
}

const STUDENT_STATUS_STYLES: Record<string, string> = {
	ACTIVE: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
	INACTIVE: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
	PENDING: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
	SUSPENDED: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
	TRANSFERRED: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30",
	GRADUATED: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
	LEFT: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
	DROPPED: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
};

const STUDENT_STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
	{ label: "Suspended", value: "suspended" },
];

function normalizeStatus(status: unknown) {
	return String(status || "ACTIVE").trim().toUpperCase();
}

function formatStatus(status: string) {
	return status
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export default function StudentListTable({ classId }: StudentListTableProps) {
	const t = useTranslations("StudentList");
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [sectionId, setSectionId] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

	const {
		data: students,
		meta,
		isLoading,
		mutate,
	} = useTableData(`/students/by-class/${classId}`, {
		page,
		limit,
		sectionId,
	});

	const { data: classResponse } = useSWR(`/classes/${classId}`);
	const classData = classResponse?.data;

	const handleStatusChange = useCallback(
		async (studentId: string, status: string) => {
			setStatusUpdatingId(studentId);
			try {
				await axios.patch(`/students/${studentId}/status`, { status });
				toast.success(`Student marked as ${formatStatus(status)}.`);
				await mutate?.();
			} catch (error: any) {
				toast.error(
					error?.response?.data?.message || "Failed to update student status."
				);
			} finally {
				setStatusUpdatingId(null);
			}
		},
		[mutate]
	);

	const handleDelete = useCallback(
		async (studentId: string) => {
			setDeleteId(studentId);
			try {
				await axios.delete(`/students/${studentId}`);
				toast.success("Student deleted successfully.");
				await mutate?.();
			} catch (error: any) {
				toast.error(error?.response?.data?.message || "Failed to delete student.");
				throw error;
			} finally {
				setDeleteId(null);
			}
		},
		[mutate]
	);

	const columns: ColumnDef<any>[] = useMemo(
		() => [
			{
				id: "roll",
				accessorKey: "roll",
				header: t("roll"),
				cell: ({ row }) => (
					<span className="font-mono font-semibold text-primary">
						{row.original.roll || "-"}
					</span>
				),
			},
			{
				id: "fullName",
				accessorKey: "fullName",
				header: t("studentName"),
				cell: ({ row }) => (
					<span className="font-medium">{row.original.fullName}</span>
				),
			},
			{
				id: "studentId",
				accessorKey: "studentId",
				header: t("studentId"),
				cell: ({ row }) => (
					<span className="text-xs font-mono text-muted-foreground">
						{row.original.studentId || "-"}
					</span>
				),
			},
			{
				id: "section",
				accessorKey: "section",
				header: t("section"),
				cell: ({ row }) => (
					<Badge variant="secondary" className="text-xs">
						{row.original.section || "-"}
					</Badge>
				),
			},
			{
				id: "gender",
				accessorKey: "gender",
				header: t("gender"),
				cell: ({ row }) => (
					<span className="text-sm capitalize">{row.original.gender || "-"}</span>
				),
			},
			{
				id: "fatherName",
				accessorKey: "fatherName",
				header: t("fatherName"),
				cell: ({ row }) => (
					<span className="text-sm">{row.original.fatherName || "-"}</span>
				),
			},
			{
				id: "mobile",
				accessorKey: "mobile",
				header: t("mobile"),
				cell: ({ row }) => (
					<span className="text-sm">{row.original.mobile || "-"}</span>
				),
			},
			{
				id: "status",
				header: t("status"),
				cell: ({ row }) => {
					const status = normalizeStatus(row.original.status);
					return (
						<div
							className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
								STUDENT_STATUS_STYLES[status] ||
								"bg-muted text-muted-foreground ring-1 ring-border"
							}`}
						>
							{formatStatus(status)}
						</div>
					);
				},
			},
			{
				id: "actions",
				header: t("actions"),
				cell: ({ row }) => {
					const studentId = row.original.id;
					const currentStatus = normalizeStatus(row.original.status).toLowerCase();

					return (
						<div className="flex items-center gap-2">
							<Button
								asChild
								variant="outline"
								size="icon-sm"
								title={t("viewProfile")}
							>
								<Link href={`/students/directory/${classId}/${studentId}`}>
									<Eye className="h-3.5 w-3.5" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="icon-sm"
								title="Edit student"
							>
								<Link href={`/students/directory/${classId}/${studentId}/edit`}>
									<Pencil className="h-3.5 w-3.5" />
								</Link>
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="icon-sm"
										title="Change status"
										disabled={statusUpdatingId === studentId}
									>
										<MoreHorizontal className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Change status</DropdownMenuLabel>
									{STUDENT_STATUS_OPTIONS.map((option) => (
										<DropdownMenuItem
											key={option.value}
											disabled={
												statusUpdatingId === studentId ||
												currentStatus === option.value
											}
											onClick={() => handleStatusChange(studentId, option.value)}
										>
											{option.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							<ConfirmationModal
								title="Delete student?"
								description="This student will be soft deleted and removed from lists, counts, and summaries."
								confirmText="Delete"
								variant="destructive"
								isLoading={deleteId === studentId}
								onConfirm={() => handleDelete(studentId)}
							>
								<AlertDialogTrigger asChild>
									<Button
										variant="destructive"
										size="icon-sm"
										title="Delete student"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</AlertDialogTrigger>
							</ConfirmationModal>
						</div>
					);
				},
			},
		],
		[
			classId,
			deleteId,
			handleDelete,
			handleStatusChange,
			statusUpdatingId,
			t,
		]
	);

	return (
		<Card className="@container/page p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0 pb-4">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<h2 className="text-lg font-semibold">
							{classData
								? getLocalizedName(
										classData.name || classData.enName || classData.bnName,
										locale
									)
								: `Class ${classId}`}
						</h2>
						<Badge variant="outline">
							{meta.total} {t("studentName")}
						</Badge>
					</div>
					<div className="overflow-x-auto">
						<StudentListSectionTabs
							classId={classId}
							sectionId={sectionId}
							onChange={setSectionId}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<DataTable
					data={students}
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
	);
}
