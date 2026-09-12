"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function OnlineClassCreate() {
	const t = useTranslations("OnlineClasses");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.ONLINE_CLASSES.CREATE,
				PERMISSIONS.ACADEMICS.ONLINE_CLASSES.ALL,
				PERMISSIONS.ACADEMICS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.ACADEMICS.ONLINE_CLASSES.CREATE}>
					<Plus className="size-4" />
					{t("addOnlineClass")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
