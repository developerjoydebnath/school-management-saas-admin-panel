"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import DataTable from "@/shared/components/table/DataTable";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { ColumnDef } from "@tanstack/react-table";
import {
	Eye,
	Power,
	PowerOff,
	RefreshCcw,
	Search,
	ShieldCheck,
	Users,
	UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	formatDateTime,
	formatNumber,
	ParentRecord,
	portalBadgeClass,
} from "../../shared/parent-utils";

function SummarySkeleton() {
	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{Array.from({ length: 4 }).map((_, index) => (
				<Skeleton key={index} className="h-24 rounded-md" />
			))}
		</div>
	);
}

function StatCard({
	label,
	value,
	icon: Icon,
	accent,
}: {
	label: string;
	value: unknown;
	icon: typeof Users;
	accent?: "success" | "warning";
}) {
	return (
		<div
			className={`bg-card/70 border-border/70 flex min-h-24 items-start justify-between rounded-md border p-4 ${
				accent === "success"
					? "border-emerald-500/40 bg-emerald-500/10"
					: accent === "warning"
						? "border-amber-500/40 bg-amber-500/10"
						: ""
			}`}
		>
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm">{label}</p>
				<p className="text-2xl font-semibold">{formatNumber(value)}</p>
			</div>
			<Icon className="text-muted-foreground size-4" />
		</div>
	);
}

export default function ParentDirectory() {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [status, setStatus] = useState("all");
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setPage(1);
			setSearch(searchInput.trim());
		}, 300);
		return () => window.clearTimeout(timeout);
	}, [searchInput]);

	const query = useMemo(
		() => ({
			page,
			limit,
			status: status === "all" ? undefined : status,
			search: search || undefined,
		}),
		[limit, page, search, status]
	);

	const { data: parents, meta, isLoading, mutate } = useTableData("/parents", query);
	const {
		data: summaryResponse,
		isLoading: isSummaryLoading,
		mutate: mutateSummary,
	} = useSWR("/parents/summary", {
		status: status === "all" ? undefined : status,
		search: search || undefined,
	});
	const summary = summaryResponse?.data;

	const togglePortal = useCallback(
		async (parent: ParentRecord) => {
			setUpdatingId(parent.id);
			try {
				const response = await axios.patch(`/parents/${parent.id}/portal-access`, {
					isActive: !parent.isActive,
				});
				toast.success(response.data?.message || "Parent portal access updated.");
				await Promise.all([mutate?.(), mutateSummary?.()]);
			} catch (error: any) {
				toast.error(
					error?.response?.data?.message || "Failed to update parent portal access."
				);
			} finally {
				setUpdatingId(null);
			}
		},
		[mutate, mutateSummary]
	);

	const resetFilters = () => {
		setStatus("all");
		setSearchInput("");
		setSearch("");
		setPage(1);
	};

	const columns: ColumnDef<ParentRecord>[] = useMemo(
		() => [
			{
				id: "parent",
				header: "Parent",
				cell: ({ row }) => (
					<div className="space-y-1">
						<p className="font-semibold">{row.original.name || "Parent"}</p>
						<p className="text-muted-foreground font-mono text-xs">
							{row.original.username || "-"}
						</p>
					</div>
				),
			},
			{
				id: "contact",
				header: "Contact",
				cell: ({ row }) => (
					<div className="space-y-1 text-sm">
						<p>{row.original.phone || "-"}</p>
						<p className="text-muted-foreground">{row.original.email || "-"}</p>
					</div>
				),
			},
			{
				id: "children",
				header: "Children",
				cell: ({ row }) => (
					<div className="space-y-2">
						<p className="text-sm font-medium">
							{formatNumber(row.original.childCount)} linked
						</p>
						<div className="flex flex-wrap gap-1">
							{(row.original.childrenPreview || []).slice(0, 2).map((child) => (
								<Badge key={child.id} variant="secondary" className="text-xs">
									{child.fullName || child.studentIdNo || "Student"}
								</Badge>
							))}
						</div>
					</div>
				),
			},
			{
				id: "portal",
				header: "Portal",
				cell: ({ row }) => (
					<span
						className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${portalBadgeClass(
							row.original.isActive
						)}`}
					>
						{row.original.isActive ? "Active" : "Disabled"}
					</span>
				),
			},
			{
				id: "lastLogin",
				header: "Last Login",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-sm">
						{formatDateTime(row.original.lastLogin)}
					</span>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<Button asChild variant="outline" size="icon-sm" title="View details">
							<Link href={`/parents/directory/${row.original.id}/details`}>
								<Eye className="size-3.5" />
							</Link>
						</Button>
						<ConfirmationModal
							title={
								row.original.isActive
									? "Disable parent portal access?"
									: "Enable parent portal access?"
							}
							description={
								row.original.isActive
									? "The parent will no longer be able to sign in to the parent portal."
									: "The parent will be able to sign in and view linked children."
							}
							confirmText={row.original.isActive ? "Disable" : "Enable"}
							variant={row.original.isActive ? "destructive" : "default"}
							isLoading={updatingId === row.original.id}
							onConfirm={() => togglePortal(row.original)}
						>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="icon-sm"
									title={row.original.isActive ? "Disable portal" : "Enable portal"}
								>
									{row.original.isActive ? (
										<PowerOff className="size-3.5" />
									) : (
										<Power className="size-3.5" />
									)}
								</Button>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</div>
				),
			},
		],
		[togglePortal, updatingId]
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Parent Directory</h1>
				<p className="text-muted-foreground">
					Manage parent accounts and linked student profiles.
				</p>
			</div>

			{isSummaryLoading ? (
				<SummarySkeleton />
			) : (
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					<StatCard label="Total Parents" value={summary?.totalParents} icon={UsersRound} />
					<StatCard
						label="Active Portal"
						value={summary?.activeParents}
						icon={ShieldCheck}
						accent="success"
					/>
					<StatCard
						label="Disabled Portal"
						value={summary?.inactiveParents}
						icon={PowerOff}
						accent="warning"
					/>
					<StatCard label="Linked Students" value={summary?.linkedStudents} icon={Users} />
				</div>
			)}

			<div className="bg-card/70 border-border/70 space-y-4 rounded-md border p-4">
				<div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
					<Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
						<SelectTrigger>
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="active">Active Portal</SelectItem>
							<SelectItem value="inactive">Disabled Portal</SelectItem>
						</SelectContent>
					</Select>
					<div className="relative">
						<Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
						<Input
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Search parent, username, phone, or email"
							className="pl-9"
						/>
					</div>
					<Button variant="outline" onClick={resetFilters}>
						<RefreshCcw className="mr-2 size-4" />
						Reset
					</Button>
				</div>

				<DataTable
					data={parents}
					columns={columns}
					isLoading={isLoading}
					pagination={{
						page,
						limit,
						total: meta.total,
						totalPages: meta.totalPages,
						onPageChange: setPage,
						onLimitChange: (nextLimit) => {
							setLimit(nextLimit);
							setPage(1);
						},
					}}
				/>
			</div>
		</div>
	);
}
