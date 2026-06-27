"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function DesignationCreate() {
	const t = useTranslations("Designations");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.STAFF.DESIGNATIONS.CREATE,
				PERMISSIONS.STAFF.DESIGNATIONS.ALL,
				PERMISSIONS.STAFF.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.STAFF.DESIGNATIONS.CREATE}>
					<Plus className="size-4" />
					{t("addDesignation")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
