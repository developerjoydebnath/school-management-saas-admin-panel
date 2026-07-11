"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DateRangePicker from "@/shared/components/form/DateRangePicker";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle2, Clock, DollarSign, Eye, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMaintenances } from "../hooks/use-maintenance";
import { MaintenanceCreateButton } from "./MaintenanceCreateButton";
import { MaintenanceDetailsSheet } from "./MaintenanceDetailsSheet";
import MaintenanceFilterBar, { MaintenanceFilter } from "./MaintenanceFilterBar";

type ChartPeriod = "weekly" | "monthly" | "yearly" | "custom";

const initialFilters: MaintenanceFilter = {
	search: "",
	status: [],
	priority: [],
	dateFrom: "",
	dateTo: "",
};

function toDateParam(value?: Date) {
	if (!value) return undefined;
	return value.toISOString().slice(0, 10);
}

function dateText(value: unknown) {
	if (!value) return "-";
	return new Date(String(value)).toLocaleDateString();
}

function formatNumber(value: unknown) {
	const numericValue = Number(value || 0);
	return Number.isFinite(numericValue) ? numericValue.toLocaleString() : "0";
}

function formatCurrency(value: unknown) {
	const numericValue = Number(value || 0);
	return Number.isFinite(numericValue)
		? numericValue.toLocaleString("en-US", { style: "currency", currency: "USD" })
		: "$0.00";
}

const MAINTENANCE_STATUS_BADGE: Record<string, { label: string; className: string }> = {
	OPEN: {
		label: "Open",
		className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
	},
	IN_PROGRESS: {
		label: "In Progress",
		className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
	},
	RESOLVED: {
		label: "Resolved",
		className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
	},
	CANCELLED: {
		label: "Cancelled",
		className: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300",
	},
};

const MAINTENANCE_PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
	LOW: {
		label: "Low",
		className: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
	},
	MEDIUM: {
		label: "Medium",
		className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
	},
	HIGH: {
		label: "High",
		className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
	},
	URGENT: {
		label: "Urgent",
		className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
	},
};

function StatusBadge({ type }: { type: string }) {
	const config = MAINTENANCE_STATUS_BADGE[type] ?? {
		label: type,
		className: "bg-muted text-muted-foreground",
	};
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
		>
			{config.label}
		</span>
	);
}

function PriorityBadge({ type }: { type: string }) {
	const config = MAINTENANCE_PRIORITY_BADGE[type] ?? {
		label: type,
		className: "bg-muted text-muted-foreground",
	};
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
		>
			{config.label}
		</span>
	);
}

function MaintenanceDetailsAction({ id, title }: { id: string; title: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm" title={title}>
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<MaintenanceDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

function MaintenanceSummaryStats({ summary }: { summary?: Record<string, any> }) {
	const t = useTranslations("Inventory");
	if (!summary) return null;

	const stats = [
		{ label: t("totalRecords"), value: summary.total, icon: Wrench },
		{ label: t("open"), value: summary.open, icon: Clock },
		{ label: t("inProgress"), value: summary.inProgress, icon: Clock },
		{ label: t("resolved"), value: summary.resolved, icon: CheckCircle2 },
		{ label: t("highPriority"), value: summary.highPriority, icon: AlertCircle },
		{ label: t("totalCost"), value: summary.totalCost, isCurrency: true, icon: DollarSign },
	];

	return (
		<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-6">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className="bg-card/70 border-border/70 flex min-h-24 items-start justify-between rounded-md border p-4"
					>
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">{stat.label}</p>
							<p className="text-2xl font-semibold">
								{stat.isCurrency
									? formatCurrency(stat.value)
									: formatNumber(stat.value)}
							</p>
						</div>
						<Icon className="text-muted-foreground size-4" />
					</div>
				);
			})}
		</div>
	);
}

function MaintenanceTrendChart({
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

	const maintenanceTrendConfig = {
		count: { label: t("maintenanceTitle"), color: "var(--muted-foreground)" },
	} satisfies ChartConfig;

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
			<ChartContainer config={maintenanceTrendConfig} className="h-[240px] w-full">
				<AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
					<defs>
						<linearGradient id="maintenanceTrendGradient" x1="0" y1="0" x2="0" y2="1">
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
						fill="url(#maintenanceTrendGradient)"
						dot={{ r: 1.5, fill: "var(--color-count)" }}
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
}

export function MaintenanceList() {
	const [filter, setFilter] = useState<MaintenanceFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");
	const [chartDateRange, setChartDateRange] = useState<DateRange | undefined>();
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");

	const apiParams: Record<string, unknown> = {
		page,
		limit,
		search: filter.search,
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
		chartPeriod,
	};
	if (filter.status.length > 0) apiParams.status = filter.status.join(",");
	if (filter.priority.length > 0) apiParams.priority = filter.priority.join(",");
	if (chartPeriod === "custom") {
		if (chartDateRange?.from) apiParams.chartFrom = toDateParam(chartDateRange.from);
		if (chartDateRange?.to) apiParams.chartTo = toDateParam(chartDateRange.to);
	}

	const { data, meta, isLoading } = useMaintenances(apiParams);
	const summary = (meta as any)?.summary;

	const columns: ColumnDef<any>[] = [
		{
			id: "item",
			header: t("itemName"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.item?.name ?? "-"}</span>
					{row.original.item?.code && (
						<span className="text-muted-foreground text-xs">
							{row.original.item.code}
						</span>
					)}
				</div>
			),
		},
		{
			id: "issueTitle",
			header: t("issueTitle"),
			cell: ({ row }) => (
				<span className="font-medium">{row.original.issueTitle || "-"}</span>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => <StatusBadge type={row.original.status} />,
		},
		{
			id: "priority",
			header: t("priority"),
			cell: ({ row }) => <PriorityBadge type={row.original.priority} />,
		},
		{
			id: "cost",
			header: t("cost"),
			cell: ({ row }) => (
				<span>{row.original.cost ? formatCurrency(row.original.cost) : "-"}</span>
			),
		},
		{
			id: "reportedAt",
			header: t("reportedDate"),
			cell: ({ row }) => <span>{dateText(row.original.reportedAt)}</span>,
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const maintenance = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.MAINTENANCE.VIEW,
								PERMISSIONS.INVENTORY.MAINTENANCE.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<MaintenanceDetailsAction
								id={maintenance.id}
								title={t("viewDetails")}
							/>
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
		setChartPeriod("monthly");
		setChartDateRange(undefined);
	};

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<MaintenanceFilterBar filter={filter} setFilter={setFilter}>
					<MaintenanceCreateButton />
				</MaintenanceFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<MaintenanceSummaryStats summary={summary} />
				<MaintenanceTrendChart
					period={chartPeriod}
					setPeriod={setChartPeriod}
					dateRange={chartDateRange}
					setDateRange={setChartDateRange}
					trend={summary?.trend}
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
