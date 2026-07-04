"use client";

import InventoryFormPage from "@/modules/inventory/components/InventoryFormPage";
import { use } from "react";

export default function InventoryAssetEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <InventoryFormPage moduleKey="assets" id={id} />;
}
