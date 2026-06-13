"use client";

import DataTable from "@/shared/components/table/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { getLocalizedName } from "@/shared/utils/localization";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

interface StudentListTableProps {
	classId: string;
	session?: string;
}

export default function StudentListTable({ classId, session }: StudentListTableProps) {
	const t = useTranslations("StudentList");
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const {
		data: students,
		meta,
		isLoading,
	} = useTableData("/students");

	const { data: classData } = useSWR(`/classes/${classId}`);

	const filteredStudents = useMemo(() => {
		if (!students) return [];
		return students.filter((s: any) => {
			const matchesClass = s.class === classId || s.class === `class-${classId}`;
			const matchesSession = !session || s.session === session;
			return matchesClass && matchesSession;
		});
	}, [students, classId, session]);

	const columns: ColumnDef<any>[] = [
		{
			id: "roll",
			accessorKey: "roll",
			header: t("roll"),
			cell: ({ row }) => (
				<span className="font-mono font-semibold text-primary">
					{row.original.roll || "—"}
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
				<span className="text-xs text-muted-foreground font-mono">
					{row.original.studentId || "—"}
				</span>
			),
		},
		{
			id: "section",
			accessorKey: "section",
			header: t("section"),
			cell: ({ row }) => (
				<Badge variant="secondary" className="text-xs">
					{row.original.section || "—"}
				</Badge>
			),
		},
		{
			id: "gender",
			accessorKey: "gender",
			header: t("gender"),
			cell: ({ row }) => (
				<span className="capitalize text-sm">{row.original.gender || "—"}</span>
			),
		},
		{
			id: "fatherName",
			accessorKey: "fatherName",
			header: t("fatherName"),
			cell: ({ row }) => (
				<span className="text-sm">{row.original.fatherName || "—"}</span>
			),
		},
		{
			id: "mobile",
			accessorKey: "mobile",
			header: t("mobile"),
			cell: ({ row }) => (
				<span className="text-sm">{row.original.mobile || "—"}</span>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<div
						className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
							status === "ACTIVE"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{status || "ACTIVE"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				return (
					<Link href={`/students/directory/${classId}/${row.original.id}`}>
						<Button variant="outline" size="sm" className="gap-1.5 text-xs">
							<Eye className="h-3.5 w-3.5" />
							{t("viewProfile")}
						</Button>
					</Link>
				);
			},
		},
	];

	return (
		<Card className="p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0 pb-4">
				<div className="flex items-center gap-3">
					<h2 className="text-lg font-semibold">
						{classData ? getLocalizedName(classData.name, locale) : `Class ${classId}`}
					</h2>
					<Badge variant="outline">{filteredStudents.length} {t("studentName")}</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<DataTable
					data={filteredStudents}
					isLoading={isLoading}
					pagination={{
						page: meta.page,
						limit: meta.limit,
						total: filteredStudents.length,
						totalPages: Math.ceil(filteredStudents.length / limit),
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
					columns={columns}
				/>
			</CardContent>
		</Card>
	);
}
