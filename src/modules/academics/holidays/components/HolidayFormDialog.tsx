"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { zodResolver } from "@hookform/resolvers/zod";
import { History } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Holiday,
	HolidayCategoryEnum,
	HolidayFormValues,
	holidayCategoryOptions,
	holidaySchema,
} from "../dto/holiday.dto";
import { createHoliday, updateHoliday } from "../hooks/use-holiday-mutations";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Set to edit that holiday; leave unset to create a new one. */
	holiday?: Holiday | null;
	/** Pre-fills start/end date — used when creating from a calendar day click. */
	defaultDate?: string;
};

const today = () => {
	// Local calendar day, not UTC: in Dhaka (UTC+6) `toISOString()` still reads
	// yesterday until 06:00, which would mark today's date as back-dated.
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate()
	).padStart(2, "0")}`;
};

const buildDefaults = (holiday?: Holiday | null, defaultDate?: string, sessionId?: string) => ({
	sessionId: holiday?.sessionId || sessionId || "",
	title: holiday?.title || "",
	titleBn: holiday?.titleBn || "",
	category: holiday?.category || HolidayCategoryEnum.OTHER,
	startDate: holiday?.startDate?.slice(0, 10) || defaultDate || today(),
	endDate: holiday?.endDate?.slice(0, 10) || defaultDate || today(),
	isClosed: holiday?.isClosed ?? true,
	isPublic: holiday?.isPublic ?? true,
	description: holiday?.description || "",
	notifyGuardiansAndStaff: false,
});

function FormSection({
	title,
	children,
	first = false,
}: {
	title: string;
	children: React.ReactNode;
	first?: boolean;
}) {
	return (
		<div className={first ? "space-y-4" : "space-y-4 border-t pt-6"}>
			<h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
				{title}
			</h3>
			{children}
		</div>
	);
}

export default function HolidayFormDialog({ open, onOpenChange, holiday, defaultDate }: Props) {
	const t = useTranslations("Holidays");
	const ft = useTranslations("Forms");
	const locale = useLocale();
	const { selectedSessionId } = useSessionStore();
	const isEdit = !!holiday;

	// A holiday that has already finished is part of the record the school ran
	// on — attendance and working-day counts were derived from its dates. Only
	// its wording stays editable, matching what the API enforces; the fields it
	// would reject are disabled rather than left to fail on submit.
	const hasPassed = !!holiday && holiday.endDate.slice(0, 10) < today();

	// A plain <select> here, not the shared SessionSelect: that one renders
	// Radix's portalled Select, which reads a click on its own popover as a
	// click "outside" this Dialog and closes the whole dialog instead of just
	// the select — see agent-os/standards/javascript/components.md.
	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const sessions: any[] = (sessionsRes?.data || sessionsRes || []).filter(
		(session: any) => session.status === "ACTIVE"
	);

	const form = useForm<HolidayFormValues>({
		resolver: zodResolver(holidaySchema as any),
		defaultValues: buildDefaults(holiday, defaultDate, selectedSessionId || undefined),
	});

	// The dialog instance is reused across every row/day-click, so its form
	// state has to be reset whenever the target record (or prefilled date)
	// changes — otherwise it would keep showing whatever was last edited.
	useEffect(() => {
		if (!open) return;
		form.reset(buildDefaults(holiday, defaultDate, selectedSessionId || undefined));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, holiday, defaultDate]);

	const startDate = form.watch("startDate");

	const onSubmit = async (values: HolidayFormValues) => {
		// The API refuses a back-dated holiday; catching it here puts the message
		// on the field instead of in a toast detached from the input.
		if (!isEdit && values.startDate < today()) {
			form.setError("startDate", { message: t("pastStartDateError") });
			return;
		}

		try {
			if (isEdit && holiday) {
				await updateHoliday(holiday.id, values);
				toast.success(t("updateSuccess"));
			} else {
				await createHoliday(values);
				toast.success(t("addSuccess"));
			}
			onOpenChange(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>{isEdit ? t("editHolidayTitle") : t("addHolidayTitle")}</DialogTitle>
					<DialogDescription>{t("formDescription")}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-1 flex-col overflow-hidden"
				>
					<div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
						{hasPassed && (
							<div className="text-muted-foreground bg-muted/40 flex items-start gap-2 rounded-md border border-dashed px-3 py-2.5 text-xs">
								<History className="mt-0.5 size-3.5 shrink-0" />
								{t("pastHolidayNotice")}
							</div>
						)}

						<FormSection title={t("sectionDetails")} first>
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
												disabled={hasPassed}
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
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<InputField
									control={form.control}
									name="title"
									label={t("titleEn")}
									type="text"
									placeholder="e.g. Independence Day"
									required
								/>
								<InputField
									control={form.control}
									name="titleBn"
									label={t("titleBn")}
									type="text"
									placeholder="যেমন: স্বাধীনতা দিবস"
								/>
							</div>
						</FormSection>

						<FormSection title={t("sectionSchedule")}>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<InputField
									control={form.control}
									name="startDate"
									label={t("startDate")}
									type="date"
									// Only on create: an existing live holiday may legitimately
									// have started before today, and clamping it here would make
									// the field unsubmittable.
									min={!isEdit ? today() : undefined}
									disabled={hasPassed}
									required
								/>
								<InputField
									control={form.control}
									name="endDate"
									label={t("endDate")}
									type="date"
									min={startDate || undefined}
									disabled={hasPassed}
									required
								/>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<InputField
									control={form.control}
									name="category"
									label={t("category")}
									type="native_select"
									options={holidayCategoryOptions}
									disabled={hasPassed}
									required
								/>
								<InputField
									control={form.control}
									name="isClosed"
									label={t("isClosed")}
									type="switch"
									helperText={t("isClosedHint")}
									disabled={hasPassed}
								/>
							</div>
						</FormSection>

						<FormSection title={t("sectionVisibility")}>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<InputField
									control={form.control}
									name="isPublic"
									label={t("isPublic")}
									type="switch"
									helperText={t("isPublicHint")}
									disabled={hasPassed}
								/>
								{!isEdit && (
									<InputField
										control={form.control}
										name="notifyGuardiansAndStaff"
										label={t("notifyGuardiansAndStaff")}
										type="switch"
										helperText={t("notifyGuardiansAndStaffHint")}
									/>
								)}
							</div>
						</FormSection>

						<FormSection title={t("sectionNotes")}>
							<InputField
								control={form.control}
								name="description"
								label={t("descriptionLabel")}
								type="textarea"
								placeholder={t("descriptionPlaceholder")}
							/>
						</FormSection>
					</div>

					<DialogFooter className="shrink-0 border-t px-6 py-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
