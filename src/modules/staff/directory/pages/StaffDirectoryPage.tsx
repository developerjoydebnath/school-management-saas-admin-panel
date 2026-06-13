"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AddStaffModal from "../components/AddStaffModal";
import StaffDirectoryTable from "../components/StaffDirectoryTable";

export default function StaffDirectoryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("StaffDirectory");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS?.DASHBOARD },
			{ label: tNav("staff"), href: PATHS?.STAFF?.ROOT },
			{ label: tNav("staff_directory") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="StaffDirectory">
				<PermissionGuard
					permissions={[
						PERMISSIONS.STAFF?.ALL || "staff.all",
						PERMISSIONS.STAFF?.DIRECTORY?.CREATE || "staff.create",
					]}
				>
					<Button onClick={() => setIsCreateOpen(true)}>
						<Plus className="size-4" />
						{t("addStaff")}
					</Button>
				</PermissionGuard>
			</PageHeading>

			<div>
				<StaffDirectoryTable />
			</div>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>{t("addStaffTitle")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						<AddStaffModal onSuccess={() => setIsCreateOpen(false)} />
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	);
}
