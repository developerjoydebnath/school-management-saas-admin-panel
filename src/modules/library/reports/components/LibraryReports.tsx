"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { BookOpen, Coins, FileDown, Library, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";
import LibraryStatStrip from "../../shared/components/LibraryStatStrip";
import { formatDate, formatMoney } from "../../shared/dto/library.dto";
import { useLibraryReport } from "../../shared/hooks/use-library-fines";

const addDays = (days: number) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

/**
 * One axis per chart, always.
 *
 * Issues and returns share a count scale so they belong together; money never
 * shares a chart with counts. The palette is two hues from the same family so
 * the pair reads as one series pair rather than two competing ones.
 */
const circulationChartConfig = {
	issued: { label: "Issued", color: "var(--chart-1)" },
	returned: { label: "Returned", color: "var(--chart-2)" },
} satisfies ChartConfig;

const fineChartConfig = {
	assessed: { label: "Assessed", color: "var(--chart-1)" },
	collected: { label: "Collected", color: "var(--chart-2)" },
	waived: { label: "Waived", color: "var(--chart-3)" },
} satisfies ChartConfig;

export default function LibraryReports() {
	const t = useTranslations("LibraryReports");
	const tc = useTranslations("Common");
	const [from, setFrom] = useState(addDays(-29));
	const [to, setTo] = useState(addDays(0));
	const [tab, setTab] = useState("circulation");

	const range = { from, to };
	const { report: overview, isLoading: loadingOverview } = useLibraryReport(
		"overview",
		range,
	);
	const { report: circulation, isLoading: loadingCirculation } = useLibraryReport(
		"circulation",
		range,
	);
	const { report: inventory, isLoading: loadingInventory } = useLibraryReport(
		"inventory",
		range,
	);
	const { report: fines, isLoading: loadingFines } = useLibraryReport(
		"fines",
		range,
	);
	const { report: stock, isLoading: loadingStock } = useLibraryReport(
		"stock-check",
		{ since: from },
	);

	const print = async (type: string) => {
		try {
			await downloadPdf(
				`/library/reports/${type}/print?from=${from}&to=${to}&since=${from}`,
				`library-${type}-report.pdf`,
			);
		} catch {
			toast.error(tc("somethingWentWrong"));
		}
	};

	return (
		<div className="space-y-4">
			<Card className="shadow-none ring-0">
				<CardContent className="flex flex-wrap items-end gap-3 pt-6">
					<div className="space-y-1.5">
						<Label className="text-xs">{t("from")}</Label>
						<Input
							type="date"
							value={from}
							onChange={(event) => setFrom(event.target.value)}
							className="w-40"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-xs">{t("to")}</Label>
						<Input
							type="date"
							value={to}
							onChange={(event) => setTo(event.target.value)}
							className="w-40"
						/>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{[
							{ label: t("last30"), days: 29 },
							{ label: t("last90"), days: 89 },
							{ label: t("thisYear"), days: 364 },
						].map((preset) => (
							<Button
								key={preset.label}
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									setFrom(addDays(-preset.days));
									setTo(addDays(0));
								}}
							>
								{preset.label}
							</Button>
						))}
					</div>
					<div className="ml-auto">
						<Button variant="outline" size="sm" onClick={() => print(tab)}>
							<FileDown className="size-4" />
							{t("downloadPdf")}
						</Button>
					</div>
				</CardContent>
			</Card>

			<LibraryStatStrip
				isLoading={loadingOverview}
				columns={5}
				stats={[
					{
						label: t("statTitles"),
						value: overview?.collection?.titles ?? 0,
						icon: BookOpen,
					},
					{
						label: t("statCopies"),
						value: overview?.collection?.totalCopies ?? 0,
						icon: Library,
					},
					{
						label: t("statIssuedInRange"),
						value: overview?.circulation?.issuedInRange ?? 0,
						icon: TrendingUp,
						hint: t("turnoverHint", {
							value: overview?.circulation?.turnoverPerCopy ?? 0,
						}),
					},
					{
						label: t("statOverdue"),
						value: overview?.circulation?.overdueLoans ?? 0,
						tone:
							Number(overview?.circulation?.overdueLoans || 0) > 0
								? "warning"
								: "default",
					},
					{
						label: t("statFinesCollected"),
						value: formatMoney(overview?.fines?.collected),
						icon: Coins,
						tone: "good",
					},
				]}
			/>

			<Tabs value={tab} onValueChange={setTab}>
				<div className="overflow-x-auto">
					<TabsList>
						<TabsTrigger value="circulation">{t("tabCirculation")}</TabsTrigger>
						<TabsTrigger value="inventory">{t("tabInventory")}</TabsTrigger>
						<TabsTrigger value="fines">{t("tabFines")}</TabsTrigger>
						<TabsTrigger value="stock-check">{t("tabStockCheck")}</TabsTrigger>
					</TabsList>
				</div>

				{/* ------------------------------------------------------ circulation */}
				<TabsContent value="circulation" className="mt-4 space-y-4">
					<Card className="shadow-none ring-0">
						<CardHeader>
							<CardTitle className="text-base">{t("issuesReturnsTrend")}</CardTitle>
						</CardHeader>
						<CardContent>
							{loadingCirculation ? (
								<Skeleton className="h-64 w-full" />
							) : (
								<ChartContainer
									config={circulationChartConfig}
									className="h-64 w-full"
								>
									<AreaChart data={circulation?.trend || []}>
										<CartesianGrid vertical={false} strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
											minTickGap={24}
											tickFormatter={(value: string) => value.slice(5)}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											width={32}
											allowDecimals={false}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Area
											dataKey="issued"
											type="monotone"
											stroke="var(--color-issued)"
											fill="var(--color-issued)"
											fillOpacity={0.15}
											strokeWidth={2}
										/>
										<Area
											dataKey="returned"
											type="monotone"
											stroke="var(--color-returned)"
											fill="var(--color-returned)"
											fillOpacity={0.15}
											strokeWidth={2}
										/>
									</AreaChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-2">
						<ReportTable
							title={t("mostIssued")}
							columns={[t("book"), t("issues")]}
							rows={(circulation?.topBooks || []).map((row: any) => [
								row.title,
								row.issues,
							])}
							emptyLabel={t("noData")}
						/>
						<ReportTable
							title={t("classWise")}
							columns={[t("class"), t("borrowers"), t("issues")]}
							rows={(circulation?.byClass || []).map((row: any) => [
								row.className,
								row.borrowers,
								row.issues,
							])}
							emptyLabel={t("noData")}
						/>
					</div>

					<ReportTable
						title={t("topBorrowers")}
						columns={[t("borrower"), t("borrowerType"), t("issues")]}
						rows={(circulation?.topBorrowers || []).map((row: any) => [
							row.borrowerName,
							row.borrowerType,
							row.issues,
						])}
						emptyLabel={t("noData")}
					/>
				</TabsContent>

				{/* -------------------------------------------------------- inventory */}
				<TabsContent value="inventory" className="mt-4 space-y-4">
					<Card className="shadow-none ring-0">
						<CardHeader>
							<CardTitle className="text-base">{t("accessionGrowth")}</CardTitle>
						</CardHeader>
						<CardContent>
							{loadingInventory ? (
								<Skeleton className="h-56 w-full" />
							) : (
								<ChartContainer
									config={{ copies: { label: "Copies", color: "var(--chart-1)" } }}
									className="h-56 w-full"
								>
									<BarChart data={inventory?.growth || []}>
										<CartesianGrid vertical={false} strokeDasharray="3 3" />
										<XAxis
											dataKey="month"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											width={32}
											allowDecimals={false}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar
											dataKey="copies"
											fill="var(--color-copies)"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-2">
						<ReportTable
							title={t("byCategory")}
							columns={[t("category"), t("titles"), t("copies"), t("value")]}
							rows={(inventory?.byCategory || []).map((row: any) => [
								row.category,
								row.titles,
								row.copies,
								formatMoney(row.value),
							])}
							emptyLabel={t("noData")}
						/>
						<ReportTable
							title={t("problemCopies")}
							columns={[t("accessionNo"), t("book"), t("status")]}
							rows={(inventory?.problems || []).map((row: any) => [
								row.accessionNo,
								row.book?.title || "",
								row.status,
							])}
							emptyLabel={t("noProblemCopies")}
						/>
					</div>
				</TabsContent>

				{/* ------------------------------------------------------------ fines */}
				<TabsContent value="fines" className="mt-4 space-y-4">
					<Card className="shadow-none ring-0">
						<CardHeader>
							<CardTitle className="text-base">{t("fineTrend")}</CardTitle>
						</CardHeader>
						<CardContent>
							{loadingFines ? (
								<Skeleton className="h-56 w-full" />
							) : (
								<ChartContainer config={fineChartConfig} className="h-56 w-full">
									<BarChart data={fines?.monthly || []}>
										<CartesianGrid vertical={false} strokeDasharray="3 3" />
										<XAxis
											dataKey="month"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
										/>
										<YAxis tickLine={false} axisLine={false} width={44} />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar
											dataKey="assessed"
											fill="var(--color-assessed)"
											radius={[4, 4, 0, 0]}
										/>
										<Bar
											dataKey="collected"
											fill="var(--color-collected)"
											radius={[4, 4, 0, 0]}
										/>
										<Bar
											dataKey="waived"
											fill="var(--color-waived)"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					{/* The reconciliation gap, stated rather than buried: fines from
					    teachers and staff cannot be written to Fee Collection. */}
					{Number(fines?.notInFeeCollection?.amount || 0) > 0 && (
						<div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
							<p className="font-medium text-amber-700 dark:text-amber-400">
								{t("financeGap", {
									amount: formatMoney(fines?.notInFeeCollection?.amount),
									count: fines?.notInFeeCollection?.count ?? 0,
								})}
							</p>
							<p className="text-muted-foreground mt-1 text-xs">
								{t("financeGapHelper")}
							</p>
						</div>
					)}

					<div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-2">
						<ReportTable
							title={t("byReason")}
							columns={[t("reason"), t("count"), t("amount")]}
							rows={(fines?.byReason || []).map((row: any) => [
								row.reason,
								row.count,
								formatMoney(row.amount),
							])}
							emptyLabel={t("noData")}
						/>
						<ReportTable
							title={t("byBorrowerType")}
							columns={[t("borrowerType"), t("assessed"), t("collected")]}
							rows={(fines?.byBorrowerType || []).map((row: any) => [
								row.borrowerType,
								formatMoney(row.amount),
								formatMoney(row.collected),
							])}
							emptyLabel={t("noData")}
						/>
					</div>
				</TabsContent>

				{/* ------------------------------------------------------ stock check */}
				<TabsContent value="stock-check" className="mt-4 space-y-4">
					<LibraryStatStrip
						isLoading={loadingStock}
						columns={4}
						stats={[
							{ label: t("stockTotal"), value: stock?.totalCopies ?? 0 },
							{
								label: t("stockVerified"),
								value: stock?.verified ?? 0,
								tone: "good",
							},
							{ label: t("stockOnLoan"), value: stock?.onLoan ?? 0 },
							{
								label: t("stockNotSighted"),
								value: stock?.notSighted ?? 0,
								tone: Number(stock?.notSighted || 0) > 0 ? "warning" : "default",
							},
						]}
					/>
					<p className="text-muted-foreground text-sm">
						{t("stockHelper", { since: formatDate(stock?.since) })}
					</p>
					<ReportTable
						title={t("notSightedList")}
						columns={[t("accessionNo"), t("book"), t("rack"), t("lastVerified")]}
						rows={(stock?.items || []).map((row: any) => [
							row.accessionNo,
							row.book?.title || "",
							row.rackNo || "—",
							row.lastVerifiedAt ? formatDate(row.lastVerifiedAt) : t("never"),
						])}
						emptyLabel={t("allSighted")}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function ReportTable({
	title,
	columns,
	rows,
	emptyLabel,
}: {
	title: string;
	columns: string[];
	rows: Array<Array<string | number>>;
	emptyLabel: string;
}) {
	return (
		<Card className="shadow-none ring-0">
			<CardHeader>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								{columns.map((column, index) => (
									<TableHead
										key={column}
										className={cn(index > 0 && index === columns.length - 1 && "text-right")}
									>
										{column}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="text-muted-foreground py-8 text-center"
									>
										{emptyLabel}
									</TableCell>
								</TableRow>
							)}
							{rows.map((row, rowIndex) => (
								<TableRow key={rowIndex}>
									{row.map((cell, cellIndex) => (
										<TableCell
											key={cellIndex}
											className={cn(
												"text-sm",
												cellIndex > 0 &&
													cellIndex === row.length - 1 &&
													"text-right tabular-nums",
											)}
										>
											{cell}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
