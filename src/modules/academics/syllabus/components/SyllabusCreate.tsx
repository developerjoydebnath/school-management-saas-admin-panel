"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function SyllabusCreate() {
	const t = useTranslations("Syllabus");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.SYLLABUS.CREATE,
				PERMISSIONS.ACADEMICS.SYLLABUS.ALL,
				PERMISSIONS.ACADEMICS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.ACADEMICS.SYLLABUS.CREATE}>
					<Plus className="size-4" />
					{t("addSyllabus")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
