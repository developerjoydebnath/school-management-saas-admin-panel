"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	EventAudienceTypeEnum,
	EventCategoryEnum,
	EventFormValues,
	eventAudienceOptions,
	eventCategoryOptions,
	eventSchema,
	EventStatusEnum,
	eventStatusOptions,
	guestTypeOptions,
	SchoolEvent,
	venueTypeOptions,
} from "../dto/event.dto";
import { createEvent, updateEvent } from "../hooks/use-event-mutations";
import { useEventFormOptions } from "../hooks/use-event-form-options";
import EventAudiencePicker from "./EventAudiencePicker";
import EventGallery from "./EventGallery";

type Props = {
	/** Set to edit; omit to create. */
	event?: SchoolEvent | null;
	/** Prefills the date range when arriving from a calendar day click. */
	defaultDate?: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const buildDefaults = (
	event?: SchoolEvent | null,
	defaultDate?: string,
	sessionId?: string
): EventFormValues => ({
	sessionId: event?.sessionId || sessionId || "",
	title: event?.title || "",
	titleBn: event?.titleBn || "",
	category: event?.category || EventCategoryEnum.OTHER,
	description: event?.description || "",
	venue: event?.venue || "",
	venueType: event?.venueType || "",
	startDate: event?.startDate?.slice(0, 10) || defaultDate || today(),
	endDate: event?.endDate?.slice(0, 10) || defaultDate || today(),
	startTime: event?.startTime || "",
	endTime: event?.endTime || "",
	classId: event?.classId || "",
	sectionId: event?.sectionId || "",
	coordinatorId: event?.coordinatorId || "",
	// An event opens with one empty organiser block so there is always
	// something to type into; the API drops it again if it stays blank.
	organizers: event?.organizers?.length
		? event.organizers
		: [
				{
					coordinatorId: event?.coordinatorId || "",
					organizingDepartment: event?.organizingDepartment || "",
					contactPerson: event?.contactPerson || "",
					contactPhone: event?.contactPhone || "",
					contactEmail: event?.contactEmail || "",
				},
			],
	organizingDepartment: event?.organizingDepartment || "",
	contactPerson: event?.contactPerson || "",
	contactPhone: event?.contactPhone || "",
	contactEmail: event?.contactEmail || "",
	audienceClassIds: event?.audienceClassIds?.length
		? event.audienceClassIds
		: event?.classId
			? [event.classId]
			: [],
	audienceSections: event?.audienceSections?.length
		? event.audienceSections
		: event?.classId && event?.sectionId
			? [{ classId: event.classId, sectionId: event.sectionId }]
			: [],
	audienceTypes: event?.audienceTypes?.length
		? event.audienceTypes
		: [EventAudienceTypeEnum.STUDENTS],
	guests: event?.guests || [],
	scheduleItems: event?.scheduleItems || [],
	registrationRequired: event?.registrationRequired ?? false,
	registrationStart: event?.registrationStart?.slice(0, 10) || "",
	registrationEnd: event?.registrationEnd?.slice(0, 10) || "",
	maxParticipants: event?.maxParticipants ?? undefined,
	registrationFee:
		event?.registrationFee !== null && event?.registrationFee !== undefined
			? Number(event.registrationFee)
			: undefined,
	approvalRequired: event?.approvalRequired ?? false,
	status: event?.status || EventStatusEnum.DRAFT,
	isPublic: event?.isPublic ?? true,
	bannerUrl: event?.bannerUrl || "",
	bannerPlaceholder: event?.bannerPlaceholder || "",
	gallery: event?.gallery || [],
});

export default function EventFormPage({ event, defaultDate }: Props) {
	const t = useTranslations("Events");
	const ft = useTranslations("Forms");
	const locale = useLocale();
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();
	const isEdit = !!event;

	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const sessions: any[] = (sessionsRes?.data || sessionsRes || []).filter(
		(session: any) => session.status === "ACTIVE"
	);

	const form = useForm<EventFormValues>({
		resolver: zodResolver(eventSchema as any),
		defaultValues: buildDefaults(event, defaultDate, selectedSessionId || undefined),
	});

	useEffect(() => {
		if (!event) return;
		form.reset(buildDefaults(event, defaultDate, selectedSessionId || undefined));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event]);

	const organizerFields = useFieldArray({
		control: form.control,
		name: "organizers" as never,
	});
	const guestFields = useFieldArray({ control: form.control, name: "guests" as never });
	const scheduleFields = useFieldArray({
		control: form.control,
		name: "scheduleItems" as never,
	});

	const startDate = form.watch("startDate");
	const status = form.watch("status");
	const registrationRequired = form.watch("registrationRequired");
	const sessionId = form.watch("sessionId");
	const audienceTypes = form.watch("audienceTypes");
	const audienceClassIds = form.watch("audienceClassIds");
	const audienceSections = form.watch("audienceSections");

	const { coordinatorOptions } = useEventFormOptions({});

	// Class/section targeting only means anything when students (or their
	// guardians) are in the audience — nobody else is addressed by class.
	const targetsStudents =
		audienceTypes?.includes(EventAudienceTypeEnum.STUDENTS) ||
		audienceTypes?.includes(EventAudienceTypeEnum.GUARDIANS);

	const onSubmit = async (values: EventFormValues) => {
		try {
			if (isEdit && event) {
				await updateEvent(event.id, values);
				toast.success(t("updateSuccess"));
			} else {
				await createEvent(values);
				toast.success(t("addSuccess"));
			}
			router.push(PATHS.EVENTS.SCHEDULING.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="mx-auto max-w-5xl space-y-6 pb-24"
		>
			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>{t("sectionDetails")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex w-full flex-col gap-2">
							<Label className="text-muted-foreground w-full gap-0 text-sm font-medium">
								{t("session")}
								<span className="text-destructive">*</span>
							</Label>
							<Controller
								control={form.control}
								name="sessionId"
								render={({ field, fieldState }) => (
									<>
										<NativeSelect
											name={field.name}
											value={field.value}
											onChange={field.onChange}
											className={fieldState.error ? "border-destructive" : undefined}
										>
											<NativeSelectOption value="">{t("selectSession")}</NativeSelectOption>
											{sessions.map((session) => (
												<NativeSelectOption key={session.id} value={session.id}>
													{typeof session.name === "object"
														? getLocalizedName(session.name, locale)
														: session.name}
												</NativeSelectOption>
											))}
										</NativeSelect>
										{fieldState.error && (
											<p className="text-destructive text-sm">{fieldState.error.message}</p>
										)}
									</>
								)}
							/>
						</div>
						<InputField
							control={form.control}
							name="category"
							label={t("category")}
							type="native_select"
							options={eventCategoryOptions}
							required
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<InputField
							control={form.control}
							name="title"
							label={t("titleEn")}
							type="text"
							placeholder="e.g. Annual Sports Day 2027"
							required
						/>
						<InputField
							control={form.control}
							name="titleBn"
							label={t("titleBn")}
							type="text"
							placeholder="যেমন: বার্ষিক ক্রীড়া দিবস"
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

			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>{t("sectionSchedule")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<InputField
							control={form.control}
							name="startDate"
							label={t("startDate")}
							type="date"
							required
						/>
						<InputField
							control={form.control}
							name="endDate"
							label={t("endDate")}
							type="date"
							min={startDate || undefined}
							required
						/>
						<InputField
							control={form.control}
							name="startTime"
							label={t("startTime")}
							type="time"
						/>
						<InputField control={form.control} name="endTime" label={t("endTime")} type="time" />
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<InputField
							control={form.control}
							name="venueType"
							label={t("venueType")}
							type="native_select"
							options={venueTypeOptions}
						/>
						<InputField
							control={form.control}
							name="venue"
							label={t("venue")}
							type="text"
							placeholder="e.g. School Playground"
						/>
					</div>
				</CardContent>
			</Card>

			{/* One repeatable block instead of one of each field: a sports day has
			    a coordinating teacher per discipline and a separate departmental
			    contact, and the old shape forced all of that into one line. */}
			<Card className="shadow-none">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{t("sectionOrganizer")}</CardTitle>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							organizerFields.append({
								coordinatorId: "",
								organizingDepartment: "",
								contactPerson: "",
								contactPhone: "",
								contactEmail: "",
							} as never)
						}
					>
						<Plus className="size-4" />
						{t("addOrganizer")}
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{!organizerFields.fields.length ? (
						<p className="text-muted-foreground text-sm">{t("noOrganizers")}</p>
					) : (
						organizerFields.fields.map((field, index) => (
							<div key={field.id} className="space-y-3 rounded-lg border p-4">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs font-semibold uppercase">
										{t("organizer")} {index + 1}
									</span>
									{/* The last block stays: removing it would leave the section
									    with nothing to type into and no obvious way back. */}
									{organizerFields.fields.length > 1 && (
										<Button
											type="button"
											variant="destructive"
											size="icon-sm"
											onClick={() => organizerFields.remove(index)}
										>
											<Trash2 className="size-4" />
										</Button>
									)}
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<InputField
										control={form.control}
										name={`organizers.${index}.organizingDepartment`}
										label={t("organizingDepartment")}
										type="text"
										placeholder="e.g. Sports Department"
									/>
									<InputField
										control={form.control}
										name={`organizers.${index}.coordinatorId`}
										label={t("coordinator")}
										type="native_select"
										options={[{ label: t("noCoordinator"), value: "" }, ...coordinatorOptions]}
									/>
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<InputField
										control={form.control}
										name={`organizers.${index}.contactPerson`}
										label={t("contactPerson")}
										type="text"
									/>
									<InputField
										control={form.control}
										name={`organizers.${index}.contactPhone`}
										label={t("contactPhone")}
										type="tel"
									/>
									<InputField
										control={form.control}
										name={`organizers.${index}.contactEmail`}
										label={t("contactEmail")}
										type="email"
									/>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>{t("sectionAudience")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Controller
						control={form.control}
						name="audienceTypes"
						render={({ field }) => {
							const selected: string[] = field.value || [];
							return (
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">
										{t("audienceTypes")}
									</Label>
									<div className="flex flex-wrap gap-4">
										{eventAudienceOptions.map((option) => (
											<label
												key={option.value}
												className="flex cursor-pointer items-center gap-2 text-sm"
											>
												<Checkbox
													checked={selected.includes(option.value)}
													onCheckedChange={(checked) =>
														field.onChange(
															checked
																? [...selected, option.value]
																: selected.filter((v) => v !== option.value)
														)
													}
												/>
												{t(`audience.${option.value}`)}
											</label>
										))}
									</div>
								</div>
							);
						}}
					/>
					{/* Only shown when the audience actually includes students or
					    their guardians — a staff-only event is not addressed by class,
					    and leaving the tree on screen would imply otherwise. */}
					{targetsStudents && (
						<div className="border-t pt-4">
							<EventAudiencePicker
								sessionId={sessionId}
								classIds={audienceClassIds || []}
								sections={audienceSections || []}
								onChange={(next) => {
									form.setValue("audienceClassIds", next.classIds, {
										shouldDirty: true,
									});
									form.setValue("audienceSections", next.sections, {
										shouldDirty: true,
									});
								}}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="shadow-none">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{t("sectionGuests")}</CardTitle>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							guestFields.append({
								name: "",
								designation: "",
								organization: "",
								guestType: "chief_guest",
							} as never)
						}
					>
						<Plus className="size-4" />
						{t("addGuest")}
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{!guestFields.fields.length ? (
						<p className="text-muted-foreground text-sm">{t("noGuests")}</p>
					) : (
						guestFields.fields.map((field, index) => (
							<div key={field.id} className="space-y-3 rounded-lg border p-4">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs font-semibold uppercase">
										{t("guest")} {index + 1}
									</span>
									<Button
										type="button"
										variant="destructive"
										size="icon-sm"
										onClick={() => guestFields.remove(index)}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<InputField
										control={form.control}
										name={`guests.${index}.name`}
										label={t("guestName")}
										type="text"
										required
									/>
									<InputField
										control={form.control}
										name={`guests.${index}.guestType`}
										label={t("guestType")}
										type="native_select"
										options={guestTypeOptions}
									/>
									<InputField
										control={form.control}
										name={`guests.${index}.designation`}
										label={t("guestDesignation")}
										type="text"
									/>
									<InputField
										control={form.control}
										name={`guests.${index}.organization`}
										label={t("guestOrganization")}
										type="text"
									/>
									<InputField
										control={form.control}
										name={`guests.${index}.phone`}
										label={t("contactPhone")}
										type="tel"
									/>
									<InputField
										control={form.control}
										name={`guests.${index}.email`}
										label={t("contactEmail")}
										type="email"
									/>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			<Card className="shadow-none">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{t("sectionProgram")}</CardTitle>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							scheduleFields.append({
								title: "",
								startTime: "",
								endTime: "",
								location: "",
								speaker: "",
							} as never)
						}
					>
						<Plus className="size-4" />
						{t("addScheduleItem")}
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{!scheduleFields.fields.length ? (
						<p className="text-muted-foreground text-sm">{t("noScheduleItems")}</p>
					) : (
						scheduleFields.fields.map((field, index) => (
							<div key={field.id} className="space-y-3 rounded-lg border p-4">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs font-semibold uppercase">
										{index + 1}
									</span>
									<Button
										type="button"
										variant="destructive"
										size="icon-sm"
										onClick={() => scheduleFields.remove(index)}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<InputField
										control={form.control}
										name={`scheduleItems.${index}.title`}
										label={t("scheduleTitle")}
										type="text"
										placeholder="e.g. Opening Speech"
										required
									/>
									<InputField
										control={form.control}
										name={`scheduleItems.${index}.speaker`}
										label={t("scheduleSpeaker")}
										type="text"
									/>
									<InputField
										control={form.control}
										name={`scheduleItems.${index}.startTime`}
										label={t("startTime")}
										type="time"
									/>
									<InputField
										control={form.control}
										name={`scheduleItems.${index}.endTime`}
										label={t("endTime")}
										type="time"
									/>
									<InputField
										control={form.control}
										name={`scheduleItems.${index}.location`}
										label={t("scheduleLocation")}
										type="text"
									/>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>{t("sectionRegistration")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<InputField
							control={form.control}
							name="registrationRequired"
							label={t("registrationRequired")}
							type="switch"
							helperText={t("registrationRequiredHint")}
						/>
						<InputField
							control={form.control}
							name="approvalRequired"
							label={t("approvalRequired")}
							type="switch"
							helperText={t("approvalRequiredHint")}
						/>
					</div>
					{registrationRequired && (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputField
								control={form.control}
								name="registrationStart"
								label={t("registrationStart")}
								type="date"
							/>
							<InputField
								control={form.control}
								name="registrationEnd"
								label={t("registrationEnd")}
								type="date"
							/>
							<InputField
								control={form.control}
								name="maxParticipants"
								label={t("maxParticipants")}
								type="number"
								min={0}
							/>
							<InputField
								control={form.control}
								name="registrationFee"
								label={t("registrationFee")}
								type="number"
								min={0}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="shadow-none">
				<CardHeader>
					<CardTitle>{t("sectionStatusVisibility")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* `items-start` + the switch's label spacer: the select sits under
					    its label while the switch draws its own label inside the box,
					    so without both the two controls start at different heights. */}
					<div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
						<InputField
							control={form.control}
							name="status"
							label={t("status")}
							type="native_select"
							options={eventStatusOptions}
							helperText={
								status === EventStatusEnum.SCHEDULED ? t("scheduledMailHint") : undefined
							}
							required
						/>
						<InputField
							control={form.control}
							name="isPublic"
							label={t("isPublic")}
							type="switch"
							helperText={t("isPublicHint")}
							alignWithLabel
						/>
					</div>
				</CardContent>
			</Card>

			{status === EventStatusEnum.COMPLETED && (
				<Card className="shadow-none">
					<CardHeader>
						<CardTitle>{t("sectionGallery")}</CardTitle>
					</CardHeader>
					<CardContent>
						<Controller
							control={form.control}
							name="gallery"
							render={({ field }) => (
								<EventGallery value={field.value || []} onChange={field.onChange} />
							)}
						/>
					</CardContent>
				</Card>
			)}

			<div className="bg-background/80 sticky bottom-4 z-[1200] flex justify-end gap-3 rounded-lg border p-4 backdrop-blur">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(PATHS.EVENTS.SCHEDULING.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
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
