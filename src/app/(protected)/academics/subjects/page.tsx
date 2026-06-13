"use client";

import SubjectForm from "@/modules/academics/subjects/components/SubjectForm";
import SubjectList from "@/modules/academics/subjects/components/SubjectList";
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

export default function SubjectsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("Subjects");
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_subjects"), href: PATHS.ACADEMICS.SUBJECTS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Subjects">
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger
						render={
							<Button>
								<Plus className="h-4 w-4" /> {t("addSubject")}
							</Button>
						}
					></DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("addSubjectTitle")}</DialogTitle>
						</DialogHeader>
						<ScrollArea className="max-h-[80vh]">
							<SubjectForm onSuccess={() => setIsCreateOpen(false)} />
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</PageHeading>

			<div className="w-full">
				<SubjectList />
			</div>
		</div>
	);
}
