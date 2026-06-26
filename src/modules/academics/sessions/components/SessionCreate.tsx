"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SessionForm from "./SessionForm";

export function SessionCreate() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("Sessions");

	return (
		<>
			<PermissionGuard
				permissions={[
					PERMISSIONS.ACADEMICS.SESSIONS.CREATE,
					PERMISSIONS.ACADEMICS.SESSIONS.ALL,
					PERMISSIONS.ACADEMICS.ALL,
				]}
			>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="size-4" />
					{t("addSession")}
				</Button>
			</PermissionGuard>

			<SessionForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
		</>
	);
}
