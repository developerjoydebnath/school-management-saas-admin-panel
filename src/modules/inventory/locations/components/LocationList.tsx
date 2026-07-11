"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DateRangePicker from "@/shared/components/form/DateRangePicker";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
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
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import {
	Archive,
	CheckCircle2,
	Eye,
	Link2,
	Link2Off,
	Pencil,
	Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { type DateRange } from "react-day-picker";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { deleteLocation } from "../hooks/use-location-mutations";
import { useLocations } from "../hooks/use-location";
import { LocationCreateButton } from "./LocationCreateButton";
import { LocationDetailsSheet } from "./LocationDetailsSheet";
import LocationFilterBar, { LocationFilter } from "./LocationFilterBar";

const initialFilters: LocationFilter = {
	search: "",
	status: [],
	locationType: [],
	dateFrom: "",
	dateTo: "",
};

type ChartPeriod = "weekly" | "monthly" | "yearly" | "custom";

function valueText(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	return String(value);
}

function dateText(value: unknown) {
	if (!value) return "-";
	return new Date(String(value)).toLocaleDateString();
}

function toDateParam(value?: Date) {
	if (!value) return undefined;
	return value.toISOString().slice(0, 10);
}

function formatNumber(value: unknown) {
	const numericValue = Number(value || 0);
	return Number.isFinite(numericValue) ? numericValue.toLocaleString() : "0";
}

function LocationDetailsAction({ id, title }: { id: string; title: string }) {
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
			<LocationDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

function LocationSummaryStats({ summary }: { summary?: Record<string, any> }) {
	const t = useTranslations("Inventory");
	if (!summary) return null;

	const stats = [
		{ label: t("totalRecords"), value: summary.total, icon: Archive },
		{ label: t("activeRecords"), value: summary.active, icon: CheckCircle2 },
		{ label: t("locationsWithRoom"), value: summary.withRoom, icon: Link2 },
		{ label: t("locationsWithoutRoom"), value: summary.withoutRoom, icon: Link2Off },
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
							<p className="text-2xl font-semibold">{formatNumber(stat.value)}</p>
						</div>
						<Icon className="text-muted-foreground size-4" />
					</div>
				);
			})}
		</div>
	);
}

const locationTrendConfig = {
	count: { label: "Records", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function LocationTrendChart({
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
			<ChartContainer config={locationTrendConfig} className="h-[240px] w-full">
				<AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
					<defs>
						<linearGradient id="locationTrendGradient" x1="0" y1="0" x2="0" y2="1">
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
						fill="url(#locationTrendGradient)"
						dot={{ r: 1.5, fill: "var(--color-count)" }}
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
}

export function LocationList() {
	const [filter, setFilter] = useState<LocationFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
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
	if (filter.status.length === 1) apiParams.status = filter.status[0];
	if (filter.locationType.length > 0) apiParams.locationType = filter.locationType.join(",");
	if (chartPeriod === "custom") {
		if (chartDateRange?.from) apiParams.chartFrom = toDateParam(chartDateRange.from);
		if (chartDateRange?.to) apiParams.chartTo = toDateParam(chartDateRange.to);
	}

	const { data, meta, isLoading } = useLocations(apiParams);
	const summary = (meta as any)?.summary;

	const confirmDelete = async (id: string) => {
		setDeleteId(id);
		setIsDeleting(true);
		try {
			await deleteLocation(id);
			toast.success("Inventory location deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeleteId(null);
			setIsDeleting(false);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "name",
			header: t("locationName"),
			cell: ({ row }) => (
				<div>
					<span className="font-medium">{row.original.name}</span>
					{row.original.code && (
						<p className="text-muted-foreground text-xs">{row.original.code}</p>
					)}
				</div>
			),
		},
		{
			id: "locationType",
			header: t("locationType"),
			cell: ({ row }) => <span>{valueText(row.original.locationType)}</span>,
		},
		{
			id: "classRoom",
			header: t("classRoom"),
			cell: ({ row }) => (
				<span>{row.original.classRoom ? row.original.classRoom.roomNo : "-"}</span>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<span>{row.original.status === "ACTIVE" ? "Active" : "Inactive"}</span>
			),
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
				const location = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.LOCATIONS.VIEW,
								PERMISSIONS.INVENTORY.LOCATIONS.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<LocationDetailsAction id={location.id} title={t("viewDetails")} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.LOCATIONS.EDIT,
								PERMISSIONS.INVENTORY.LOCATIONS.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.INVENTORY.LOCATIONS.EDIT(location.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.LOCATIONS.DELETE,
								PERMISSIONS.INVENTORY.LOCATIONS.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(location.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && deleteId === location.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm">
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
		setChartPeriod("monthly");
		setChartDateRange(undefined);
	};

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<LocationFilterBar filter={filter} setFilter={setFilter}>
					<LocationCreateButton />
				</LocationFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<LocationSummaryStats summary={summary} />
				<LocationTrendChart
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
