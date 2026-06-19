"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PermissionForm } from "./PermissionForm";

export function PermissionCreate() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("PermissionsPage");

	return (
		<>
			<PermissionGuard permissions={[PERMISSIONS.ROLES.MATRIX.CREATE]}>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="size-4" />
					{t("addPermission")}
				</Button>
			</PermissionGuard>

			<PermissionForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
		</>
	);
}
