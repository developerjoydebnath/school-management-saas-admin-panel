"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ClassRoomCreate() {
	const t = useTranslations("ClassRooms");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.CLASS_ROOMS.CREATE,
				PERMISSIONS.ACADEMICS.CLASS_ROOMS.ALL,
				PERMISSIONS.ACADEMICS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.ACADEMICS.CLASS_ROOMS.CREATE}>
					<Plus className="size-4" />
					{t("addClassRoom")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
