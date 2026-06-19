"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSchoolSubscriptions } from "../../hooks/use-school-subscriptions";
import { SchoolSubscriptionModel } from "../../models/school-subscription.model";
import SchoolSubscriptionFilterBar from "./SchoolSubscriptionFilterBar";
import { PATHS } from "@/shared/configs/paths.config";
import Link from "next/link";
import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { format } from "date-fns";

export type SchoolSubscriptionFilter = {
	search: string;
	status: string;
};

const initialFilters: SchoolSubscriptionFilter = {
	search: "",
	status: "",
};

export function SchoolSubscriptionList() {
	const [filter, setFilter] = useState<SchoolSubscriptionFilter>(initialFilters);
	const t = useTranslations("SchoolsManagement");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const { mutate } = useSWRConfig();

	const {
		data: subscriptions,
		meta,
		isLoading,
	} = useSchoolSubscriptions({
		page,
		limit,
		search: filter.search,
		status: filter.status,
	});

	const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setSubscriptionToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/superadmin/school-subscriptions/${id}`);
			toast.success("Subscription deleted successfully");
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/school-subscriptions"));
		} catch (error: any) {
			// Toast is handled automatically by axios singleton
		} finally {
			setIsDeleting(false);
			setSubscriptionToDelete(null);
		}
	};

	const columns: ColumnDef<SchoolSubscriptionModel>[] = [
		{
			id: "school",
			header: "School",
			cell: ({ row }) => (
				<div className="font-medium text-primary">
					{row.original.school?.schoolName || "Unknown School"}
				</div>
			),
		},
		{
			id: "plan",
			header: "Plan",
			cell: ({ row }) => (
				<div>
					{row.original.plan?.name || "Unknown Plan"}
				</div>
			),
		},
		{
			id: "price",
			accessorKey: "price",
			header: "Price",
			cell: ({ row }) => <div>BDT {row.original.price.toLocaleString()}</div>,
		},
		{
			id: "validity",
			header: "Validity",
			cell: ({ row }) => (
				<div className="text-sm">
					<div className="text-muted-foreground">Start: {row.original.startDate ? format(new Date(row.original.startDate), "MMM d, yyyy") : "N/A"}</div>
					<div className="text-muted-foreground">End: {row.original.endDate ? format(new Date(row.original.endDate), "MMM d, yyyy") : "N/A"}</div>
				</div>
			),
		},
		{
			id: "status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<Badge
						variant={
							status === "active"
								? "default"
								: status === "expired"
									? "secondary"
									: "destructive"
						}
						className="capitalize"
					>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const subscription = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.EDIT]}>
							<Button asChild variant="outline" size="icon">
	<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.EDIT(subscription.id)} >
		<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
	</Link>
</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.DELETE]}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(subscription.id)}
								title="Delete Subscription"
								description="Are you sure you want to delete this subscription? This action cannot be undone."
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && subscriptionToDelete === subscription.id}
							>
								<AlertDialogTrigger asChild><Button variant="outline" size="icon">
											<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
										</Button></AlertDialogTrigger>
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
				<SchoolSubscriptionFilterBar filter={filter} setFilter={setFilter}>
					<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.CREATE]}>
						<Button asChild >
	<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.CREATE} >
		<Plus className="size-4" />
							Add Subscription
	</Link>
</Button>
					</PermissionGuard>
				</SchoolSubscriptionFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable
					columns={columns}
					data={subscriptions || []}
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
