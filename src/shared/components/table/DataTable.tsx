"use client";

import Image from "@/shared/components/custom/Image";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { IconAlertTriangle, IconSortAZ } from "@tabler/icons-react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Pagination } from "./Pagination";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData, TValue> {
		classNames?: {
			th?: string;
			td?: string;
		};
	}
}

type DataTableProps<T> = {
	data: T[];
	columns: ColumnDef<T>[];
	className?: string;
	classNames?: {
		tableContainer?: string;
		table?: string;
		th?: string;
		td?: string;
	};
	pagination?: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		onLimitChange?: (limit: number) => void;
	};
	isLoading?: boolean;
	error?: any;
};

export default function DataTable<T>({
	data,
	columns,
	pagination,
	className,
	classNames,
	isLoading,
	error,
}: DataTableProps<T>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!isLoading && (!data || !data.length)) {
		return (
			<div className="flex h-full w-full flex-col items-center">
				<Image
					src="/images/data-not-found.png"
					alt="Data not found"
					width={300}
					height={300}
				/>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full w-full flex-col items-center">
				<Alert variant="destructive" className="bg-danger-lighter border-0">
					<IconAlertTriangle className="size-4" />
					<AlertTitle>Error!</AlertTitle>
					<AlertDescription>
						{error ? error.message : "Something went wrong while fetching data."}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div>
			<div className={cn("overflow-x-auto", className)}>
				<div
					className={cn(
						"w-full overflow-hidden rounded-md border",
						classNames?.tableContainer
					)}
				>
					<Table className={cn("w-full table-auto", classNames?.table)}>
						<TableHeader className="bg-accent [&_th]:py-1.5 [&_th]:text-sm [&_th]:font-medium [&_tr]:border-b">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className={cn(
												"text-foreground h-8 p-0",
												classNames?.th,
												header.column.columnDef?.meta?.classNames?.th
											)}
										>
											<div
												onClick={header.column.getToggleSortingHandler()}
												className={cn(
													"flex w-full items-center px-2.5 py-2",
													header?.column.getCanSort()
														? "cursor-pointer"
														: "cursor-default"
												)}
											>
												<span className="flex-1">
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
												</span>

												<span
													className={
														"flex size-5 items-center justify-center"
													}
												>
													{header.column.getIsSorted() && (
														<IconSortAZ
															className="size-4"
															type={
																header.column.getIsSorted() as
																	| "asc"
																	| "desc"
															}
														/>
													)}
												</span>
											</div>
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>

						<TableBody className="[&_tr]:even:bg-gray-25 [&_tr]:hover:bg-gray-25 [&_tr]:border-b-border [&_tr]:border-b">
							{isLoading
								? Array.from({ length: 10 }).map((_, index) => (
										<TableRow key={`loadingRow-${index}`}>
											{columns.map((col) => (
												<TableCell
													key={col.id}
													className={cn(
														"text-foreground h-14 px-2.5 py-2 text-sm font-normal",
														classNames?.td
													)}
												>
													<Skeleton className="h-3.5 w-1/2" />
												</TableCell>
											))}
										</TableRow>
									))
								: table.getRowModel().rows.map((row) => (
										<TableRow key={row.id}>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													className={cn(
														"text-foreground h-14 px-2.5 py-2 text-sm font-normal",
														classNames?.td,
														cell.column.columnDef.meta?.classNames?.td
													)}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											))}
										</TableRow>
									))}
						</TableBody>
					</Table>
				</div>
			</div>

			{pagination && (
				<div className="pt-4">
					<Pagination {...pagination} />
				</div>
			)}
		</div>
	);
}
