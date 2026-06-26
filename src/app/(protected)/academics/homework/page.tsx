"use client";

import HomeworkForm from "@/modules/academics/homework/components/HomeworkForm";
import HomeworkList from "@/modules/academics/homework/components/HomeworkList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function HomeworkPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Homework");
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_homework"), href: PATHS.ACADEMICS.HOMEWORK.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Homework">
				<PermissionGuard
					permissions={[
						PERMISSIONS.ACADEMICS.ALL,
						PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
						PERMISSIONS.ACADEMICS.HOMEWORK.CREATE,
					]}
				>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild><Button />
							<Plus className="h-4 w-4" />
							{t("addHomework")}
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{t("addHomeworkTitle")}</DialogTitle>
							</DialogHeader>
							<HomeworkForm onSuccess={() => setIsCreateOpen(false)} />
						</DialogContent>
					</Dialog>
				</PermissionGuard>
			</PageHeading>
			<HomeworkList />
		</div>
	);
}
