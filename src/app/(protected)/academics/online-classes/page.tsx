"use client";

import OnlineClassForm from "@/modules/academics/online-classes/components/OnlineClassForm";
import OnlineClassList from "@/modules/academics/online-classes/components/OnlineClassList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function OnlineClassesPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("OnlineClasses");
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_online_classes"), href: PATHS.ACADEMICS.ONLINE_CLASSES.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="OnlineClasses">
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger render={<Button />}>
						<Plus className="mr-2 h-4 w-4" />
						{t("addOnlineClass")}
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("addOnlineClassTitle")}</DialogTitle>
						</DialogHeader>
						<OnlineClassForm onSuccess={() => setIsCreateOpen(false)} />
					</DialogContent>
				</Dialog>
			</PageHeading>
			<OnlineClassList />
		</div>
	);
}
