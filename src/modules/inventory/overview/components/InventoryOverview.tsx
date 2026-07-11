"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import * as LucideIcons from "lucide-react";
import {
	AlertTriangle,
	Archive,
	ArrowRightLeft,
	Boxes,
	ClipboardList,
	CornerDownLeft,
	MapPin,
	PackageCheck,
	PackageMinus,
	PackagePlus,
	PackageX,
	RefreshCcw,
	ShieldCheck,
	Wrench,
	Warehouse,
	type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";
import { useInventoryOverview } from "../hooks/use-inventory-overview";

type CountItem = {
	status?: string;
	condition?: string;
	priority?: string;
	count: number;
};

type OverviewData = {
	categoryCount?: number;
	itemCount?: number;
	activeItemCount?: number;
	locationCount?: number;
	assetCount?: number;
	assignedAssetCount?: number;
	inStoreAssetCount?: number;
	damagedBatchCount?: number;
	maintenanceCount?: number;
	urgentMaintenanceCount?: number;
	lowStockCount?: number;
	expiringWarrantyCount?: number;
	totalStockValue?: number;
	stockHealthPercent?: number;
	stock?: {
		total?: number;
		good?: number;
		damaged?: number;
		disposed?: number;
		healthPercent?: number;
		lowStockItems?: Array<{
			id: string;
			name: string;
			code?: string | null;
			unit?: string;
			minimumStock: number;
			available: number;
			category?: { name?: string | null };
		}>;
	};
	assets?: {
		statuses?: CountItem[];
		conditions?: CountItem[];
	};
	maintenance?: {
		priorities?: CountItem[];
		openItems?: Array<{
			id: string;
			issueTitle: string;
			status: string;
			priority: string;
			reportedAt?: string;
			item?: { name?: string | null; code?: string | null };
			location?: { name?: string | null };
		}>;
	};
	warranties?: {
		assets?: Array<{
			id: string;
			assetTag: string;
			warrantyExpires?: string;
			item?: { name?: string | null; code?: string | null };
			location?: { name?: string | null };
		}>;
		stockBatches?: Array<{
			id: string;
			warrantyExpires?: string;
			item?: { name?: string | null; code?: string | null };
			location?: { name?: string | null };
		}>;
	};
	recentMovements?: Array<{
		id: string;
		movementType: string;
		quantity: number;
		createdAt?: string;
		item?: { name?: string | null; code?: string | null };
		fromLocation?: { name?: string | null };
		toLocation?: { name?: string | null };
	}>;
	topCategories?: Array<{
		id: string;
		name: string;
		iconName?: string | null;
		colorCode?: string | null;
		itemCount: number;
		assetCount: number;
		stockGood: number;
	}>;
	topLocations?: Array<{
		id: string;
		name: string;
		locationType: string;
		stockGood: number;
		assetCount: number;
		classRoom?: {
			roomNo?: string | null;
			building?: string | null;
			floor?: string | null;
		} | null;
	}>;
	auditLogs?: Array<{
		id: string;
		action: string;
		entityType: string;
		summary?: string | null;
		changedByName?: string | null;
		createdAt?: string;
	}>;
};

const emptyData: OverviewData = {};

function formatNumber(value?: number) {
	return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatCurrency(value?: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "BDT",
		maximumFractionDigits: 0,
	}).format(value || 0);
}

