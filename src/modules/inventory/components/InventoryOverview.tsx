"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useInventoryOverview } from "../hooks/use-inventory";

const cards = [
	["categoryCount", "Categories"],
	["itemCount", "Items"],
	["assetCount", "Assets"],
	["damagedBatchCount", "Damaged Batches"],
	["maintenanceCount", "Open Maintenance"],
];

export default function InventoryOverview() {
	const { data: response, isLoading } = useInventoryOverview();
	const data = response?.data || response || {};
	const t = useTranslations("Inventory");

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<CardTitle className="text-base font-normal">{t("overviewTitle")}</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-4 p-0 @xl/page:grid-cols-2 @4xl/page:grid-cols-5">
				{cards.map(([key, label]) => (
					<div key={key} className="rounded-md border bg-muted/20 p-4">
						<p className="text-muted-foreground text-xs">{label}</p>
						{isLoading ? (
							<Skeleton className="mt-3 h-6 w-16" />
						) : (
							<p className="mt-2 text-xl font-normal">{data[key] || 0}</p>
						)}
					</div>
				))}
			</CardContent>
		</Card>
	);
}
