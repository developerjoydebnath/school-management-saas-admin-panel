"use client";

import ClassRoomForm from "@/modules/academics/class-rooms/components/ClassRoomForm";
import { ClassRoomFormValues } from "@/modules/academics/class-rooms/dto/class-room.dto";
import { useClassRoom } from "@/modules/academics/class-rooms/hooks/use-class-room";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { StatusEnum } from "@/shared/types/enums";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditClassRoomPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { data: room, isLoading } = useClassRoom(id);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_class_rooms"), href: PATHS.ACADEMICS.CLASS_ROOMS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="ClassRooms" />
				<Skeleton className="h-96 w-full rounded-md" />
			</div>
		);
	}

	const raw = room?.original || {};
	const defaultValues: ClassRoomFormValues = {
		name: raw.name || "",
		roomNo: raw.roomNo || "",
		capacity: raw.capacity || 30,
		roomLength:
			raw.roomLength === null || raw.roomLength === undefined
				? undefined
				: Number(raw.roomLength),
		roomWidth:
			raw.roomWidth === null || raw.roomWidth === undefined
				? undefined
				: Number(raw.roomWidth),
		dimensionUnit: raw.dimensionUnit || "feet",
		floor: raw.floor || "",
		building: raw.building || "",
		status: raw.status || StatusEnum.ACTIVE,
		description: raw.description || "",
		layoutConfig: raw.layoutConfig || undefined,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ClassRooms" />
			<ClassRoomForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
