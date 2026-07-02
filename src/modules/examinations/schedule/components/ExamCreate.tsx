"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ExamCreate() {
	const t = useTranslations("Exams");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.EXAMINATIONS.SCHEDULE.CREATE,
				PERMISSIONS.EXAMINATIONS.SCHEDULE.ALL,
				PERMISSIONS.EXAMINATIONS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.EXAMINATIONS.SCHEDULE.CREATE}>
					<Plus className="size-4" />
					{t("addExam")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