function formatDate(value?: string, locale = "en") {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

function StatCard({
	title,
	value,
	description,
	icon: Icon,
	tone = "default",
	isLoading,
	href,
}: {
	title: string;
	value: string;
	description: string;
	icon: LucideIcon;
	tone?: "default" | "success" | "warning" | "danger";
	isLoading?: boolean;
	href?: string;
}) {
	const content = (
		<div
			className={cn(
				"bg-card/70 hover:bg-card flex h-full min-h-[132px] flex-col rounded-md border p-4 transition-colors",
				tone === "success" && "border-emerald-500/25 bg-emerald-500/5",
				tone === "warning" && "border-amber-500/25 bg-amber-500/5",
				tone === "danger" && "border-red-500/25 bg-red-500/5"
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<p className="text-muted-foreground text-sm">{title}</p>
				<Icon className="text-muted-foreground h-4 w-4 shrink-0" />
			</div>
			{isLoading ? (
				<Skeleton className="mt-4 h-7 w-24" />
			) : (
				<p className="mt-3 text-2xl font-semibold leading-none">{value}</p>
			)}
			<p className="text-muted-foreground mt-3 text-xs leading-5">{description}</p>
		</div>
	);

	if (!href) return content;
	return (
		<Link href={href} className="block h-full">
			{content}
		</Link>
	);
}

function SectionPanel({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("bg-card/60 rounded-md border p-4", className)}>
			<div className="mb-4">
				<h2 className="text-base font-medium">{title}</h2>
				{description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
			</div>
			{children}
		</section>
	);
}

function EmptyState({ text }: { text: string }) {
	return (
		<div className="text-muted-foreground flex min-h-24 items-center justify-center rounded-md border border-dashed text-sm">
			{text}
		</div>
	);
}

function BreakdownBar({ label, count, total }: { label: string; count: number; total: number }) {
	const percent = total > 0 ? Math.round((count / total) * 100) : 0;
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-3 text-sm">
				<span className="truncate">{label}</span>
				<span className="text-muted-foreground shrink-0">
					{formatNumber(count)} · {percent}%
				</span>
			</div>
			<Progress value={percent} className="h-2" />
		</div>
	);
}

function getMovementIcon(type: string): LucideIcon {
	switch (type) {
		case "PURCHASE":
			return PackagePlus;
		case "TRANSFER":
			return ArrowRightLeft;
		case "ISSUE":
			return PackageMinus;
		case "RETURN":
			return CornerDownLeft;
		case "DAMAGE":
		case "DISPOSE":
		case "LOST":
			return PackageX;
		case "REPAIR_OUT":
		case "REPAIR_IN":
			return Wrench;
		default:
			return RefreshCcw;
	}
}

function getCategoryIcon(iconName?: string | null): LucideIcon {
	if (!iconName) return LucideIcons.Package;
	const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
	return Icon || LucideIcons.Package;
}

export default function InventoryOverview() {
	const { data: response, isLoading } = useInventoryOverview();
	const data: OverviewData = response?.data || response || emptyData;
	const t = useTranslations("Inventory");
	const locale = useLocale();

	const stockTotal =
		(data.stock?.good || 0) + (data.stock?.damaged || 0) + (data.stock?.disposed || 0);
	const assetStatusTotal =
		data.assets?.statuses?.reduce((sum, item) => sum + item.count, 0) || 0;
	const assetConditionTotal =
		data.assets?.conditions?.reduce((sum, item) => sum + item.count, 0) || 0;
	const warrantyItems = [
		...(data.warranties?.assets || []).map((item) => ({
			id: item.id,
			title: item.assetTag,
			subtitle: item.item?.name || "-",
			date: item.warrantyExpires,
			location: item.location?.name,
		})),
		...(data.warranties?.stockBatches || []).map((item) => ({
			id: item.id,
			title: item.item?.name || "-",
			subtitle: item.item?.code || t("stockBatch"),
			date: item.warrantyExpires,
			location: item.location?.name,
		})),
	].slice(0, 6);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-3 @xl/page:grid-cols-2 @4xl/page:grid-cols-4">
				<StatCard
					title={t("inventoryValue")}
					value={formatCurrency(data.totalStockValue)}
					description={t("inventoryValueDescription")}
					icon={Warehouse}
					isLoading={isLoading}
					href={PATHS.INVENTORY.STOCK.ROOT}
				/>
				<StatCard
					title={t("stockHealth")}
					value={`${data.stockHealthPercent || 0}%`}
					description={t("stockHealthDescription")}
					icon={PackageCheck}
					tone={(data.stockHealthPercent || 0) >= 80 ? "success" : "warning"}
					isLoading={isLoading}
					href={PATHS.INVENTORY.STOCK.ROOT}
				/>
				<StatCard
					title={t("openMaintenance")}
					value={formatNumber(data.maintenanceCount)}
					description={t("openMaintenanceDescription", {
						count: data.urgentMaintenanceCount || 0,
					})}
					icon={Wrench}
					tone={(data.urgentMaintenanceCount || 0) > 0 ? "danger" : "default"}
					isLoading={isLoading}
					href={PATHS.INVENTORY.MAINTENANCE.ROOT}
				/>
				<StatCard
					title={t("attentionNeeded")}
					value={formatNumber((data.lowStockCount || 0) + (data.expiringWarrantyCount || 0))}
					description={t("attentionNeededDescription", {
						stock: data.lowStockCount || 0,
						warranty: data.expiringWarrantyCount || 0,
					})}
					icon={AlertTriangle}
					tone={(data.lowStockCount || 0) + (data.expiringWarrantyCount || 0) > 0 ? "warning" : "success"}
					isLoading={isLoading}
				/>
			</div>

			<div className="grid grid-cols-1 gap-3 @2xl/page:grid-cols-3">
				<SectionPanel title={t("catalogCoverage")} description={t("catalogCoverageDescription")}>
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("categories")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.categoryCount)}</p>
						</div>
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("items")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.itemCount)}</p>
						</div>
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("activeItems")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.activeItemCount)}</p>
						</div>
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("locations")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.locationCount)}</p>
						</div>
					</div>
				</SectionPanel>

				<SectionPanel title={t("stockPosition")} description={t("stockPositionDescription")}>
					<div className="space-y-4">
						<BreakdownBar label={t("goodStock")} count={data.stock?.good || 0} total={stockTotal} />
						<BreakdownBar label={t("damagedStock")} count={data.stock?.damaged || 0} total={stockTotal} />
						<BreakdownBar label={t("disposedStock")} count={data.stock?.disposed || 0} total={stockTotal} />
					</div>
				</SectionPanel>

				<SectionPanel title={t("assetPosition")} description={t("assetPositionDescription")}>
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("totalAssets")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.assetCount)}</p>
						</div>
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("assignedAssets")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.assignedAssetCount)}</p>
						</div>
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("storeAssets")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.inStoreAssetCount)}</p>
						</div>
						<div className="rounded-md border p-3">
							<p className="text-muted-foreground text-xs">{t("damagedBatches")}</p>
							<p className="mt-2 text-xl font-semibold">{formatNumber(data.damagedBatchCount)}</p>
						</div>
					</div>
				</SectionPanel>
			</div>

			<div className="grid grid-cols-1 gap-3 @3xl/page:grid-cols-2">
				<SectionPanel title={t("lowStockWatch")} description={t("lowStockWatchDescription")}>
					<div className="space-y-2">
						{isLoading ? (
							Array.from({ length: 4 }).map((_, index) => (
								<Skeleton key={index} className="h-14 rounded-md" />
							))
						) : data.stock?.lowStockItems?.length ? (
							data.stock.lowStockItems.map((item) => (
								<div key={item.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{item.name}</p>
											<p className="text-muted-foreground mt-1 text-xs">
												{item.category?.name || "-"} · {item.code || "-"}
											</p>
										</div>
										<Badge variant="secondary" className="shrink-0">
											{formatNumber(item.available)} / {formatNumber(item.minimumStock)} {item.unit || ""}
										</Badge>
									</div>
								</div>
							))
						) : (
							<EmptyState text={t("noLowStock")} />
						)}
					</div>
				</SectionPanel>

				<SectionPanel title={t("maintenanceQueue")} description={t("maintenanceQueueDescription")}>
					<div className="space-y-2">
						{isLoading ? (
							Array.from({ length: 4 }).map((_, index) => (
								<Skeleton key={index} className="h-14 rounded-md" />
							))
						) : data.maintenance?.openItems?.length ? (
							data.maintenance.openItems.map((item) => (
								<div key={item.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{item.issueTitle}</p>
											<p className="text-muted-foreground mt-1 text-xs">
												{item.item?.name || "-"} · {item.location?.name || "-"}
											</p>
										</div>
										<div className="flex shrink-0 gap-2">
											<Badge variant="secondary">{item.priority}</Badge>
											<Badge variant="outline">{item.status}</Badge>
										</div>
									</div>
								</div>
							))
						) : (
							<EmptyState text={t("noMaintenance")} />
						)}
					</div>
				</SectionPanel>
			</div>

			<div className="grid grid-cols-1 gap-3 @3xl/page:grid-cols-2 @5xl/page:grid-cols-4">
				<SectionPanel title={t("assetStatus")} description={t("assetStatusDescription")}>
					<div className="space-y-4">
						{(data.assets?.statuses || []).map((item) => (
							<BreakdownBar
								key={item.status}
								label={item.status || "-"}
								count={item.count}
								total={assetStatusTotal}
							/>
						))}
						{!isLoading && !data.assets?.statuses?.length && <EmptyState text={t("noAssets")} />}
					</div>
				</SectionPanel>

				<SectionPanel title={t("assetCondition")} description={t("assetConditionDescription")}>
					<div className="space-y-4">
						{(data.assets?.conditions || []).map((item) => (
							<BreakdownBar
								key={item.condition}
								label={item.condition || "-"}
								count={item.count}
								total={assetConditionTotal}
							/>
						))}
						{!isLoading && !data.assets?.conditions?.length && <EmptyState text={t("noAssets")} />}
					</div>
				</SectionPanel>

				<SectionPanel title={t("maintenancePriority")} description={t("maintenancePriorityDescription")}>
					<div className="space-y-4">
						{(data.maintenance?.priorities || []).map((item) => (
							<BreakdownBar
								key={item.priority}
								label={item.priority || "-"}
								count={item.count}
								total={data.maintenanceCount || 0}
							/>
						))}
						{!isLoading && !data.maintenance?.priorities?.length && (
							<EmptyState text={t("noMaintenance")} />
						)}
					</div>
				</SectionPanel>

				<SectionPanel title={t("warrantyWatch")} description={t("warrantyWatchDescription")}>
					<div className="space-y-2">
						{isLoading ? (
							Array.from({ length: 4 }).map((_, index) => (
								<Skeleton key={index} className="h-14 rounded-md" />
							))
						) : warrantyItems.length ? (
							warrantyItems.map((item) => (
								<div key={item.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{item.title}</p>
											<p className="text-muted-foreground mt-1 text-xs">
												{item.subtitle} · {item.location || "-"}
											</p>
										</div>
										<Badge variant="outline" className="shrink-0">
											{formatDate(item.date, locale)}
										</Badge>
									</div>
								</div>
							))
						) : (
							<EmptyState text={t("noWarrantyRisk")} />
						)}
					</div>
				</SectionPanel>
			</div>

			<div className="grid grid-cols-1 gap-3 @3xl/page:grid-cols-2">
				<SectionPanel title={t("categoryDistribution")} description={t("categoryDistributionDescription")}>
					<div className="space-y-2">
						{data.topCategories?.length ? (
							data.topCategories.map((category) => {
								const CategoryIcon = getCategoryIcon(category.iconName);

								return (
								<div key={category.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-center justify-between gap-3">
										<div className="flex min-w-0 items-center gap-2">
											<span
												className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
												style={{
													backgroundColor: category.colorCode
														? `${category.colorCode}20`
														: undefined,
													borderColor: category.colorCode || undefined,
													color: category.colorCode || undefined,
												}}
											>
												<CategoryIcon className="h-4 w-4" />
											</span>
											<p className="truncate text-sm font-medium">{category.name}</p>
										</div>
										<p className="text-muted-foreground shrink-0 text-xs">
											{formatNumber(category.itemCount)} {t("items")} ·{" "}
											{formatNumber(category.assetCount)} {t("assets")} ·{" "}
											{formatNumber(category.stockGood)} {t("stock")}
										</p>
									</div>
								</div>
								);
							})
						) : (
							<EmptyState text={t("noCategoryData")} />
						)}
					</div>
				</SectionPanel>

				<SectionPanel title={t("locationLoad")} description={t("locationLoadDescription")}>
					<div className="space-y-2">
						{data.topLocations?.length ? (
							data.topLocations.map((location) => (
								<div key={location.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{location.name}</p>
											<p className="text-muted-foreground mt-1 text-xs">
												{location.classRoom?.roomNo || location.locationType} ·{" "}
												{location.classRoom?.building || "-"} · {location.classRoom?.floor || "-"}
											</p>
										</div>
										<p className="text-muted-foreground shrink-0 text-xs">
											{formatNumber(location.stockGood)} {t("stock")} ·{" "}
											{formatNumber(location.assetCount)} {t("assets")}
										</p>
									</div>
								</div>
							))
						) : (
							<EmptyState text={t("noLocationData")} />
						)}
					</div>
				</SectionPanel>
			</div>

			<div className="grid grid-cols-1 gap-3 @3xl/page:grid-cols-2">
				<SectionPanel title={t("recentMovements")} description={t("recentMovementsDescription")}>
					<div className="space-y-2">
						{data.recentMovements?.length ? (
							data.recentMovements.map((movement) => {
								const MovementIcon = getMovementIcon(movement.movementType);

								return (
								<div key={movement.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-start gap-3">
										<MovementIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-3">
												<p className="truncate text-sm font-medium">{movement.item?.name || "-"}</p>
												<Badge variant="secondary" className="shrink-0">
													{movement.movementType}
												</Badge>
											</div>
											<p className="text-muted-foreground mt-1 text-xs">
												{formatNumber(movement.quantity)} - {movement.fromLocation?.name || "-"} to{" "}
												{movement.toLocation?.name || "-"} - {formatDate(movement.createdAt, locale)}
											</p>
										</div>
									</div>
								</div>
								);
							})
						) : (
							<EmptyState text={t("noMovements")} />
						)}
					</div>
				</SectionPanel>

				<SectionPanel title={t("latestAudit")} description={t("latestAuditDescription")}>
					<div className="space-y-2">
						{data.auditLogs?.length ? (
							data.auditLogs.map((log) => (
								<div key={log.id} className="hover:bg-muted/40 rounded-md border p-3 transition-colors">
									<div className="flex items-start gap-3">
										<ClipboardList className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-3">
												<p className="truncate text-sm font-medium">{log.summary || log.entityType}</p>
												<Badge variant="outline" className="shrink-0">
													{log.action}
												</Badge>
											</div>
											<p className="text-muted-foreground mt-1 text-xs">
												{log.changedByName || "-"} · {formatDate(log.createdAt, locale)}
											</p>
										</div>
									</div>
								</div>
							))
						) : (
							<EmptyState text={t("noAuditLogs")} />
						)}
					</div>
				</SectionPanel>
			</div>

			<div className="grid grid-cols-1 gap-3 @xl/page:grid-cols-2 @4xl/page:grid-cols-4">
				<Link href={PATHS.INVENTORY.ITEMS.ROOT} className="hover:bg-muted/40 rounded-md border p-4 transition-colors">
					<Boxes className="text-muted-foreground h-4 w-4" />
					<p className="mt-3 text-sm font-medium">{t("manageItems")}</p>
					<p className="text-muted-foreground mt-1 text-xs">{t("manageItemsDescription")}</p>
				</Link>
				<Link href={PATHS.INVENTORY.STOCK.ROOT} className="hover:bg-muted/40 rounded-md border p-4 transition-colors">
					<Archive className="text-muted-foreground h-4 w-4" />
					<p className="mt-3 text-sm font-medium">{t("reviewStock")}</p>
					<p className="text-muted-foreground mt-1 text-xs">{t("reviewStockDescription")}</p>
				</Link>
				<Link href={PATHS.INVENTORY.ASSETS.ROOT} className="hover:bg-muted/40 rounded-md border p-4 transition-colors">
					<ShieldCheck className="text-muted-foreground h-4 w-4" />
					<p className="mt-3 text-sm font-medium">{t("reviewAssets")}</p>
					<p className="text-muted-foreground mt-1 text-xs">{t("reviewAssetsDescription")}</p>
				</Link>
				<Link href={PATHS.INVENTORY.LOCATIONS.ROOT} className="hover:bg-muted/40 rounded-md border p-4 transition-colors">
					<MapPin className="text-muted-foreground h-4 w-4" />
					<p className="mt-3 text-sm font-medium">{t("reviewLocations")}</p>
					<p className="text-muted-foreground mt-1 text-xs">{t("reviewLocationsDescription")}</p>
				</Link>
			</div>
		</div>
	);
}
