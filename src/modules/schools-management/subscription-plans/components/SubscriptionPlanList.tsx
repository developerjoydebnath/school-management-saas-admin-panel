"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useSubscriptionPlans } from "../../hooks/use-subscription-plans";
import { SubscriptionPlanModel } from "../../models/subscription-plan.model";
import { deleteSubscriptionPlan } from "../hooks/use-subscription-plan-mutations";
import { SubscriptionPlanCreate } from "./SubscriptionPlanCreateButton";
import SubscriptionPlanFilterBar from "./SubscriptionPlanFilterBar";

export type SubscriptionPlanFilter = {
	search: string;
	isActive: string[];
	isPublic: string[];
	billingCycle: string[];
};

const initialFilters: SubscriptionPlanFilter = {
	search: "",
	isActive: [],
	isPublic: [],
	billingCycle: [],
};

export function SubscriptionPlanList() {
	const [filter, setFilter] = useState<SubscriptionPlanFilter>(initialFilters);
	const t = useTranslations("SubscriptionPlansPage");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const { mutate } = useSWRConfig();

	const { data: plans, meta, isLoading } = useSubscriptionPlans({
		page,
		limit,
		search: filter.search,
		isActive: filter.isActive,
		isPublic: filter.isPublic,
		billingCycle: filter.billingCycle,
	});

	const [planToDelete, setPlanToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setPlanToDelete(id);
		setIsDeleting(true);
		try {
			await deleteSubscriptionPlan(id);
			toast.success(t("deleteSuccess"));
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/subscription-plans"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setPlanToDelete(null);
		}
	};

	const columns: ColumnDef<SubscriptionPlanModel>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("planName"),
			cell: ({ row }) => <div className="font-medium text-primary">{row.original.name}</div>,
		},
		{
			id: "price",
			accessorKey: "price",
			header: t("price"),
			cell: ({ row }) => <div>BDT {row.original.price.toLocaleString()}</div>,
		},
		{
			id: "billingCycle",
			accessorKey: "billingCycle",
			header: t("billingCycle"),
			cell: ({ row }) => <div className="capitalize">{row.original.billingCycle}</div>,
		},
		{
			id: "limits",
			header: t("limits"),
			cell: ({ row }) => (
				<div className="text-sm space-y-0.5">
					<div>Students: <span className="font-medium">{row.original.maxStudents}</span></div>
					<div>Staff: <span className="font-medium">{row.original.maxStaff}</span></div>
				</div>
			),
		},
		{
			id: "visibility",
			header: t("visibility"),
			cell: ({ row }) => (
				<Badge variant={row.original.isPublic ? "default" : "secondary"} className="capitalize">
					{row.original.isPublic ? "Public" : "Private"}
				</Badge>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<Badge
					variant={row.original.status === "active" ? "default" : "secondary"}
					className="capitalize"
				>
					{row.original.status === "active" ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const plan = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.EDIT]}>
							<Button
								asChild
								variant="outline"
								size="icon"
							>
								<Link href={PATHS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.EDIT(plan.id)}>
									<Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.DELETE]}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(plan.id)}
								title={t("deletePlanTitle")}
								description={t("deletePlanDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && planToDelete === plan.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="outline" size="icon">
										<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
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
	};

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<SubscriptionPlanFilterBar filter={filter} setFilter={setFilter}>
					<SubscriptionPlanCreate />
				</SubscriptionPlanFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={plans || []}
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
