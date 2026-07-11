"use client";

import { StockFormPage } from "@/modules/inventory/stock/components/StockFormPage";
import { use } from "react";

export default function InventoryStockEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <StockFormPage id={id} />;
}
