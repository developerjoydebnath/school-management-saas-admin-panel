"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ShiftForm from "./ShiftForm";

export function ShiftCreate() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("Shifts");

	return (
		<>
			<PermissionGuard
				permissions={[
					PERMISSIONS.ACADEMICS.SHIFTS.CREATE,
					PERMISSIONS.ACADEMICS.SHIFTS.ALL,
					PERMISSIONS.ACADEMICS.ALL,
				]}
			>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="size-4" />
					{t("addShift")}
				</Button>
			</PermissionGuard>

			<ShiftForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
		</>
	);
}
