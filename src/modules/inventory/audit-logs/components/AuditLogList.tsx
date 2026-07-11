"use client";

import DateRangePicker from "@/shared/components/form/DateRangePicker";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { Activity, AlertTriangle, Archive, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useAuditLogsList } from "../hooks/use-audit-logs";
import AuditLogFilterBar from "./AuditLogFilterBar";

type Filter = {
	search: string;
	action: string[];
	entityType: string[];
};

const initialFilters: Filter = { search: "", action: [], entityType: [] };
type ChartPeriod = "weekly" | "monthly" | "yearly" | "custom";

function valueText(value: any) {
	if (value === null || value === undefined || value === "") return "-";
	return String(value);
}

function dateText(value: any) {
	if (!value) return "-";
	return new Date(value).toLocaleDateString();
}

function toDateParam(value?: Date) {
	if (!value) return undefined;
	return value.toISOString().slice(0, 10);
}

function formatNumber(value: any) {
	const numericValue = Number(value || 0);
	return Number.isFinite(numericValue) ? numericValue.toLocaleString() : "0";
}

function displayStatValue(value: any) {
	if (typeof value === "string" && Number.isNaN(Number(value))) return value;
	return formatNumber(value);
}

function AuditLogSummaryStats({ summary }: { summary?: Record<string, any> }) {
	const t = useTranslations("Inventory");
	if (!summary) return null;

	const stats = [
		{ label: t("totalRecords"), value: summary.total, icon: Archive },
		{ label: t("createdRecords"), value: summary.created, icon: PackageCheck },
		{ label: t("updatedRecords"), value: summary.updated, icon: Activity },
		{ label: t("deletedRecords"), value: summary.deleted, icon: AlertTriangle },
	];

	return (
		<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className="bg-card/70 border-border/70 flex min-h-24 items-start justify-between rounded-md border p-4"
					>
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">{stat.label}</p>
							<p className="text-2xl font-semibold">{displayStatValue(stat.value)}</p>
						</div>
						<Icon
							className={`text-muted-foreground size-4 ${(stat as any).tone || ""}`}
						/>
					</div>
				);
			})}
		</div>
	);
}

const inventoryTrendConfig = {
	count: { label: "Records", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function AuditLogTrendChart({
	period,
	setPeriod,
	dateRange,
	setDateRange,
	trend,
}: {
	period: ChartPeriod;
	setPeriod: (period: ChartPeriod) => void;
	dateRange: DateRange | undefined;
	setDateRange: (dateRange: DateRange | undefined) => void;
	trend?: { label: string; count: number }[];
}) {
	const t = useTranslations("Inventory");
	const chartData = trend?.length ? trend : [];

	return (
		<div className="bg-card/70 border-border/70 rounded-md border p-4">
			<div className="mb-3 flex flex-col flex-wrap gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
				<div>
					<p className="text-sm font-medium">{t("inventoryTrend")}</p>
					<p className="text-muted-foreground text-xs">
						{t("inventoryTrendDescription")}
					</p>
				</div>
				<div className="flex flex-col flex-wrap gap-2 @xl:flex-row @xl:items-center">
					<Tabs value={period} onValueChange={(value) => setPeriod(value as ChartPeriod)}>
						<TabsList>
							<TabsTrigger value="weekly">{t("weekly")}</TabsTrigger>
							<TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
							<TabsTrigger value="yearly">{t("yearly")}</TabsTrigger>
							<TabsTrigger value="custom">{t("custom")}</TabsTrigger>
						</TabsList>
					</Tabs>
					{period === "custom" && (
						<DateRangePicker
							align="end"
							value={dateRange}
							onValueChange={setDateRange}
							className="h-9 w-full @xl:w-[260px]"
						/>
					)}
				</div>
			</div>
			<ChartContainer config={inventoryTrendConfig} className="h-[240px] w-full">
				<AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
					<defs>
						<linearGradient id="inventoryTrendGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.35} />
							<stop offset="100%" stopColor="var(--color-count)" stopOpacity={0.03} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" vertical={false} />
					<XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
					<YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
					<ChartTooltip content={<ChartTooltipContent />} />
					<Area
						type="monotone"
						dataKey="count"
						stroke="var(--color-count)"
						strokeWidth={1.5}
						fill="url(#inventoryTrendGradient)"
						dot={{ r: 1.5, fill: "var(--color-count)" }}
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
}

export default function AuditLogList() {
	const [filter, setFilter] = useState<Filter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");
	const [chartDateRange, setChartDateRange] = useState<DateRange | undefined>();
	const t = useTranslations("Inventory");

	const apiParams: Record<string, unknown> = {
		page,
		limit,
		search: filter.search,
		action: filter.action.join(","),
		entityType: filter.entityType.join(","),
		chartPeriod,
	};
	if (chartPeriod === "custom") {
		if (chartDateRange?.from) apiParams.chartFrom = toDateParam(chartDateRange.from);
		if (chartDateRange?.to) apiParams.chartTo = toDateParam(chartDateRange.to);
	}

	const { data, meta, isLoading } = useAuditLogsList(apiParams);

	const columns: ColumnDef<any>[] = [
		{
			id: "action",
			header: t("action"),
			cell: ({ row }) => (
				<span className="font-medium">{valueText(row.original.action)}</span>
			),
		},
		{
			id: "entityType",
			header: t("entityType"),
			cell: ({ row }) => <span>{valueText(row.original.entityType)}</span>,
		},
		{
			id: "summary",
			header: t("summary"),
			cell: ({ row }) => <span>{valueText(row.original.summary)}</span>,
		},
		{
			id: "entityId",
			header: t("recordId"),
			cell: ({ row }) => (
				<span className="text-muted-foreground">{valueText(row.original.entityId)}</span>
			),
		},
		{
			id: "createdBy",
			header: t("createdBy"),
			cell: ({ row }) => <span>{valueText(row.original.changedByName)}</span>,
		},
		{
			id: "createdAt",
			header: t("createdAt"),
			cell: ({ row }) => <span>{dateText(row.original.createdAt)}</span>,
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
				<AuditLogFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<AuditLogSummaryStats summary={(meta as any)?.summary} />
				<AuditLogTrendChart
					period={chartPeriod}
					setPeriod={setChartPeriod}
					dateRange={chartDateRange}
					setDateRange={setChartDateRange}
					trend={(meta as any)?.summary?.trend}
				/>
				<TableFilter
					filter={filter}
					setFilter={setFilter as any}
					resetFilters={resetFilters}
				/>
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
