"use client";

import { TOption } from "@/shared/components/form/FilterButton";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useTableData } from "@/shared/hooks/use-table-data";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import BehaviorFilterBar from "./BehaviorFilterBar";
import IncidentForm from "./IncidentForm";

export type IncidentFilter = {
	search: string;
	type: string[];
	status: string[];
	category: string[];
};

const initialFilters: IncidentFilter = { search: "", type: [], status: [], category: [] };

export function IncidentList() {
	const t = useTranslations("StudentBehavior");
	const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
	const [filter, setFilter] = useState<IncidentFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const { data: rawIncidents, meta, isLoading } = useTableData("/behaviorIncidents");

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	const incidents = useMemo(() => {
		if (!rawIncidents) return [];
		return rawIncidents.filter((incident: any) => {
			const matchesType =
				filter.type.length === 0 || filter.type.includes(incident.type);
			const matchesStatus =
				filter.status.length === 0 ||
				filter.status.includes(incident.status);
			const matchesCategory =
				filter.category.length === 0 ||
				filter.category.includes(incident.category);
			const matchesSearch =
				!filter.search ||
				incident.studentName?.toLowerCase().includes(filter.search.toLowerCase()) ||
				incident.studentId?.toLowerCase().includes(filter.search.toLowerCase());

			return matchesType && matchesStatus && matchesCategory && matchesSearch;
		});
	}, [rawIncidents, filter]);

	const getTypeBadge = (type: string) => {
		switch (type) {
			case "positive":
				return (
					<Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
						{t("filters.positive")}
					</Badge>
				);
			case "negative":
				return <Badge variant="destructive">{t("filters.negative")}</Badge>;
			default:
				return <Badge variant="secondary">{t("filters.neutral")}</Badge>;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "resolved":
				return (
					<Badge
						variant="outline"
						className="border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
					>
						{t("statuses.resolved")}
					</Badge>
				);
			case "pending":
				return (
					<Badge
						variant="outline"
						className="border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
					>
						{t("statuses.pending")}
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "date",
			accessorKey: "date",
			header: t("table.date"),
			cell: ({ row }) => (
				<span className="font-medium">
					{format(new Date(row.original.date), "dd MMM, yyyy")}
				</span>
			),
		},
		{
			id: "student",
			header: t("table.student"),
			cell: ({ row }) => (
				<div>
					<p className="font-medium">{row.original.studentName}</p>
					<p className="text-muted-foreground text-xs">
						{row.original.studentId} • {row.original.class}
					</p>
				</div>
			),
		},
		{
			id: "type",
			accessorKey: "type",
			header: t("table.type"),
			cell: ({ row }) => getTypeBadge(row.original.type),
		},
		{
			id: "category",
			accessorKey: "category",
			header: t("table.category"),
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<FileText className="text-muted-foreground h-4 w-4" />
					<span className="text-sm">
						{t(`categories.${row.original.category}` as any) || row.original.category}
					</span>
				</div>
			),
		},
		{
			id: "actionTaken",
			accessorKey: "actionTaken",
			header: t("table.actionTaken"),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{t(`actions.${row.original.actionTaken}` as any) || row.original.actionTaken}
				</span>
			),
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("table.status"),
			cell: ({ row }) => getStatusBadge(row.original.status),
		},
		{
			id: "actions",
			header: () => <div className="text-right">{t("table.actions")}</div>,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSelectedIncident(row.original)}
					>
						<Edit className="h-4 w-4" />
						<span className="sr-only">View</span>
					</Button>
				</div>
			),
		},
	];

	return (
		<Card className="p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0">
				<BehaviorFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
				<DataTable
					data={incidents || []}
					isLoading={isLoading}
					pagination={{
						page: meta?.page || page,
						limit: meta?.limit || limit,
						total: meta?.total || (incidents ? incidents.length : 0),
						totalPages:
							meta?.totalPages ||
							Math.ceil((incidents ? incidents.length : 0) / limit),
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
					columns={columns}
				/>
			</CardContent>

			<Dialog
				open={!!selectedIncident}
				onOpenChange={(open) => !open && setSelectedIncident(null)}
			>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{t("dialog.title")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh]">
						{selectedIncident && (
							<IncidentForm
								initialData={selectedIncident}
								onSuccess={() => setSelectedIncident(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
