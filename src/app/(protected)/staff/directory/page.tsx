"use client";

import StaffList from "@/modules/staff/directory/components/StaffList";
import StaffSummary from "@/modules/staff/directory/components/StaffSummary";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function StaffDirectoryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StaffDirectory");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_directory"), href: PATHS.STAFF.DIRECTORY.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffDirectory">
				<div className="hidden @3xl/page:flex">
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.DIRECTORY.CREATE,
							PERMISSIONS.STAFF.DIRECTORY.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<Button asChild>
							<Link href={PATHS.STAFF.DIRECTORY.CREATE}>
								<Plus className="h-4 w-4" />
								{t("addStaff")}
							</Link>
						</Button>
					</PermissionGuard>
				</div>
			</PageHeading>
			<StaffSummary />
			<StaffList />
		</div>
	);
}
