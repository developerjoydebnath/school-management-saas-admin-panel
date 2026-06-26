"use client";

import { ClassRoomFormValues, classRoomSchema } from "@/modules/academics/class-rooms/dto/class-room.dto";
import { createClassRoom, updateClassRoom } from "@/modules/academics/class-rooms/hooks/use-class-room-mutations";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	id?: string;
	defaultValues: ClassRoomFormValues;
	isEdit?: boolean;
};

const statusOptions = [
	{ label: "Active", value: StatusEnum.ACTIVE },
	{ label: "Inactive", value: StatusEnum.INACTIVE },
];

export default function ClassRoomForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("ClassRooms");
	const ft = useTranslations("Forms");

	const form = useForm<ClassRoomFormValues>({
		resolver: zodResolver(classRoomSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: ClassRoomFormValues) => {
		try {
			if (isEdit && id) {
				await updateClassRoom(id, data);
				toast.success("Class room updated successfully");
			} else {
				await createClassRoom(data);
				toast.success("Class room created successfully");
			}
			router.push(PATHS.ACADEMICS.CLASS_ROOMS.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>{isEdit ? t("editDescription") : t("createDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="name"
						label="Room Name"
						type="text"
						placeholder="e.g. Science Lab"
						required
					/>
					<InputField
						control={form.control}
						name="roomNo"
						label="Room No"
						type="text"
						placeholder="e.g. 301"
						required
					/>
					<InputField
						control={form.control}
						name="capacity"
						label="Capacity"
						type="number"
						placeholder="e.g. 40"
						required
					/>
					<InputField
						control={form.control}
						name="building"
						label="Building"
						type="text"
						placeholder="e.g. Academic Building"
					/>
					<InputField
						control={form.control}
						name="floor"
						label="Floor"
						type="text"
						placeholder="e.g. 3rd Floor"
					/>
					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						placeholder="Select status"
						options={statusOptions}
						required
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("furniture")}</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-4">
					<InputField
						control={form.control}
						name="highBench"
						label="High Bench"
						type="number"
						placeholder="e.g. 20"
					/>
					<InputField
						control={form.control}
						name="lowBench"
						label="Low Bench"
						type="number"
						placeholder="e.g. 20"
					/>
					<InputField
						control={form.control}
						name="chair"
						label="Chair"
						type="number"
						placeholder="e.g. 40"
					/>
					<InputField
						control={form.control}
						name="table"
						label="Table"
						type="number"
						placeholder="e.g. 2"
					/>
					<InputField
						control={form.control}
						name="board"
						label="Board"
						type="number"
						placeholder="e.g. 1"
					/>
					<InputField
						control={form.control}
						name="projector"
						label="Projector"
						type="number"
						placeholder="e.g. 1"
					/>
					<InputField
						control={form.control}
						name="fan"
						label="Fan"
						type="number"
						placeholder="e.g. 4"
					/>
					<InputField
						control={form.control}
						name="light"
						label="Light"
						type="number"
						placeholder="e.g. 6"
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("facilities")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="hasAc"
							label="Has AC"
							type="switch"
							placeholder="Toggle AC availability"
						/>
						<InputField
							control={form.control}
							name="hasCctv"
							label="Has CCTV"
							type="switch"
							placeholder="Toggle CCTV availability"
						/>
					</div>
					<InputField
						control={form.control}
						name="description"
						label="Description"
						type="textarea"
						placeholder="Add room notes, equipment condition, or usage details"
					/>
				</CardContent>
			</Card>

			<div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-md bg-background/95 p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.ACADEMICS.CLASS_ROOMS.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting
						? isEdit
							? ft("updateLoading")
							: ft("saveLoading")
						: isEdit
							? ft("update")
							: ft("save")}
				</Button>
			</div>
		</form>
	);
}
