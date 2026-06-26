"use client";

import ClassForm from "@/modules/academics/classes/components/ClassForm";
import { ClassFormValues } from "@/modules/academics/classes/dto/class.dto";
import { useClass } from "@/modules/academics/classes/hooks/use-class";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { data: cls, isLoading } = useClass(id);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_classes"), href: PATHS.ACADEMICS.CLASSES.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) return null;

	const raw = cls?.original || {};
	const defaultValues: ClassFormValues = {
		enName: raw.enName || "",
		bnName: raw.bnName || "",
		sections:
			raw.sections?.map((section: any) => ({
				name: section.name || "",
				classRoomId: section.classRoomId || section.classRoom?.id || "",
				shiftId: section.shiftId || section.shift?.id || "",
			})) || [],
		classRoomId: raw.classRoomId || raw.classRoom?.id || "",
		shiftId: raw.shiftId || raw.shift?.id || "",
		status: raw.status || StatusEnum.ACTIVE,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Classes" />
			<ClassForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
