"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { RoleForm } from "./RoleForm";

export function RoleCreate() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("RolesPage");

	return (
		<>
			<PermissionGuard permissions={[PERMISSIONS.ROLES.MANAGEMENT.CREATE]}>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="size-4" />
					{t("addRole")}
				</Button>
			</PermissionGuard>

			<RoleForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
		</>
	);
}
