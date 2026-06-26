"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function SchoolCreate() {
	const t = useTranslations("SchoolsManagement");
	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.SCHOOLS_MANAGEMENT.ALL,
				PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOLS.ALL,
				PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOLS.CREATE,
			]}
		>
			<Button asChild>
				<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.CREATE}>
					<Plus className="size-4" />
					{t("addSchool")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
