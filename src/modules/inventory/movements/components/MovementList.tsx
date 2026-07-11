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
import { ArrowLeftRight, Eye, Package, PackageCheck, PackageMinus, Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type DateRange } from "react-day-picker";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMovements } from "../hooks/use-movement";
import { MovementCreateButton } from "./MovementCreateButton";
import MovementFilterBar, { MovementFilter } from "./MovementFilterBar";
import { MovementDetailsSheet } from "./MovementDetailsSheet";

type ChartPeriod = "weekly" | "monthly" | "yearly" | "custom";

const initialFilters: MovementFilter = {
	search: "",
	movementType: [],
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

function locationLabel(loc: any) {
	if (!loc) return "-";
	const room = loc.classRoom;
	if (room) {
		const parts = [room.name, room.roomNo].filter(Boolean);
		if (parts.length) return `${loc.name} (${parts.join(" ")})`;
	}
	return loc.name || "-";
}

const MOVEMENT_TYPE_BADGE: Record<string, { label: string; className: string }> = {
	PURCHASE: { label: "Purchase", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
	TRANSFER: { label: "Transfer", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
	ISSUE: { label: "Issue", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
	RETURN: { label: "Return", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
	ADJUSTMENT: { label: "Adjustment", className: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300" },
	DAMAGE: { label: "Damage", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
	REPAIR_OUT: { label: "Repair Out", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
	REPAIR_IN: { label: "Repair In", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
	DISPOSE: { label: "Dispose", className: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300" },
	LOST: { label: "Lost", className: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300" },
};

function MovementTypeBadge({ type }: { type: string }) {
	const t = useTranslations("Inventory");
	const config = MOVEMENT_TYPE_BADGE[type] ?? { label: type, className: "bg-muted text-muted-foreground" };
	const labelKey = type.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
	const translatedLabel = t(labelKey as any) !== labelKey ? t(labelKey as any) : config.label;
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
			{translatedLabel}
		</span>
	);
}

function MovementDetailsAction({ id, title }: { id: string; title: string }) {
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
			<MovementDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

function MovementSummaryStats({ summary }: { summary?: Record<string, any> }) {
	const t = useTranslations("Inventory");
	if (!summary) return null;

	const stats = [
		{ label: t("totalRecords"), value: summary.total, icon: Package },
		{ label: t("movedQuantity"), value: summary.quantity, icon: PackageCheck },
		{ label: t("purchases"), value: summary.purchase, icon: PackageMinus },
		{ label: t("transfers"), value: summary.transfer, icon: ArrowLeftRight },
		{ label: t("issues"), value: summary.issue, icon: PackageMinus },
		{ label: t("returns"), value: summary.return, icon: Repeat2 },
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
							<p className="text-2xl font-semibold">{formatNumber(stat.value)}</p>
						</div>
						<Icon className="text-muted-foreground size-4" />
					</div>
				);
			})}
		</div>
	);
}

function MovementTrendChart({
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

	const movementTrendConfig = {
		count: { label: t("movements"), color: "var(--muted-foreground)" },
	} satisfies ChartConfig;

	return (
		<div className="bg-card/70 border-border/70 rounded-md border p-4">
			<div className="mb-3 flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between flex-wrap">
				<div>
					<p className="text-sm font-medium">{t("inventoryTrend")}</p>
					<p className="text-muted-foreground text-xs">{t("inventoryTrendDescription")}</p>
				</div>
				<div className="flex flex-col gap-2 @xl:flex-row @xl:items-center flex-wrap">
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
			<ChartContainer config={movementTrendConfig} className="h-[240px] w-full">
				<AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
					<defs>
						<linearGradient id="movementTrendGradient" x1="0" y1="0" x2="0" y2="1">
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
						fill="url(#movementTrendGradient)"
						dot={{ r: 1.5, fill: "var(--color-count)" }}
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
}

export function MovementList() {
	const [filter, setFilter] = useState<MovementFilter>(initialFilters);
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
	if (filter.movementType.length > 0)
		apiParams.movementType = filter.movementType.join(",");
	if (chartPeriod === "custom") {
		if (chartDateRange?.from) apiParams.chartFrom = toDateParam(chartDateRange.from);
		if (chartDateRange?.to) apiParams.chartTo = toDateParam(chartDateRange.to);
	}

	const { data, meta, isLoading } = useMovements(apiParams);
	const summary = (meta as any)?.summary;

	const columns: ColumnDef<any>[] = [
		{
			id: "item",
			header: t("itemName"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.item?.name ?? "-"}</span>
					{row.original.item?.code && (
						<span className="text-muted-foreground text-xs">{row.original.item.code}</span>
					)}
				</div>
			),
		},
		{
			id: "movementType",
			header: t("movementType"),
			cell: ({ row }) => <MovementTypeBadge type={row.original.movementType} />,
		},
		{
			id: "quantity",
			header: t("quantity"),
			cell: ({ row }) => <span>{row.original.quantity}</span>,
		},
		{
			id: "fromLocation",
			header: t("fromLocation"),
			cell: ({ row }) => <span>{locationLabel(row.original.fromLocation)}</span>,
		},
		{
			id: "toLocation",
			header: t("toLocation"),
			cell: ({ row }) => <span>{locationLabel(row.original.toLocation)}</span>,
		},
		{
			id: "referenceNo",
			header: t("referenceNo"),
			cell: ({ row }) => <span>{row.original.referenceNo || "-"}</span>,
		},
		{
			id: "createdAt",
			header: t("createdAt"),
			cell: ({ row }) => <span>{dateText(row.original.createdAt)}</span>,
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const movement = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.MOVEMENTS.VIEW,
								PERMISSIONS.INVENTORY.MOVEMENTS.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<MovementDetailsAction id={movement.id} title={t("viewDetails")} />
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
				<MovementFilterBar filter={filter} setFilter={setFilter}>
					<MovementCreateButton />
				</MovementFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<MovementSummaryStats summary={summary} />
				<MovementTrendChart
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
