"use client";

import TeacherForm from "@/modules/staff/teachers/components/TeacherForm";
import TeacherList from "@/modules/staff/teachers/components/TeacherList";
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

export default function TeachersPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("Teachers");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_teachers"), href: PATHS.STAFF.TEACHERS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Teachers">
				<PermissionGuard
					permissions={[
						PERMISSIONS.STAFF.ALL,
						PERMISSIONS.STAFF.TEACHERS.ALL,
						PERMISSIONS.STAFF.TEACHERS.CREATE,
					]}
				>
					<Button onClick={() => setIsCreateOpen(true)}>
						<Plus className="size-4" />
						{t("addTeacher")}
					</Button>
				</PermissionGuard>
			</PageHeading>

			<div>
				<TeacherList />
			</div>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>{t("addTeacherTitle")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						<TeacherForm onSuccess={() => setIsCreateOpen(false)} />
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	);
}
