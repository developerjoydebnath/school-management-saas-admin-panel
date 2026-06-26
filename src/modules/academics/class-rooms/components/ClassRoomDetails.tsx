"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useTranslations } from "next-intl";
import { ClassRoomModel } from "../models/class-room.model";
import { StatusEnum } from "@/shared/types/enums";

type Props = {
	room: ClassRoomModel;
};

const formatValue = (value?: string | number | null) => value || "N/A";

export function ClassRoomDetails({ room }: Props) {
	const t = useTranslations("ClassRooms");

	return (
		<div className="grid gap-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionBasicTitle")}</CardTitle>
					<CardDescription>{t("sectionBasicDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">Room Name</div>
						<div className="font-medium">{formatValue(room.name)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Room No</div>
						<div className="font-medium">{formatValue(room.roomNo)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Capacity</div>
						<div className="font-medium">{formatValue(room.capacity)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Building</div>
						<div className="font-medium">{formatValue(room.building)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Floor</div>
						<div className="font-medium">{formatValue(room.floor)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Status</div>
						<div className="flex items-center gap-2">
							<Badge variant={room.status === StatusEnum.ACTIVE ? "default" : "secondary"}>
								{room.status === StatusEnum.ACTIVE ? "Active" : "Inactive"}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionFurnitureTitle")}</CardTitle>
					<CardDescription>{t("sectionFurnitureDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">High Bench</div>
						<div className="font-medium">{formatValue(room.highBench)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Low Bench</div>
						<div className="font-medium">{formatValue(room.lowBench)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Chair</div>
						<div className="font-medium">{formatValue(room.chair)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Table</div>
						<div className="font-medium">{formatValue(room.table)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Board</div>
						<div className="font-medium">{formatValue(room.board)}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
