"use client";

import { cn } from "@/shared/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import RCPagination, { type PaginationProps } from "rc-pagination";
import { Button } from "../ui/button";
import { DebouncedInput } from "../ui/debounced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type TPaginationProps = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onLimitChange?: (limit: number) => void;
	className?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Pagination({
	total,
	page,
	limit,
	totalPages,
	onPageChange,
	onLimitChange,
	className,
}: TPaginationProps) {
	const t = useTranslations("TableFooters");
	const currentPage = page ?? 1;
	const safeTotalPages = totalPages ?? Math.ceil(total / limit) ?? 1;

	const itemRender: PaginationProps["itemRender"] = (pageNum, type) => {
		if (type === "prev") {
			return (
				<Button disabled={currentPage <= 1} variant={"outline"} className="shadow-none">
					<IconChevronLeft className="size-3.5" />
					<span>{t("prev")}</span>
				</Button>
			);
		}

		if (type === "next") {
			return (
				<Button
					disabled={currentPage >= safeTotalPages}
					variant={"outline"}
					className="shadow-none"
				>
					<span>{t("next")}</span>
					<IconChevronRight className="size-3.5" />
				</Button>
			);
		}

		if (type === "jump-prev" || type === "jump-next") {
			return (
				<span className="flex h-7 w-7 items-center justify-center text-sm text-gray-500 select-none">
					...
				</span>
			);
		}

		// type === "page"
		const isActive = pageNum === currentPage;
		return (
			<Button
				variant={isActive ? "default" : "outline"}
				className={cn("shadow-none", pageNum < 100 ? "min-w-9" : "")}
			>
				{pageNum}
			</Button>
		);
	};

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{/* Top row */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				{/* Left: Result per page + Go to page */}
				<div className="flex flex-wrap items-center gap-4">
					{/* Result per page */}
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm whitespace-nowrap">
							{t("resultPerPage")}
						</span>
						<Select
							value={limit.toString()}
							onValueChange={(v) => onLimitChange?.(Number(v))}
						>
							<SelectTrigger className="h-9! w-[70px]! shadow-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="min-w-0! p-1" align="center">
								{PAGE_SIZE_OPTIONS.map((size) => (
									<SelectItem key={size} value={size.toString()}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Go to page */}
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm whitespace-nowrap">
							{t("goToPage")}
						</span>
						<DebouncedInput
							type="number"
							min={1}
							max={safeTotalPages}
							value={page}
							onChange={(value) => onPageChange(Number(value))}
							className="w-14 [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
					</div>
				</div>

				{/* Right: rc-pagination for Prev / numbers / Next */}
				<RCPagination
					current={currentPage}
					total={total}
					pageSize={limit}
					onChange={onPageChange}
					showLessItems
					hideOnSinglePage
					itemRender={itemRender}
					className="m-0 flex list-none items-center gap-1 p-0 [&>li]:m-0 [&>li]:min-w-0 [&>li]:border-0 [&>li]:bg-transparent [&>li]:p-0 [&>li]:leading-none"
				/>
			</div>

			{/* Bottom row: Page info + Total */}
			<div className="text-muted-foreground flex items-center gap-6 text-sm">
				<span>
					{t("page")}{" "}
					<span className="text-muted-foreground font-medium">{currentPage}</span> /{" "}
					<span className="text-muted-foreground font-medium">{safeTotalPages}</span>
				</span>
				<span>
					{t("totalData")}{" "}
					<span className="text-muted-foreground font-medium">{total}</span>
				</span>
			</div>
		</div>
	);
}
