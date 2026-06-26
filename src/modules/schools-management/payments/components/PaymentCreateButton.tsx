"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function PaymentCreateButton() {
	const t = useTranslations("SchoolsManagementPayments");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.SCHOOLS_MANAGEMENT.PAYMENTS.CREATE,
				PERMISSIONS.SCHOOLS_MANAGEMENT.PAYMENTS.ALL,
				PERMISSIONS.SCHOOLS_MANAGEMENT.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.SCHOOLS_MANAGEMENT.PAYMENTS.CREATE}>
					<Plus className="size-4" />
					{t("addPayment")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
