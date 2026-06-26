"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ClassCreate() {
	const t = useTranslations("Classes");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.CLASSES.CREATE,
				PERMISSIONS.ACADEMICS.CLASSES.ALL,
				PERMISSIONS.ACADEMICS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.ACADEMICS.CLASSES.CREATE}>
					<Plus className="size-4" />
					{t("addClass")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
