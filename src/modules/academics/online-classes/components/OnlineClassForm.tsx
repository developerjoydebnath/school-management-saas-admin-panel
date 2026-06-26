"use client";

import { OnlineClassFormValues, onlineClassSchema } from "@/modules/academics/online-classes/dto/online-class.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface OnlineClassFormProps {
	onSuccess?: () => void;
	initialData?: OnlineClassFormValues & { id?: string; subjectName?: string; className?: string; teacherName?: string };
}

export default function OnlineClassForm({ onSuccess, initialData }: OnlineClassFormProps) {
	const { mutate } = useSWRConfig();
	const t = useTranslations("OnlineClasses");
	const ft = useTranslations("Forms");

	const { data: subjectResponse } = useSWR("/subjects/active-list");
	const { data: classesData } = useSWR("/classes");
	const { data: teachersData } = useSWR("/teachers");
	const subjectsData = Array.isArray(subjectResponse?.data) ? subjectResponse.data : subjectResponse || [];

	const subjectOptions =
		(subjectsData as any[])?.map((s) => ({
			label: s.enName || s.name?.en || s.name,
			value: s.id,
		})) || [];

	const classOptions =
		(classesData as any[])?.map((c) => ({
			label: c.name?.en || c.name,
			value: c.id,
		})) || [];

	const teacherOptions =
		(teachersData as any[])?.map((t) => ({
			label: `${t.firstName} ${t.lastName}`,
			value: t.id,
		})) || [];

	const form = useForm<OnlineClassFormValues>({
		resolver: zodResolver(onlineClassSchema as any),
		defaultValues: {
			title: initialData?.title || "",
			classId: initialData?.classId || "",
			subjectId: initialData?.subjectId || "",
			teacherId: initialData?.teacherId || "",
			date: initialData?.date || new Date().toISOString().split("T")[0],
			startTime: initialData?.startTime || "",
			endTime: initialData?.endTime || "",
			platform: initialData?.platform || "Zoom",
			meetingLink: initialData?.meetingLink || "",
			status: initialData?.status || "Scheduled",
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				title: initialData.title,
				classId: initialData.classId,
				subjectId: initialData.subjectId,
				teacherId: initialData.teacherId,
				date: initialData.date,
				startTime: initialData.startTime,
				endTime: initialData.endTime,
				platform: initialData.platform,
				meetingLink: initialData.meetingLink,
				status: initialData.status,
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: OnlineClassFormValues) => {
		try {
			const subjectName = subjectOptions.find((s) => s.value === data.subjectId)?.label || "";
			const className = classOptions.find((c) => c.value === data.classId)?.label || "";
			const teacherName = teacherOptions.find((t) => t.value === data.teacherId)?.label || "";
			
			const payload = { ...data, subjectName, className, teacherName };

			if (initialData?.id) {
				await axios.put(`/onlineClasses/${initialData.id}`, payload);
				toast.success(t("updateSuccess"));
			} else {
				await axios.post("/onlineClasses", payload);
				toast.success(t("addSuccess"));
			}
			form.reset();
			mutate("/onlineClasses");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			toast.error(initialData?.id ? t("updateError") : t("addError"));
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<InputField
				control={form.control}
				name="title"
				label={t("classTitle")}
				placeholder="e.g. Physics Chapter 5 Live Session"
				type="text"
			/>
			
			<div className="grid grid-cols-2 gap-4">
				<InputField
					control={form.control}
					name="classId"
					label={t("class")}
					type="select"
					options={classOptions}
					placeholder="Select Class"
				/>
				<InputField
					control={form.control}
					name="subjectId"
					label={t("subject")}
					type="select"
					options={subjectOptions}
					placeholder="Select Subject"
				/>
			</div>

			<InputField
				control={form.control}
				name="teacherId"
				label={t("teacher")}
				type="select"
				options={teacherOptions}
				placeholder="Select Teacher"
			/>

			<div className="grid grid-cols-3 gap-4">
				<InputField
					control={form.control}
					name="date"
					label={t("date")}
					type="date"
				/>
				<InputField
					control={form.control}
					name="startTime"
					label={t("startTime")}
					type="time"
				/>
				<InputField
					control={form.control}
					name="endTime"
					label={t("endTime")}
					type="time"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<InputField
					control={form.control}
					name="platform"
					label={t("platform")}
					type="select"
					options={[
						{ label: "Zoom", value: "Zoom" },
						{ label: "Google Meet", value: "Google Meet" },
						{ label: "Teams", value: "Teams" },
					]}
				/>
				<InputField
					control={form.control}
					name="status"
					label={t("status")}
					type="select"
					options={[
						{ label: t("scheduled"), value: "Scheduled" },
						{ label: t("ongoing"), value: "Ongoing" },
						{ label: t("completed"), value: "Completed" },
						{ label: t("cancelled"), value: "Cancelled" },
					]}
				/>
			</div>

			<InputField
				control={form.control}
				name="meetingLink"
				label={t("meetingLink")}
				placeholder="https://..."
				type="text"
			/>

			<Button
				type="submit"
				className="mt-4 h-10 w-full"
				disabled={form.formState.isSubmitting}
			>
				{form.formState.isSubmitting
					? ft("saveLoading")
					: initialData?.id
						? t("update")
						: t("save")}
			</Button>
		</form>
	);
}
