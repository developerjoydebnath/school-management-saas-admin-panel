"use client";

import { ClassRoomDetails } from "@/modules/academics/class-rooms/components/ClassRoomDetails";
import { useClassRoom } from "@/modules/academics/class-rooms/hooks/use-class-room";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ClassRoomDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: room, isLoading } = useClassRoom(id);

	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const tClassRooms = useTranslations("ClassRooms");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_class_rooms"), href: PATHS.ACADEMICS.CLASS_ROOMS.ROOT },
			{ label: tClassRooms("detailsTitle") },
		]);
	}, [setBreadcrumbs, tNav, tClassRooms]);

	if (isLoading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!room) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<p className="text-muted-foreground">Class room not found.</p>
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading
				routeName="ClassRooms"
				title={tClassRooms("detailsTitle")}
				description={tClassRooms("detailsDescription")}
			/>
			<ClassRoomDetails room={room} />
		</div>
	);
}
