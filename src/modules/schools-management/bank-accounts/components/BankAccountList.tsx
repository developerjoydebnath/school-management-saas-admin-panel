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
import { Edit2, Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useBankAccounts } from "../../hooks/use-bank-accounts";
import { BankAccountModel } from "../../models/bank-account.model";
import { deleteBankAccount } from "../hooks/use-bank-account-mutations";
import { BankAccountCreateButton } from "./BankAccountCreateButton";
import BankAccountFilterBar from "./BankAccountFilterBar";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { BankAccountDetailsSheet } from "./BankAccountDetailsSheet";

export type BankAccountFilter = {
	search: string;
	isActive: string[];
	accountPurpose: string[];
	createdFrom: string;
	createdTo: string;
};

const initialFilters: BankAccountFilter = {
	search: "",
	isActive: [],
	accountPurpose: [],
	createdFrom: "",
	createdTo: "",
};

function BankAccountDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("SchoolsManagementBankAccounts");

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm">
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<BankAccountDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export function BankAccountList() {
	const [filter, setFilter] = useState<BankAccountFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const { mutate } = useSWRConfig();
	const t = useTranslations("SchoolsManagementBankAccounts");
	const tc = useTranslations("Common");

	const { data: accounts, meta, isLoading } = useBankAccounts({
		page,
		limit,
		search: filter.search,
		isActive: filter.isActive.length === 1 ? filter.isActive[0] : "",
		accountPurpose: filter.accountPurpose,
		createdFrom: filter.createdFrom,
		createdTo: filter.createdTo,
	});

	const confirmDelete = async (id: string) => {
		setAccountToDelete(id);
		setIsDeleting(true);
		try {
			await deleteBankAccount(id);
			toast.success(t("deleteSuccess"));
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/school-bank-accounts"));
		} catch {
			// Global axios interceptor auto-toasts errors.
		} finally {
			setIsDeleting(false);
			setAccountToDelete(null);
		}
	};

	const columns: ColumnDef<BankAccountModel>[] = [
		{
			id: "school",
			header: t("school"),
			cell: ({ row }) => (
				<div className="font-medium text-primary">
					{row.original.school?.schoolName || "Unknown School"}
				</div>
			),
		},
		{
			id: "account",
			header: t("account"),
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.original.accountLabel}</div>
					<div className="text-muted-foreground text-sm capitalize">
						{row.original.accountPurpose.replace(/_/g, " ")}
					</div>
				</div>
			),
		},
		{
			id: "bank",
			header: t("bank"),
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.original.bankName}</div>
					<div className="text-muted-foreground text-sm">{row.original.bankBranch || "N/A"}</div>
				</div>
			),
		},
		{
			id: "accountDetails",
			header: t("accountDetails"),
			cell: ({ row }) => (
				<div className="bg-muted w-fit rounded-md p-2 font-mono text-sm">
					<div>A/C: {row.original.accountNo}</div>
					<div className="text-muted-foreground mt-1 text-xs">
						RTN: {row.original.bankRoutingNo || "N/A"}
					</div>
				</div>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<Badge variant={row.original.isActive ? "default" : "secondary"}>
						{row.original.isActive ? "Active" : "Inactive"}
					</Badge>
					{row.original.isPrimary && <Badge variant="outline">Primary</Badge>}
				</div>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const account = row.original;

				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.VIEW]}>
							<BankAccountDetailsAction id={account.id} />
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.EDIT]}>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.EDIT(account.id)}>
									<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.DELETE]}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(account.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && accountToDelete === account.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="outline" size="icon-sm">
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
				<BankAccountFilterBar filter={filter} setFilter={setFilter}>
					<BankAccountCreateButton />
				</BankAccountFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
				<DataTable
					columns={columns}
					data={accounts || []}
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
