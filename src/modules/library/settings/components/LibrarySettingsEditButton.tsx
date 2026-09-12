"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Guarded on `library.settings`, not on catalog edit: changing the fine rate or
 * the accession counter is a different kind of act from editing a book.
 */
export default function LibrarySettingsEditButton() {
	const t = useTranslations("LibrarySettings");

	return (
		<PermissionGuard
			permissions={[PERMISSIONS.LIBRARY.SETTINGS, PERMISSIONS.LIBRARY.ALL]}
		>
			<Button asChild>
				<Link href={PATHS.LIBRARY.SETTINGS.EDIT}>
					<Pencil className="size-4" />
					{t("editSettings")}
				</Link>
			</Button>
		</PermissionGuard>
	);
}
