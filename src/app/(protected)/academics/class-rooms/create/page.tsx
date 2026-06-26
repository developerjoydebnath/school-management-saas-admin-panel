"use client";

import ClassRoomForm from "@/modules/academics/class-rooms/components/ClassRoomForm";
import { ClassRoomFormValues } from "@/modules/academics/class-rooms/dto/class-room.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues: ClassRoomFormValues = {
	name: "",
	roomNo: "",
	capacity: 30,
	floor: "",
	building: "",
	highBench: 0,
	lowBench: 0,
	chair: 0,
	table: 0,
	board: 1,
	projector: 0,
	fan: 0,
	light: 0,
	hasAc: false,
	hasCctv: false,
	status: StatusEnum.ACTIVE,
	description: "",
};

export default function CreateClassRoomPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_class_rooms"), href: PATHS.ACADEMICS.CLASS_ROOMS.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ClassRooms" />
			<ClassRoomForm defaultValues={defaultValues} />
		</div>
	);
}
