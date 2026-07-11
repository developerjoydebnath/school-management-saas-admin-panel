"use client";

import { CategoryFormPage } from "@/modules/inventory/categories/components/CategoryFormPage";
import { use } from "react";

export default function InventoryCategoryEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return <CategoryFormPage id={id} />;
}
