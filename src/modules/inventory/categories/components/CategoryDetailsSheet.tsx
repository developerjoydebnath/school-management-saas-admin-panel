"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useCategory } from "../hooks/use-category";

type Props = {
	id: string;
	open: boolean;
};

function formatValue(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}

function Pair({ label, value }: { label: string; value: unknown }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<p className="mt-0.5 truncate text-sm leading-5">{formatValue(value)}</p>
		</div>
	);
}

function DetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 2 }).map((_, index) => (
				<section key={index} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

export function CategoryDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Inventory");
	const { data: response, isLoading } = useCategory(open ? id : null);
	const data = response?.data || response;

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				{isLoading || !data ? (
					<DetailsSkeleton />
				) : (
					<div className="space-y-4 p-4">
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("categoryInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Name" value={data.name} />
								<Pair label="Bangla Name" value={data.nameBn} />
								<Pair label="Slug" value={data.slug} />
								<Pair label="Icon" value={data.iconName} />
								<Pair label="Color" value={data.colorCode} />
								<Pair label="Status" value={data.isActive ? "Active" : "Inactive"} />
							</div>
						</section>
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("usageInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="System Category" value={data.isSystem} />
								<Pair label="Items" value={data._count?.items} />
								<Pair
									label="Created Date"
									value={
										data.createdAt
											? new Date(data.createdAt).toLocaleDateString()
											: null
									}
								/>
								<Pair
									label="Updated Date"
									value={
										data.updatedAt
											? new Date(data.updatedAt).toLocaleDateString()
											: null
									}
								/>
							</div>
						</section>
					</div>
				)}
			</ScrollArea>
		</SheetContent>
	);
}
