"use client";

import ShiftForm from "@/modules/academics/shifts/components/ShiftForm";
import ShiftList from "@/modules/academics/shifts/components/ShiftList";
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
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ShiftsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("Shifts");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_shifts"), href: PATHS.ACADEMICS.SHIFTS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Shifts">
				<PermissionGuard
					permissions={
						[
							PERMISSIONS.ACADEMICS.ALL,
							PERMISSIONS.ACADEMICS.SHIFTS?.ALL,
							PERMISSIONS.ACADEMICS.SHIFTS?.CREATE,
						].filter(Boolean) as string[]
					}
				>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger
							render={
								<Button>
									<Plus className="h-4 w-4" /> {t("addShift")}
								</Button>
							}
						></DialogTrigger>
						<DialogContent className="px-0">
							<DialogHeader className="px-6">
								<DialogTitle>{t("addShiftTitle")}</DialogTitle>
							</DialogHeader>
							<ScrollArea className="max-h-[80vh] px-4">
								<ShiftForm onSuccess={() => setIsCreateOpen(false)} />
							</ScrollArea>
						</DialogContent>
					</Dialog>
				</PermissionGuard>
			</PageHeading>

			<div className="w-full">
				<ShiftList />
			</div>
		</div>
	);
}
