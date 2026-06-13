"use client";

import ApplicationList from "@/modules/admission/application-list/components/ApplicationList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function ApplicationListPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("AdmissionNew");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("admission"), href: PATHS.ADMISSION.ROOT },
			{ label: tNav("admission_list"), href: PATHS.ADMISSION.LIST.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Applications">
				<PermissionGuard
					permissions={[
						PERMISSIONS.ADMISSION.ALL,
						PERMISSIONS.ADMISSION.NEW.ALL,
						PERMISSIONS.ADMISSION.NEW.CREATE,
					]}
				>
					<Link href={PATHS.ADMISSION.NEW.ROOT} passHref>
						<Button>
							<IconPlus />
							<span>{t("title")}</span>
						</Button>
					</Link>
				</PermissionGuard>
			</PageHeading>

			<div className="grid grid-cols-1 items-start gap-8">
				<ApplicationList />
			</div>
		</div>
	);
}
