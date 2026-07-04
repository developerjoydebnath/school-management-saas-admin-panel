"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { InventoryModuleKey, inventoryModules } from "../constants/inventory.constants";

type Props = {
	moduleKey: InventoryModuleKey;
};

export function InventoryCreateButton({ moduleKey }: Props) {
	const t = useTranslations("Inventory");
	const config = inventoryModules[moduleKey];
	if (!config.createPath) return null;

	return (
		<PermissionGuard permissions={config.permissions.create}>
			<Button asChild>
				<Link href={config.createPath}>
					<Plus className="size-4" />
					{t("addRecord")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
