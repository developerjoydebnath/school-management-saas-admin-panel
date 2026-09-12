"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
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
import { BookCopy, BookOpen, Eye, Library, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import LibraryStatStrip from "../../shared/components/LibraryStatStrip";
import { deleteLibraryBook, useLibraryBooks } from "../../shared/hooks/use-library";
import CatalogActions from "./CatalogActions";
import CatalogFilterBar, { CatalogFilter } from "./CatalogFilterBar";

const initialFilters: CatalogFilter = {
	search: "",
	categoryId: [],
	language: [],
	availability: [],
	isReference: [],
};

/**
 * The catalog: one row per TITLE, with the availability of its copies.
 *
 * "3 / 5 available" is the number a librarian is actually looking for — it is
 * the only reason the copy counts are summarised onto the title row at all.
 */
export default function CatalogList() {
	const [filter, setFilter] = useState<CatalogFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations("LibraryCatalog");
	const tc = useTranslations("Common");

	const { books, meta, summary, isLoading } = useLibraryBooks({
		page,
		limit,
		search: filter.search,
		categoryId: filter.categoryId,
		language: filter.language,
		availability: filter.availability[0],
		isReference: filter.isReference[0],
	});

	const confirmDelete = async (id: string) => {
		setIsDeleting(true);
		try {
			await deleteLibraryBook(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "book",
			header: t("bookTitle"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex min-w-64 items-start gap-3">
						<div className="bg-muted flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded">
							{item.coverUrl ? (
								<ProgressiveImage
									src={item.coverUrl}
									placeholderBase64={item.coverPlaceholder}
									alt={item.title}
									width={40}
									height={56}
									className="h-14 w-10 object-cover"
								/>
							) : (
								<BookOpen className="text-muted-foreground size-4" />
							)}
						</div>
						<div className="min-w-0 space-y-0.5">
							<Link
								href={PATHS.LIBRARY.CATALOG.DETAILS(item.id)}
								className="hover:text-primary block font-medium"
							>
								{item.title}
							</Link>
							{item.titleBn && (
								<p className="text-muted-foreground truncate text-xs">
									{item.titleBn}
								</p>
							)}
							<p className="text-muted-foreground truncate text-xs">
								{item.author}
							</p>
						</div>
					</div>
				);
			},
		},
		{
			id: "category",
			header: t("category"),
			cell: ({ row }) => (
				<div className="min-w-24 space-y-0.5">
					<span className="text-sm">{row.original.category?.name || "—"}</span>
					{row.original.callNumber && (
						<p className="text-muted-foreground font-mono text-xs">
							{row.original.callNumber}
						</p>
					)}
				</div>
			),
		},
		{
			id: "availability",
			header: t("availability"),
			cell: ({ row }) => {
				const item = row.original;
				if (item.isReference) {
					return (
						<Badge variant="outline" className="gap-1 text-xs font-normal">
							<Library className="size-3" />
							{t("referenceOnly")}
						</Badge>
					);
				}
				const available = Number(item.availableCopies || 0);
				const total = Number(item.totalCopies || 0);
				return (
					<div className="min-w-28 space-y-1">
						<span
							className={cn(
								"text-sm font-medium tabular-nums",
								available === 0 && total > 0 && "text-amber-600 dark:text-amber-400",
								available > 0 && "text-emerald-600 dark:text-emerald-400",
							)}
						>
							{t("availableOf", { available, total })}
						</span>
						{Number(item.lostCopies || 0) > 0 && (
							<p className="text-muted-foreground text-xs">
								{t("lostCount", { count: item.lostCopies })}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "publisher",
			header: t("publisher"),
			cell: ({ row }) => (
				<div className="min-w-32 space-y-0.5">
					<span className="text-sm">{row.original.publisher || "—"}</span>
					{row.original.publishYear && (
						<p className="text-muted-foreground text-xs">
							{row.original.publishYear}
						</p>
					)}
				</div>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex items-center gap-1">
						<Button variant="outline" size="icon-sm" asChild>
							<Link href={PATHS.LIBRARY.CATALOG.DETAILS(item.id)}>
								<Eye className="size-4" />
							</Link>
						</Button>
						<PermissionGuard
							permissions={[
								PERMISSIONS.LIBRARY.CATALOG.EDIT,
								PERMISSIONS.LIBRARY.CATALOG.ALL,
								PERMISSIONS.LIBRARY.ALL,
							]}
						>
							<Button variant="outline" size="icon-sm" asChild>
								<Link href={PATHS.LIBRARY.CATALOG.EDIT(item.id)}>
									<Pencil className="size-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.LIBRARY.CATALOG.DELETE,
								PERMISSIONS.LIBRARY.CATALOG.ALL,
								PERMISSIONS.LIBRARY.ALL,
							]}
						>
							<ConfirmationModal
								title={t("deleteTitle")}
								description={t("deleteDescription", { title: item.title })}
								onConfirm={() => confirmDelete(item.id)}
								isLoading={isDeleting}
							>
								<AlertDialogTrigger asChild>
									<Button variant="outline" size="icon-sm">
										<Trash2 className="text-destructive size-4" />
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
		<div className="space-y-4">
			<LibraryStatStrip
				isLoading={isLoading && !summary}
				columns={5}
				stats={[
					{ label: t("statTitles"), value: summary?.titles ?? 0, icon: BookOpen },
					{
						label: t("statCopies"),
						value: summary?.totalCopies ?? 0,
						icon: BookCopy,
					},
					{
						label: t("statAvailable"),
						value: summary?.availableCopies ?? 0,
						tone: "good",
					},
					{ label: t("statIssued"), value: summary?.issuedCopies ?? 0 },
					{
						label: t("statLostDamaged"),
						value:
							Number(summary?.lostCopies || 0) + Number(summary?.damagedCopies || 0),
						tone:
							Number(summary?.lostCopies || 0) + Number(summary?.damagedCopies || 0) > 0
								? "warning"
								: "default",
					},
				]}
			/>

			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="p-0">
					{/* The desktop copy lives in the page header; this one only
					    renders below @3xl/page, where the header has no room. */}
					<CatalogFilterBar filter={filter} setFilter={setFilter}>
						<CatalogActions />
					</CatalogFilterBar>
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
						data={books || []}
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
