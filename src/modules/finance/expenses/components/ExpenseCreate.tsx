"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function ExpenseCreate() {
	const t = useTranslations("Expenses");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.FINANCE.EXPENSES.CREATE,
				PERMISSIONS.FINANCE.EXPENSES.ALL,
				PERMISSIONS.FINANCE.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.FINANCE.EXPENSES.CREATE}>
					<Plus className="size-4" />
					{t("addExpense")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
