"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PATHS } from "@/shared/configs/paths.config";
import Link from "next/link";
import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";

type BankAccountFilter = {
	search: string;
	status: string;
};

export function BankAccountList() {
	const [filter, setFilter] = useState<BankAccountFilter>({ search: "", status: "" });
	const t = useTranslations("SchoolsManagement");
	const tc = useTranslations("Common");

	// Mock Data for Bank Accounts
	const mockData = [
		{
			id: "ba_001",
			schoolName: "City International School",
			bankName: "Standard Chartered Bank",
			accountName: "City Int School Operations",
			accountNumber: "xxxx-xxxx-4592",
			routingNumber: "SCB000123",
			status: "active",
			currency: "BDT",
		},
		{
			id: "ba_002",
			schoolName: "Sunshine Academy",
			bankName: "City Bank",
			accountName: "Sunshine Fee Collection",
			accountNumber: "xxxx-xxxx-8831",
			routingNumber: "CTY000456",
			status: "active",
			currency: "BDT",
		},
		{
			id: "ba_003",
			schoolName: "Global Scholars College",
			bankName: "BRAC Bank",
			accountName: "Global Scholars Main",
			accountNumber: "xxxx-xxxx-1102",
			routingNumber: "BRC000789",
			status: "pending",
			currency: "BDT",
		},
	];

	const columns: ColumnDef<any>[] = [
		{
			id: "schoolName",
			accessorKey: "schoolName",
			header: "School",
			cell: ({ row }) => <div className="font-medium text-primary">{row.original.schoolName}</div>,
		},
		{
			id: "bankInfo",
			header: "Bank Information",
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.original.bankName}</div>
					<div className="text-muted-foreground text-sm">{row.original.accountName}</div>
				</div>
			),
		},
		{
			id: "accountDetails",
			header: "Account Details",
			cell: ({ row }) => (
				<div className="text-sm font-mono bg-muted p-2 rounded-md w-fit">
					<div>A/C: {row.original.accountNumber}</div>
					<div className="text-muted-foreground text-xs mt-1">RTN: {row.original.routingNumber}</div>
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
								: status === "pending"
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
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.EDIT]}>
							<Button variant="outline" size="icon">
								<Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.DELETE]}>
							<Button variant="outline" size="icon">
								<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
							</Button>
						</PermissionGuard>
					</div>
				);
			},
		},
	];

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<div>
					<FilterDesktopWrapper>
						<FilterButton
							title="Status"
							selected={filter.status ? [filter.status] : []}
							onSelect={(values: string[]) => setFilter({ ...filter, status: values[0] || "" })}
							clearFilter={() => setFilter({ ...filter, status: "" })}
							options={[{ label: "Active", value: "active" }, { label: "Pending", value: "pending" }]}
						/>
					</FilterDesktopWrapper>
					<FilterMobileWrapper>
						<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.CREATE]}>
							<Button asChild >
	<Link href={PATHS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.CREATE} >
		<Plus className="size-4" />
								Add Account
	</Link>
</Button>
						</PermissionGuard>
						<FilterContainer>
							<FilterTriggerButton className="w-fit">
								<span className="flex items-center gap-2">
									<IconFilter strokeWidth={1.5} className="size-4" />
									<span>Filter</span>
								</span>
							</FilterTriggerButton>
							<FilterContent>
								<FilterButton
									title="Status"
									selected={filter.status ? [filter.status] : []}
									onSelect={(values: string[]) => setFilter({ ...filter, status: values[0] || "" })}
									clearFilter={() => setFilter({ ...filter, status: "" })}
									options={[{ label: "Active", value: "active" }, { label: "Pending", value: "pending" }]}
								/>
							</FilterContent>
						</FilterContainer>
					</FilterMobileWrapper>
				</div>
			</CardHeader>

			<CardContent className="space-y-4 p-0 mt-4">
				<DataTable
					columns={columns}
					data={mockData.filter(d => !filter.status || d.status === filter.status)}
					isLoading={false}
				/>
			</CardContent>
		</Card>
	);
}
