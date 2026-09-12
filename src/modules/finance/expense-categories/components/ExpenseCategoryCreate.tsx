"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ExpenseCategoryCreate() {
	const t = useTranslations("ExpenseCategories");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.CREATE,
				PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.ALL,
				PERMISSIONS.FINANCE.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.FINANCE.EXPENSE_CATEGORIES.CREATE}>
					<Plus className="size-4" />
					{t("addCategory")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
