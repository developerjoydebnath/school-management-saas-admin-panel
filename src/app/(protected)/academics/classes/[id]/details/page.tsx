"use client";

import { ClassDetails } from "@/modules/academics/classes/components/ClassDetails";
import { useClass } from "@/modules/academics/classes/hooks/use-class";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ClassDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: cls, isLoading } = useClass(id);

	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const tClasses = useTranslations("Classes");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_classes"), href: PATHS.ACADEMICS.CLASSES.ROOT },
			{ label: tClasses("detailsTitle") },
		]);
	}, [setBreadcrumbs, tNav, tClasses]);

	if (isLoading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!cls) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<p className="text-muted-foreground">Class not found.</p>
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="Classes"
				title={tClasses("detailsTitle")}
				description={tClasses("detailsDescription")}
			/>
			<ClassDetails cls={cls} />
		</div>
	);
}
