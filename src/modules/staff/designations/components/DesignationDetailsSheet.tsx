"use client";

import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useDesignation } from "../hooks/use-designation";

type Props = {
	id: string;
	open: boolean;
};

const formatValue = (value?: string | number | null) => {
	if (value === null || value === undefined || value === "") return "N/A";
	return String(value);
};

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function DesignationDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 1 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 6 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function DesignationDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Designations");
	const { designation, isLoading } = useDesignation(open ? id : undefined);

	const content = (() => {
		if (isLoading || !designation) {
			return <DesignationDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionBasicTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Name" value={formatValue(designation.name)} />
						<CompactPair label="Name (Bengali)" value={formatValue(designation.nameBn)} />
						<CompactPair label="Category" value={formatValue(designation.category)} />
						<CompactPair label="Level" value={formatValue(designation.level)} />
						<CompactPair 
							label="Is Head Role" 
							value={designation.isHeadRole ? "Yes" : "No"} 
						/>
						<CompactPair 
							label="Is System" 
							value={designation.isSystem ? "Yes" : "No"} 
						/>
						<CompactPair
							label="Status"
							value={
								<Badge
									variant={designation.isActive ? "default" : "secondary"}
									className="capitalize"
								>
									{designation.isActive ? "Active" : "Inactive"}
								</Badge>
							}
						/>
						<CompactPair 
							label="Applicable To" 
							value={designation.applicableTo?.length ? designation.applicableTo.join(", ") : "N/A"} 
						/>
					</div>
				</div>
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsSheetTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsSheetDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
