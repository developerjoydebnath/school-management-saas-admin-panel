"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { InventoryModuleKey, inventoryModules } from "../constants/inventory.constants";
import { deleteInventoryRecord } from "../hooks/use-inventory-mutations";
import { useInventoryList } from "../hooks/use-inventory";
import { InventoryCreateButton } from "./InventoryCreateButton";
import { InventoryDetailsSheet } from "./InventoryDetailsSheet";
import InventoryFilterBar from "./InventoryFilterBar";

type Props = {
	moduleKey: InventoryModuleKey;
};

type Filter = {
	search: string;
	status: string[];
	type: string[];
};

const initialFilters: Filter = { search: "", status: [], type: [] };

const trackingTypeOptions = [
	{ label: "Quantity", value: "QUANTITY" },
	{ label: "Individual", value: "INDIVIDUAL" },
];

const locationTypeOptions = [
	{ label: "Classroom", value: "CLASSROOM" },
	{ label: "Laboratory", value: "LAB" },
	{ label: "Library", value: "LIBRARY" },
	{ label: "Office", value: "OFFICE" },
	{ label: "Store", value: "STORE" },
	{ label: "Other", value: "OTHER" },
];

function valueText(value: any) {
	if (value === null || value === undefined || value === "") return "-";
	return String(value);
}

function dateText(value: any) {
	if (!value) return "-";
	return new Date(value).toLocaleDateString();
}

function InventoryDetailsAction({
	id,
	resource,
	title,
}: {
	id: string;
	resource: Exclude<import("../hooks/use-inventory").InventoryResource, "audit-logs">;
	title: string;
}) {
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
			<InventoryDetailsSheet id={id} resource={resource} open={hasOpened} />
		</Sheet>
	);
}

