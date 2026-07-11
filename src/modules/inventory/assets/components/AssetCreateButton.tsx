"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function AssetCreateButton() {
	const t = useTranslations("Inventory");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.INVENTORY.ASSETS.CREATE,
				PERMISSIONS.INVENTORY.ASSETS.ALL,
				PERMISSIONS.INVENTORY.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.INVENTORY.ASSETS.CREATE}>
					<Plus className="size-4" />
					{t("addAsset")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
