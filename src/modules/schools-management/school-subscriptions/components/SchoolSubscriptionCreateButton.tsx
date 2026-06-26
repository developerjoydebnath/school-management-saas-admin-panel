"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function SchoolSubscriptionCreateButton() {
	const t = useTranslations("SchoolsManagementSchoolSubscriptions");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.CREATE,
				PERMISSIONS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.ALL,
				PERMISSIONS.SCHOOLS_MANAGEMENT.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.CREATE}>
					<Plus className="size-4" />
					{t("addSubscription")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
