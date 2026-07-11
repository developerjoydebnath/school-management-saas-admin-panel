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
	BarChart3,
	CheckCircle2,
	Eye,
	Package,
	PackageCheck,
	Pencil,
	Trash2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { type DateRange } from "react-day-picker";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { deleteCategory } from "../hooks/use-category-mutations";
import { useCategories } from "../hooks/use-category";
import { CategoryCreateButton } from "./CategoryCreateButton";
import { CategoryDetailsSheet } from "./CategoryDetailsSheet";
import CategoryFilterBar, { CategoryFilter } from "./CategoryFilterBar";

const initialFilters: CategoryFilter = {
	search: "",
	status: [],
	system: [],
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

function getCategoryIcon(iconName?: string | null) {
	return iconName && (LucideIcons as any)[iconName]
		? (LucideIcons as any)[iconName]
		: Package;
}

function CategoryDetailsAction({ id, title }: { id: string; title: string }) {
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
			<CategoryDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

function CategorySummaryStats({ summary }: { summary?: Record<string, any> }) {
	const t = useTranslations("Inventory");
	if (!summary) return null;

	const stats = [
		{ label: t("totalRecords"), value: summary.total, icon: Archive },
		{ label: t("activeRecords"), value: summary.active, icon: CheckCircle2 },
		{ label: t("systemRecords"), value: summary.system, icon: PackageCheck },
		{ label: t("customRecords"), value: summary.custom, icon: Package },
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

const categoryTrendConfig = {
	count: { label: "Records", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function CategoryTrendChart({
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
			<ChartContainer config={categoryTrendConfig} className="h-[240px] w-full">
				<AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
					<defs>
						<linearGradient id="categoryTrendGradient" x1="0" y1="0" x2="0" y2="1">
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
						fill="url(#categoryTrendGradient)"
						dot={{ r: 1.5, fill: "var(--color-count)" }}
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
}

export function CategoryList() {
	const [filter, setFilter] = useState<CategoryFilter>(initialFilters);
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
	if (filter.status.length === 1) apiParams.isActive = filter.status[0] === "ACTIVE";
	if (filter.system.length === 1) apiParams.isSystem = filter.system[0] === "SYSTEM";
	if (chartPeriod === "custom") {
		if (chartDateRange?.from) apiParams.chartFrom = toDateParam(chartDateRange.from);
		if (chartDateRange?.to) apiParams.chartTo = toDateParam(chartDateRange.to);
	}

	const { data, meta, isLoading } = useCategories(apiParams);
	const summary = (meta as any)?.summary;

	const confirmDelete = async (id: string) => {
		setDeleteId(id);
		setIsDeleting(true);
		try {
			await deleteCategory(id);
			toast.success("Inventory category deleted successfully");
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
			header: t("categoryName"),
			cell: ({ row }) => {
				const category = row.original;
				const Icon = getCategoryIcon(category.iconName);
				return (
					<div className="flex items-center gap-2">
						<span
							className="flex size-8 items-center justify-center rounded-md"
							style={{
								backgroundColor: `${category.colorCode || "#64748b"}22`,
								color: category.colorCode || "#64748b",
							}}
						>
							<Icon className="size-4" />
						</span>
						<span className="font-medium">{category.name}</span>
					</div>
				);
			},
		},
		{ id: "slug", header: t("slug"), cell: ({ row }) => <span>{row.original.slug}</span> },
		{
			id: "icon",
			header: t("icon"),
			cell: ({ row }) => <span>{valueText(row.original.iconName)}</span>,
		},
		{
			id: "system",
			header: t("system"),
			cell: ({ row }) => <span>{row.original.isSystem ? "System" : "Custom"}</span>,
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => <span>{row.original.isActive ? "Active" : "Inactive"}</span>,
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
				const category = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.CATEGORIES.VIEW,
								PERMISSIONS.INVENTORY.CATEGORIES.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<CategoryDetailsAction id={category.id} title={t("viewDetails")} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.CATEGORIES.EDIT,
								PERMISSIONS.INVENTORY.CATEGORIES.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.INVENTORY.CATEGORIES.EDIT(category.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.INVENTORY.CATEGORIES.DELETE,
								PERMISSIONS.INVENTORY.CATEGORIES.ALL,
								PERMISSIONS.INVENTORY.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(category.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && deleteId === category.id}
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
				<CategoryFilterBar filter={filter} setFilter={setFilter}>
					<CategoryCreateButton />
				</CategoryFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<CategorySummaryStats summary={summary} />
				<CategoryTrendChart
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
