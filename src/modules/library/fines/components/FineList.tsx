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
import { cn } from "@/shared/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Banknote, HandCoins, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import LibraryStatStrip from "../../shared/components/LibraryStatStrip";
import {
	borrowerTypeColors,
	fineStatusColors,
	formatDate,
	formatMoney,
} from "../../shared/dto/library.dto";
import {
	deleteLibraryFine,
	useLibraryFines,
} from "../../shared/hooks/use-library-fines";
import FineActions from "./FineActions";
import FineCreate from "./FineCreate";
import FineFilterBar, { FineFilter } from "./FineFilterBar";

const initialFilters: FineFilter = {
	search: "",
	status: [],
	reason: [],
	borrowerType: [],
	classId: [],
	month: "",
};

export default function FineList() {
	const t = useTranslations("LibraryFines");
	const tc = useTranslations("Common");
	const [filter, setFilter] = useState<FineFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [isDeleting, setIsDeleting] = useState(false);

	const { fines, meta, summary, isLoading } = useLibraryFines({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		reason: filter.reason,
		borrowerType: filter.borrowerType,
		classId: filter.classId,
		month: filter.month,
	});

	const confirmDelete = async (id: string) => {
		setIsDeleting(true);
		try {
			await deleteLibraryFine(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "fine",
			header: t("fine"),
			cell: ({ row }) => {
				const fine = row.original;
				return (
					<div className="min-w-44 space-y-0.5">
						<p className="font-mono text-xs">{fine.fineNo}</p>
						<Badge variant="outline" className="text-[10px] font-normal">
							{t(`reasonValue.${fine.reason}`)}
						</Badge>
						{fine.loan?.bookTitle && (
							<p className="text-muted-foreground truncate text-xs">
								{fine.loan.bookTitle}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "borrower",
			header: t("borrower"),
			cell: ({ row }) => {
				const fine = row.original;
				return (
					<div className="min-w-40 space-y-1">
						<p className="text-sm">{fine.borrowerName}</p>
						<div className="flex flex-wrap items-center gap-1.5">
							<Badge
								className={cn(
									"border-transparent text-[10px] font-normal",
									borrowerTypeColors[fine.borrowerType],
								)}
							>
								{t(`borrowerTypeValue.${fine.borrowerType}`)}
							</Badge>
							{fine.borrowerCode && (
								<span className="text-muted-foreground font-mono text-xs">
									{fine.borrowerCode}
								</span>
							)}
						</div>
					</div>
				);
			},
		},
		{
			id: "amount",
			header: t("amount"),
			cell: ({ row }) => {
				const fine = row.original;
				return (
					<div className="min-w-28 space-y-0.5 text-right">
						<p className="font-medium tabular-nums">{formatMoney(fine.amount)}</p>
						{fine.daysOverdue > 0 && (
							<p className="text-muted-foreground text-xs">
								{t("daysAtRate", {
									days: fine.daysOverdue,
									rate: formatMoney(fine.ratePerDay),
								})}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const fine = row.original;
				return (
					<div className="min-w-32 space-y-1">
						<Badge
							className={cn(
								"border-transparent text-xs font-normal",
								fineStatusColors[fine.status],
							)}
						>
							{t(`statusValue.${fine.status}`)}
						</Badge>
						{fine.status === "PAID" && (
							<p className="text-muted-foreground text-xs">
								{formatDate(fine.paidAt)}
								{/* The reconciliation flag, per row: a paid fine with no Fee
								    Collection row behind it is money Finance cannot see. */}
								{!fine.postedToFeeCollection && (
									<span className="block text-amber-600 dark:text-amber-400">
										{t("notInFeeCollection")}
									</span>
								)}
							</p>
						)}
						{fine.status === "WAIVED" && fine.waiveReason && (
							<p className="text-muted-foreground truncate text-xs">
								{fine.waiveReason}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const fine = row.original;
				return (
					<div className="flex items-center gap-1">
						<FineActions fine={fine} compact />
						{fine.status === "PENDING" && (
							<>
								<PermissionGuard
									permissions={[
										PERMISSIONS.LIBRARY.FINES.EDIT,
										PERMISSIONS.LIBRARY.FINES.ALL,
										PERMISSIONS.LIBRARY.ALL,
									]}
								>
									<Button size="icon-sm" variant="outline" asChild title={tc("edit")}>
										<Link href={PATHS.LIBRARY.FINES.EDIT(fine.id)}>
											<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
										</Link>
									</Button>
								</PermissionGuard>
								<PermissionGuard
									permissions={[
										PERMISSIONS.LIBRARY.FINES.DELETE,
										PERMISSIONS.LIBRARY.FINES.ALL,
										PERMISSIONS.LIBRARY.ALL,
									]}
								>
									<ConfirmationModal
										title={t("deleteTitle")}
										description={t("deleteDescription", { fineNo: fine.fineNo })}
										onConfirm={() => confirmDelete(fine.id)}
										isLoading={isDeleting}
									>
										<AlertDialogTrigger asChild>
											<Button
												size="icon-sm"
												variant="destructive"
												title={t("deleteTitle")}
											>
												<Trash2 />
											</Button>
										</AlertDialogTrigger>
									</ConfirmationModal>
								</PermissionGuard>
							</>
						)}
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
		<div className="space-y-4">
			<LibraryStatStrip
				isLoading={isLoading && !summary}
				columns={4}
				stats={[
					{
						label: t("statPending"),
						value: formatMoney(summary?.pendingAmount),
						icon: HandCoins,
						tone: Number(summary?.pendingAmount || 0) > 0 ? "warning" : "default",
						hint: t("statCount", { count: summary?.pendingCount ?? 0 }),
					},
					{
						label: t("statCollected"),
						value: formatMoney(summary?.collectedAmount),
						icon: Banknote,
						tone: "good",
						hint: t("statCount", { count: summary?.collectedCount ?? 0 }),
					},
					{
						label: t("statWaived"),
						value: formatMoney(summary?.waivedAmount),
						hint: t("statCount", { count: summary?.waivedCount ?? 0 }),
					},
					{
						label: t("statNotInFinance"),
						value: formatMoney(summary?.notInFeeCollectionAmount),
						hint: t("statNotInFinanceHint"),
					},
				]}
			/>

			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="p-0">
					{/* The desktop copy lives in the page header; this one only
					    renders below @3xl/page, where the header has no room. */}
					<FineFilterBar filter={filter} setFilter={setFilter}>
						<FineCreate />
					</FineFilterBar>
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={setFilter}
						resetFilters={resetFilters}
						hideExport
					/>

					<DataTable
						columns={columns}
						data={fines || []}
						isLoading={isLoading}
						pagination={{
							page: meta.page,
							limit: meta.limit,
							total: meta.total,
							totalPages: meta.totalPages,
							onPageChange: setPage,
							onLimitChange: setLimit,
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
