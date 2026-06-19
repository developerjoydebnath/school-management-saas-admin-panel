"use client";

import SessionForm from "@/modules/academics/sessions/components/SessionForm";
import SessionList from "@/modules/academics/sessions/components/SessionList";
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

export default function SessionsPage() {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const t = useTranslations("Sessions");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_sessions"), href: PATHS.ACADEMICS.SESSIONS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Sessions">
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<PermissionGuard
						permissions={[
							PERMISSIONS.ACADEMICS.SESSIONS.CREATE,
							PERMISSIONS.ACADEMICS.SESSIONS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						]}
					>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								{t("addSession")}
							</Button>
						</DialogTrigger>
					</PermissionGuard>
					<DialogContent className="px-0">
						<DialogHeader className="px-6">
							<DialogTitle>{t("addSession")}</DialogTitle>
						</DialogHeader>
						<div className="px-4">
							<SessionForm onSuccess={() => setIsAddDialogOpen(false)} />
						</div>
					</DialogContent>
				</Dialog>
			</PageHeading>

			<SessionList />
		</div>
	);
}
