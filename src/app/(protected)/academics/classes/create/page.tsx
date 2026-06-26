"use client";

import ClassForm from "@/modules/academics/classes/components/ClassForm";
import { ClassFormValues } from "@/modules/academics/classes/dto/class.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues: ClassFormValues = {
	enName: "",
	bnName: "",
	sections: [],
	classRoomId: "",
	shiftId: "",
	status: StatusEnum.ACTIVE,
};

export default function CreateClassPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_classes"), href: PATHS.ACADEMICS.CLASSES.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Classes" />
			<ClassForm defaultValues={defaultValues} />
		</div>
	);
}
