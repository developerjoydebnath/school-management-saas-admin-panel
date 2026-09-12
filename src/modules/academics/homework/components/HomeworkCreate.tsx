"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function HomeworkCreate() {
	const t = useTranslations("Homework");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.HOMEWORK.CREATE,
				PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
				PERMISSIONS.ACADEMICS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.ACADEMICS.HOMEWORK.CREATE}>
					<Plus className="size-4" />
					{t("addHomework")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
