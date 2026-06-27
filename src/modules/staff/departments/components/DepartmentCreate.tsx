"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function DepartmentCreate() {
	const t = useTranslations("Departments");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.STAFF.DEPARTMENTS.CREATE,
				PERMISSIONS.STAFF.DEPARTMENTS.ALL,
				PERMISSIONS.STAFF.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.STAFF.DEPARTMENTS.CREATE}>
					<Plus className="size-4" />
					{t("addDepartment")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
