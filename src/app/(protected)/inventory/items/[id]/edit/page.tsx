"use client";

import { ItemFormPage } from "@/modules/inventory/items/components/ItemFormPage";
import { use } from "react";

export default function InventoryItemEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <ItemFormPage id={id} />;
}
