"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	ONLINE_CLASS_STATUS_TRANSITIONS,
	OnlineClass,
	OnlineClassFormValues,
	OnlineClassStatusEnum,
	onlineClassPlatformOptions,
	onlineClassSchema,
	onlineClassStatusOptions,
} from "../dto/online-class.dto";
import { createOnlineClass, updateOnlineClass } from "../hooks/use-online-class-mutations";

const today = () => new Date().toISOString().slice(0, 10);

export default function OnlineClassForm({
	initialData,
	isEdit = false,
}: {
	initialData?: OnlineClass | null;
	isEdit?: boolean;
}) {
	const t = useTranslations("OnlineClasses");
	const ft = useTranslations("Forms");
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();

	const form = useForm<OnlineClassFormValues>({
		resolver: zodResolver(onlineClassSchema as any),
		shouldFocusError: false,
		defaultValues: {
			sessionId: initialData?.sessionId || selectedSessionId || "",
			classId: initialData?.classId || "",
			sectionId: initialData?.sectionId || "",
			subjectId: initialData?.subjectId || "",
			teacherId: initialData?.teacherId || "",
			title: initialData?.title || "",
			titleBn: initialData?.titleBn || "",
			description: initialData?.description || "",
			platform: initialData?.platform || onlineClassPlatformOptions[0].value,
			meetingLink: initialData?.meetingLink || "",
			meetingId: initialData?.meetingId || "",
			passcode: initialData?.passcode || "",
			classDate: initialData?.classDate?.slice(0, 10) || today(),
			startTime: initialData?.startTime || "",
			endTime: initialData?.endTime || "",
			status: initialData?.status || OnlineClassStatusEnum.DRAFT,
			reminderMinutesBefore: initialData?.reminderMinutesBefore ?? undefined,
		},
	});

	const sessionId = form.watch("sessionId");
	const classId = form.watch("classId");
	const startTime = form.watch("startTime");
	const status = form.watch("status");
	const previousStatus = initialData?.status ?? OnlineClassStatusEnum.DRAFT;

	// The status control only ever offers what the backend will actually
	// accept: the current value (a no-op) plus its allowed next states. A
	// brand-new class starts from Draft's own transitions (Draft, Scheduled,
	// Cancelled) since create() enforces the same rule.
	const allowedStatuses = [previousStatus, ...ONLINE_CLASS_STATUS_TRANSITIONS[previousStatus]];
	const statusOptions = onlineClassStatusOptions.filter((option) =>
		allowedStatuses.includes(option.value)
	);

	// Section and subject lists are scoped to the class, so a stale pick from a
	// previous class must be cleared. Errors are cleared rather than validated,
	// since validating a field we just emptied would leave a message the user's
	// own next selection cannot dismiss before the first submit.
	const previousClassId = useRef(classId);
	useEffect(() => {
		if (previousClassId.current && previousClassId.current !== classId) {
			form.setValue("sectionId", "");
			form.setValue("subjectId", "");
			form.clearErrors(["sectionId", "subjectId"]);
		}
		previousClassId.current = classId;
	}, [classId, form]);

	const onSubmit = async (values: OnlineClassFormValues) => {
		try {
			if (isEdit && initialData?.id) {
				const response = await updateOnlineClass(initialData.id, values);
				toast.success(t("updateSuccess"));
				notifyIfScheduled(response);
			} else {
				const response = await createOnlineClass(values);
				toast.success(t("addSuccess"));
				notifyIfScheduled(response);
			}
			router.push(PATHS.ACADEMICS.ONLINE_CLASSES.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	// The save has already returned by this point — the notification itself is
	// still being sent in the background, so this can only confirm it started.
	const notifyIfScheduled = (response: any) => {
		if (response?.data?.notifying) {
			toast.info(t("notifyingInBackground"));
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editOnlineClassTitle") : t("addOnlineClassTitle")}</CardTitle>
					<CardDescription>{t("formDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="sessionId"
						label={t("session")}
						type="sessionSelect"
						placeholder={t("selectSession")}
						required
					/>
					<InputField
						control={form.control}
						name="classId"
						label={t("class")}
						type="classSelect"
						placeholder={t("selectClass")}
						dependencyId={sessionId}
						required
					/>
					<InputField
						control={form.control}
						name="sectionId"
						label={t("section")}
						type="sectionSelect"
						placeholder={t("allSections")}
						dependencyId={classId}
						sessionId={sessionId}
					/>
					<InputField
						control={form.control}
						name="subjectId"
						label={t("subject")}
						type="subjectSingleSelect"
						placeholder={t("selectSubject")}
						dependencyId={classId}
						required
					/>
					<InputField
						control={form.control}
						name="teacherId"
						label={t("teacher")}
						type="teacherSelect"
						placeholder={t("selectTeacher")}
					/>
					<InputField
						control={form.control}
						name="platform"
						label={t("platform")}
						type="select"
						options={onlineClassPlatformOptions}
						required
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("detailsSection")}</CardTitle>
					<CardDescription>{t("detailsSectionDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="title"
							label={t("classTitle")}
							type="text"
							placeholder="e.g. Physics Chapter 5 Live Session"
							required
						/>
						<InputField
							control={form.control}
							name="titleBn"
							label={t("titleBn")}
							type="text"
							placeholder="যেমন: পঞ্চম অধ্যায়ের লাইভ ক্লাস"
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-5">
						<InputField
							control={form.control}
							name="classDate"
							label={t("date")}
							type="date"
							required
						/>
						<InputField
							control={form.control}
							name="startTime"
							label={t("startTime")}
							type="time"
							required
						/>
						<InputField
							control={form.control}
							name="endTime"
							label={t("endTime")}
							type="time"
							min={startTime || undefined}
							required
						/>
						<InputField
							control={form.control}
							name="status"
							label={t("status")}
							type="select"
							options={statusOptions}
							required
						/>
						<InputField
							control={form.control}
							name="reminderMinutesBefore"
							label={t("reminderMinutesBefore")}
							type="number"
							placeholder="e.g. 10"
							min={1}
							max={1440}
							helperText={t("reminderMinutesBeforeHint")}
						/>
					</div>
					{/* Scheduling — moving out of Draft for the first time — emails the
					    whole target class roster, and moving into Ongoing sends a
					    "join now" reminder. Make that consequence visible right next to
					    the control that triggers it. */}
					{status === OnlineClassStatusEnum.SCHEDULED &&
					previousStatus !== OnlineClassStatusEnum.SCHEDULED ? (
						<p className="text-muted-foreground text-xs">{t("scheduleNotifyHint")}</p>
					) : status === OnlineClassStatusEnum.ONGOING &&
					  previousStatus !== OnlineClassStatusEnum.ONGOING ? (
						<p className="text-muted-foreground text-xs">{t("ongoingNotifyHint")}</p>
					) : null}

					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="meetingLink"
							label={t("meetingLink")}
							type="url"
							placeholder="https://..."
							required
						/>
						<InputField
							control={form.control}
							name="meetingId"
							label={t("meetingId")}
							type="text"
							placeholder="e.g. 123 456 7890"
						/>
						<InputField
							control={form.control}
							name="passcode"
							label={t("passcode")}
							type="text"
							placeholder="e.g. 4F9x2Q"
						/>
					</div>

					<InputField
						control={form.control}
						name="description"
						label={t("descriptionLabel")}
						type="textarea"
						placeholder={t("descriptionPlaceholder")}
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.ACADEMICS.ONLINE_CLASSES.ROOT)}
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
