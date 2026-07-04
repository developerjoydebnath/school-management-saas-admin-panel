"use client";

import InventoryFormPage from "@/modules/inventory/components/InventoryFormPage";
import { use } from "react";

export default function InventoryItemEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <InventoryFormPage moduleKey="items" id={id} />;
}