export default function InventoryList({ moduleKey }: Props) {
	const config = inventoryModules[moduleKey];
	const [filter, setFilter] = useState<Filter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations("Inventory");
	const tc = useTranslations("Common");

	const apiParams: Record<string, unknown> = {
		page,
		limit,
		search: filter.search,
	};
	if (filter.status.length > 0) apiParams.status = filter.status.join(",");
	if (filter.type.length > 0) {
		if (moduleKey === "items") apiParams.trackingType = filter.type.join(",");
		if (moduleKey === "locations") apiParams.locationType = filter.type.join(",");
		if (moduleKey === "movements") apiParams.movementType = filter.type.join(",");
		if (moduleKey === "maintenance") apiParams.priority = filter.type.join(",");
	}

	const { data, meta, isLoading, mutate } = useInventoryList(config.resource, apiParams);

	const confirmDelete = async (id: string) => {
		if (config.resource === "movements") return;
		setDeleteId(id);
		setIsDeleting(true);
		try {
			await deleteInventoryRecord(config.resource as any, id);
			toast.success("Record deleted successfully");
			mutate();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeleteId(null);
			setIsDeleting(false);
		}
	};

	const actionColumn: ColumnDef<any> = {
		id: "actions",
		header: t("actions"),
		cell: ({ row }) => {
			const item = row.original;
			const canHaveDetails = config.resource !== "audit-logs";
			return (
				<div className="flex items-center gap-2">
					{canHaveDetails && (
						<PermissionGuard permissions={config.permissions.view}>
							<InventoryDetailsAction
								id={item.id}
								resource={config.resource as Exclude<import("../hooks/use-inventory").InventoryResource, "audit-logs">}
								title={t("viewDetails")}
							/>
						</PermissionGuard>
					)}
					{config.editPath && (
						<PermissionGuard permissions={config.permissions.edit}>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={config.editPath(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
					)}
					{config.resource !== "movements" && config.resource !== "audit-logs" && (
						<PermissionGuard permissions={config.permissions.delete}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(item.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && deleteId === item.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm">
										<Trash2 />
									</Button>
								</AlertDialogTrigger>
							</ConfirmationModal>
						</PermissionGuard>
					)}
				</div>
			);
		},
	};

	const columnsByModule: Record<InventoryModuleKey, ColumnDef<any>[]> = {
		categories: [
			{ id: "name", header: t("categoryName"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
			{ id: "slug", header: t("slug"), cell: ({ row }) => <span>{row.original.slug}</span> },
			{ id: "icon", header: t("icon"), cell: ({ row }) => <span>{valueText(row.original.iconName)}</span> },
			{ id: "system", header: t("system"), cell: ({ row }) => <span>{row.original.isSystem ? "System" : "Custom"}</span> },
			{ id: "status", header: t("status"), cell: ({ row }) => <span>{row.original.isActive ? "Active" : "Inactive"}</span> },
			{ id: "createdAt", header: t("createdAt"), cell: ({ row }) => <span>{dateText(row.original.createdAt)}</span> },
			actionColumn,
		],
		items: [
			{ id: "name", header: t("itemName"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
			{ id: "code", header: t("code"), cell: ({ row }) => <span>{valueText(row.original.code)}</span> },
			{ id: "category", header: t("category"), cell: ({ row }) => <span>{valueText(row.original.category?.name)}</span> },
			{ id: "tracking", header: t("trackingType"), cell: ({ row }) => <span>{valueText(row.original.trackingType)}</span> },
			{ id: "unit", header: t("unit"), cell: ({ row }) => <span>{valueText(row.original.unit)}</span> },
			{ id: "minimumStock", header: t("minimumStock"), cell: ({ row }) => <span>{valueText(row.original.minimumStock)}</span> },
			{ id: "status", header: t("status"), cell: ({ row }) => <span>{row.original.isActive ? "Active" : "Inactive"}</span> },
			actionColumn,
		],
		locations: [
			{ id: "name", header: t("locationName"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
			{ id: "code", header: t("code"), cell: ({ row }) => <span>{valueText(row.original.code)}</span> },
			{ id: "type", header: t("locationType"), cell: ({ row }) => <span>{valueText(row.original.locationType)}</span> },
			{ id: "building", header: t("building"), cell: ({ row }) => <span>{[row.original.building, row.original.floor, row.original.roomNo].filter(Boolean).join(" / ") || "-"}</span> },
			{ id: "status", header: t("status"), cell: ({ row }) => <span>{valueText(row.original.status)}</span> },
			{ id: "createdAt", header: t("createdAt"), cell: ({ row }) => <span>{dateText(row.original.createdAt)}</span> },
			actionColumn,
		],
		stock: [
			{ id: "item", header: t("itemName"), cell: ({ row }) => <span className="font-medium">{valueText(row.original.item?.name)}</span> },
			{ id: "location", header: t("location"), cell: ({ row }) => <span>{valueText(row.original.location?.name)}</span> },
			{ id: "total", header: t("totalQuantity"), cell: ({ row }) => <span>{valueText(row.original.quantityTotal)}</span> },
			{ id: "good", header: t("goodQuantity"), cell: ({ row }) => <span>{valueText(row.original.quantityGood)}</span> },
			{ id: "damaged", header: t("damagedQuantity"), cell: ({ row }) => <span>{valueText(row.original.quantityDamaged)}</span> },
			{ id: "invoice", header: t("invoice"), cell: ({ row }) => row.original.invoiceImageUrl ? <FileText className="text-muted-foreground size-4" /> : <span>-</span> },
			{ id: "purchaseDate", header: t("purchaseDate"), cell: ({ row }) => <span>{dateText(row.original.purchaseDate)}</span> },
			actionColumn,
		],
		assets: [
			{ id: "assetTag", header: t("assetTag"), cell: ({ row }) => <span className="font-medium">{row.original.assetTag}</span> },
			{ id: "item", header: t("itemName"), cell: ({ row }) => <span>{valueText(row.original.item?.name)}</span> },
			{ id: "serial", header: t("serialNo"), cell: ({ row }) => <span>{valueText(row.original.serialNo)}</span> },
			{ id: "location", header: t("location"), cell: ({ row }) => <span>{valueText(row.original.location?.name)}</span> },
			{ id: "condition", header: t("condition"), cell: ({ row }) => <span>{valueText(row.original.condition)}</span> },
			{ id: "status", header: t("status"), cell: ({ row }) => <span>{valueText(row.original.status)}</span> },
			actionColumn,
		],
		movements: [
			{ id: "movement", header: t("movementType"), cell: ({ row }) => <span className="font-medium">{row.original.movementType}</span> },
			{ id: "item", header: t("itemName"), cell: ({ row }) => <span>{valueText(row.original.item?.name)}</span> },
			{ id: "from", header: t("fromLocation"), cell: ({ row }) => <span>{valueText(row.original.fromLocation?.name)}</span> },
			{ id: "to", header: t("toLocation"), cell: ({ row }) => <span>{valueText(row.original.toLocation?.name)}</span> },
			{ id: "quantity", header: t("quantity"), cell: ({ row }) => <span>{valueText(row.original.quantity)}</span> },
			{ id: "createdAt", header: t("createdAt"), cell: ({ row }) => <span>{dateText(row.original.createdAt)}</span> },
			actionColumn,
		],
		maintenance: [
			{ id: "issue", header: t("issueTitle"), cell: ({ row }) => <span className="font-medium">{row.original.issueTitle}</span> },
			{ id: "item", header: t("itemName"), cell: ({ row }) => <span>{valueText(row.original.item?.name)}</span> },
			{ id: "location", header: t("location"), cell: ({ row }) => <span>{valueText(row.original.location?.name)}</span> },
			{ id: "priority", header: t("priority"), cell: ({ row }) => <span>{valueText(row.original.priority)}</span> },
			{ id: "status", header: t("status"), cell: ({ row }) => <span>{valueText(row.original.status)}</span> },
			{ id: "reportedAt", header: t("reportedAt"), cell: ({ row }) => <span>{dateText(row.original.reportedAt)}</span> },
			actionColumn,
		],
		auditLogs: [
			{ id: "action", header: t("action"), cell: ({ row }) => <span className="font-medium">{valueText(row.original.action)}</span> },
			{ id: "entityType", header: t("entityType"), cell: ({ row }) => <span>{valueText(row.original.entityType)}</span> },
			{ id: "summary", header: t("summary"), cell: ({ row }) => <span>{valueText(row.original.summary)}</span> },
			{ id: "entityId", header: t("entityId"), cell: ({ row }) => <span className="text-muted-foreground">{valueText(row.original.entityId)}</span> },
			{ id: "createdBy", header: t("createdBy"), cell: ({ row }) => <span>{valueText(row.original.createdBy)}</span> },
			{ id: "createdAt", header: t("createdAt"), cell: ({ row }) => <span>{dateText(row.original.createdAt)}</span> },
		],
	};
	const columns = columnsByModule[moduleKey];

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	const typeOptions =
		moduleKey === "items"
			? trackingTypeOptions
			: moduleKey === "locations"
				? locationTypeOptions
				: [];

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<InventoryFilterBar
					filter={filter}
					setFilter={setFilter}
					typeOptions={typeOptions}
				>
					<InventoryCreateButton moduleKey={moduleKey} />
				</InventoryFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
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
