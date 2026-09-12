"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { FileDown, Plus, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import ImportRegisterDialog from "./ImportRegisterDialog";

/**
 * The catalog's toolbar, rendered TWICE by design.
 *
 * `PageHeading` shows it above `@3xl/page`; the filter bar shows it inside
 * `FilterMobileWrapper` below that breakpoint, where the header has no room.
 * Keeping it in one component is what stops the two copies drifting — the same
 * split every list in this app uses (see ClassCreate).
 */
export default function CatalogActions() {
	const t = useTranslations("LibraryCatalog");
	const tc = useTranslations("Common");
	const [isImportOpen, setIsImportOpen] = useState(false);

	const printRegister = async () => {
		try {
			await downloadPdf("/library/copies/print", "accession-register.pdf");
		} catch {
			toast.error(tc("somethingWentWrong"));
		}
	};

	return (
		<>
			<div className="flex flex-wrap items-center gap-2">
				<PermissionGuard
					permissions={[
						PERMISSIONS.LIBRARY.CATALOG.VIEW,
						PERMISSIONS.LIBRARY.CATALOG.ALL,
						PERMISSIONS.LIBRARY.ALL,
					]}
				>
					<Button variant="outline" onClick={printRegister}>
						<FileDown className="size-4" />
						{t("printRegister")}
					</Button>
				</PermissionGuard>

				<PermissionGuard
					permissions={[
						PERMISSIONS.LIBRARY.CATALOG.CREATE,
						PERMISSIONS.LIBRARY.CATALOG.ALL,
						PERMISSIONS.LIBRARY.ALL,
					]}
				>
					<Button variant="outline" onClick={() => setIsImportOpen(true)}>
						<Upload className="size-4" />
						{t("importRegister")}
					</Button>
					<Button asChild>
						<Link href={PATHS.LIBRARY.CATALOG.CREATE}>
							<Plus className="size-4" />
							{t("addBook")}
						</Link>
					</Button>
				</PermissionGuard>
			</div>

			<ImportRegisterDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
		</>
	);
}
