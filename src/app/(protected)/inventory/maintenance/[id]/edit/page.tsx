"use client";

import InventoryFormPage from "@/modules/inventory/components/InventoryFormPage";
import { use } from "react";

export default function InventoryMaintenanceEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <InventoryFormPage moduleKey="maintenance" id={id} />;
}
