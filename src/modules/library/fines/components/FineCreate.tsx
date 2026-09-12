"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Rendered in the page header on desktop and in the filter bar's mobile
 * wrapper below `@3xl/page` — the ClassCreate split.
 */
export default function FineCreate() {
	const t = useTranslations("LibraryFines");

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.LIBRARY.FINES.CREATE,
				PERMISSIONS.LIBRARY.FINES.ALL,
				PERMISSIONS.LIBRARY.ALL,
			]}
		>
			<Button asChild>
				<Link href={PATHS.LIBRARY.FINES.CREATE}>
					<Plus className="size-4" />
					{t("addFine")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
