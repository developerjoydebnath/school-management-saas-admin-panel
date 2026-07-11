"use client";

import { AssetFormPage } from "@/modules/inventory/assets/components/AssetFormPage";
import { use } from "react";

export default function InventoryAssetEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <AssetFormPage id={id} />;
}
