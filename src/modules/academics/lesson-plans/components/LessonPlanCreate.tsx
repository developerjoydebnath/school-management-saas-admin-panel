"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function LessonPlanCreate() {
	const t = useTranslations("LessonPlans");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.ACADEMICS.LESSON_PLANS.CREATE,
				PERMISSIONS.ACADEMICS.LESSON_PLANS.ALL,
				PERMISSIONS.ACADEMICS.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.ACADEMICS.LESSON_PLANS.CREATE}>
					<Plus className="size-4" />
					{t("addLessonPlan")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
