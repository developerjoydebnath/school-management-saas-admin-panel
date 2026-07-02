"use client";

import DataTable from "@/shared/components/table/DataTable";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSyllabus, useSyllabusHistory } from "../hooks/use-syllabus";

export default function SyllabusHistoryView({ id }: { id: string }) {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const t = useTranslations("Syllabus");
	const { data: syllabus, isLoading: isDetailsLoading } = useSyllabus(id);
	const { data, meta, isLoading } = useSyllabusHistory(id, { page, limit });

	const columns: ColumnDef<any>[] = [
		{
			id: "version",
			header: t("version"),
			cell: ({ row }) => <span>v{row.original.version}</span>,
		},
		{
			id: "changeType",
			header: t("changeType"),
			cell: ({ row }) => <span>{row.original.changeType}</span>,
		},
		{
			id: "summary",
			header: t("summary"),
			cell: ({ row }) => <span>{row.original.summary || "-"}</span>,
		},
		{
			id: "changedAt",
			header: t("changedAt"),
			cell: ({ row }) => <span>{row.original.changedAt?.slice(0, 19).replace("T", " ")}</span>,
		},
	];

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardContent className="space-y-4 p-0">
				{isDetailsLoading ? (
					<Skeleton className="h-20 w-full" />
				) : (
					<div className="rounded-md border bg-card p-4">
						<p className="text-sm">{syllabus?.title || syllabus?.exam?.name}</p>
						<p className="text-muted-foreground text-xs">
							{syllabus?.class?.enName}
							{syllabus?.section?.name ? ` / ${syllabus.section.name}` : ""}
						</p>
					</div>
				)}
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
