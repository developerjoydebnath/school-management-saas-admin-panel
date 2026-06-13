"use client";

import ClassForm from "@/modules/academics/classes/components/ClassForm";
import ClassList from "@/modules/academics/classes/components/ClassList";
import PageHeading from "@/shared/components/custom/PageHeading";
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
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ClassesPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("Classes");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_classes"), href: PATHS.ACADEMICS.CLASSES.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Classes">
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger
						render={
							<Button title={t("addClassTitle")}>
								<Plus className="h-4 w-4" /> {t("addClass")}
							</Button>
						}
					></DialogTrigger>
					<DialogContent className="px-2">
						<DialogHeader className="px-4">
							<DialogTitle>{t("addClassTitle")}</DialogTitle>
						</DialogHeader>
						<ScrollArea className="max-h-[80vh] px-2">
							<ClassForm onSuccess={() => setIsCreateOpen(false)} />
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</PageHeading>

			<div className="w-full">
				<ClassList />
			</div>
		</div>
	);
}
