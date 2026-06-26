"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function SubscriptionPlanCreate() {
	const t = useTranslations("SubscriptionPlansPage");
	return (
		<PermissionGuard permissions={[PERMISSIONS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.CREATE]}>
			<Button asChild>
				<Link href={PATHS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.CREATE}>
					<Plus className="size-4" />
					{t("addPlan")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
