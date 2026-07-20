"use client";

import ClassRoomSelect from "@/shared/components/form/ClassRoomSelect";
import InputField from "@/shared/components/form/InputField";
import ShiftSelect from "@/shared/components/form/ShiftSelect";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { useSWR } from "@/shared/hooks/use-swr";
import { useSessionStore } from "@/shared/stores/session-store";
import { StatusEnum } from "@/shared/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpenCheck, Layers3, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSessionClassSetup } from "../hooks/use-session-class-setup";
import { saveSessionClassSetup } from "../hooks/use-session-class-setup-mutations";

type SetupRow = {
	sectionId: string;
	capacity: string;
	shiftId: string;
	roomId: string;
	status: StatusEnum;
};

const formSchema = z.object({
	sessionId: z.string().min(1, "Session is required"),
	classId: z.string().min(1, "Class is required"),
	hasSections: z.boolean(),
	capacity: z.coerce.number().min(0).optional(),
	shiftId: z.string().optional(),
	roomId: z.string().optional(),
	status: z.nativeEnum(StatusEnum),
});

type FormValues = z.infer<typeof formSchema>;

export default function SessionClassSetupView() {
	const selectedSessionId = useSessionStore((state) => state.selectedSessionId);
	const [rows, setRows] = useState<SetupRow[]>([]);
	const { data: sectionsResponse } = useSWR("/sections/active-list");
	const masterSections = sectionsResponse?.data || sectionsResponse || [];

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema as any),
		defaultValues: {
			sessionId: selectedSessionId || "",
			classId: "",
			hasSections: true,
			capacity: 0,
			shiftId: "",
			roomId: "",
			status: StatusEnum.ACTIVE,
		},
	});

	const sessionId = form.watch("sessionId");
	const classId = form.watch("classId");
	const hasSections = form.watch("hasSections");
	const { data: setup, isLoading } = useSessionClassSetup({ sessionId, classId });

	useEffect(() => {
		if (selectedSessionId && !form.getValues("sessionId")) {
			form.setValue("sessionId", selectedSessionId);
		}
	}, [form, selectedSessionId]);

	useEffect(() => {
		if (!setup) {
			setRows([]);
			return;
		}

		form.setValue("hasSections", !!setup.hasSections);
		const first = setup.items?.[0];
		if (!setup.hasSections && first) {
			form.setValue("capacity", first.capacity ?? 0);
			form.setValue("shiftId", first.shiftId || "");
			form.setValue("roomId", first.roomId || "");
			form.setValue("status", first.status || StatusEnum.ACTIVE);
		}

		setRows(
			(setup.items || [])
				.filter((item: any) => item.sectionId)
				.map((item: any) => ({
					sectionId: item.sectionId,
					capacity: item.capacity?.toString() || "",
					shiftId: item.shiftId || "",
					roomId: item.roomId || "",
					status: item.status || StatusEnum.ACTIVE,
				}))
		);
	}, [form, setup]);

	const selectedSectionIds = useMemo(() => new Set(rows.map((row) => row.sectionId)), [rows]);

	const toggleSection = (sectionId: string) => {
		setRows((current) => {
			if (current.some((row) => row.sectionId === sectionId)) {
				return current.filter((row) => row.sectionId !== sectionId);
			}
			return [
				...current,
				{
					sectionId,
					capacity: "",
					shiftId: "",
					roomId: "",
					status: StatusEnum.ACTIVE,
				},
			];
		});
	};

	const updateRow = (index: number, patch: Partial<SetupRow>) => {
		setRows((current) =>
			current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row))
		);
	};

	const changeRowSection = (index: number, sectionId: string) => {
		if (rows.some((row, rowIndex) => rowIndex !== index && row.sectionId === sectionId)) {
			toast.error("This section is already assigned to the selected class session.");
			return;
		}
		updateRow(index, { sectionId });
	};

	const removeRow = (index: number) => {
		setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
	};

	const getSectionName = (sectionId: string) => {
		const section = masterSections.find((item: any) => item.value === sectionId || item.id === sectionId);
		return section?.label || section?.name || "Section";
	};

	const onSubmit = async (values: FormValues) => {
		if (values.hasSections && rows.length === 0) {
			toast.error("Select at least one section for this class session.");
			return;
		}

		try {
			await saveSessionClassSetup({
				sessionId: values.sessionId,
				classId: values.classId,
				hasSections: values.hasSections,
				classLevel: values.hasSections
					? undefined
					: {
						capacity: Number(values.capacity || 0),
						shiftId: values.shiftId || null,
						roomId: values.roomId || null,
						status: values.status,
					},
				sections: values.hasSections
					? rows.map((row) => ({
						sectionId: row.sectionId,
						capacity: row.capacity ? Number(row.capacity) : null,
						shiftId: row.shiftId || null,
						roomId: row.roomId || null,
						status: row.status,
					}))
					: [],
			});
			toast.success("Session class setup saved successfully");
		} catch {
			// Global interceptor shows the backend message.
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<BookOpenCheck className="size-4" />
						Class Session Target
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="sessionId"
						type="sessionSelect"
						label="Session"
						placeholder="Select session"
						required
					/>
					<InputField
						control={form.control}
						name="classId"
						type="classSelect"
						label="Class"
						placeholder="Select class"
						required
					/>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Layers3 className="size-4" />
						Section Availability
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="flex items-center justify-between rounded-md border p-4">
						<div>
							<p className="font-medium">Use sections for this class session</p>
							<p className="text-muted-foreground text-sm">
								Turn this off when the class runs as one group for the selected session.
							</p>
						</div>
						<Switch
							checked={hasSections}
							onCheckedChange={(checked) => form.setValue("hasSections", checked)}
						/>
					</div>

					{!sessionId || !classId ? (
						<div className="text-muted-foreground rounded-md border border-dashed p-6 text-sm">
							Select a session and class to configure section availability.
						</div>
					) : isLoading ? (
						<div className="text-muted-foreground rounded-md border border-dashed p-6 text-sm">
							Loading current setup...
						</div>
					) : hasSections ? (
						<div className="space-y-4">
							<div>
								<Label className="text-sm font-medium">Available Sections</Label>
								<ScrollArea className="mt-2 w-full">
									<div className="flex gap-2 pb-2">
										{masterSections.map((section: any) => {
											const id = section.value || section.id;
											const isSelected = selectedSectionIds.has(id);
											return (
												<Button
													key={id}
													type="button"
													variant={isSelected ? "default" : "outline"}
													size="sm"
													className="rounded-full"
													onClick={() => toggleSection(id)}
												>
													{section.label || section.name}
												</Button>
											);
										})}
										{masterSections.length === 0 && (
											<p className="text-muted-foreground text-sm">
												No active section masters found.
											</p>
										)}
									</div>
									<ScrollBar orientation="horizontal" />
								</ScrollArea>
							</div>

							<div className="overflow-hidden rounded-md border">
								<ScrollArea className="w-full">
									<div className="min-w-[980px]">
										<div className="grid grid-cols-[220px_140px_1fr_1fr_140px_44px] gap-3 border-b bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
											<span>Section</span>
											<span>Capacity</span>
											<span>Shift</span>
											<span>Room</span>
											<span>Status</span>
											<span />
										</div>
										<div className="divide-y">
											{rows.map((row, index) => (
												<div
													key={`${row.sectionId}-${index}`}
													className="grid grid-cols-[220px_140px_1fr_1fr_140px_44px] items-center gap-3 bg-card/40 px-3 py-2 transition-colors hover:bg-muted/20"
												>
													<Select
														value={row.sectionId}
														onValueChange={(value) => changeRowSection(index, value)}
													>
														<SelectTrigger className="h-9! w-full">
															<SelectValue placeholder="Select section" />
														</SelectTrigger>
														<SelectContent className="p-1">
															{masterSections.map((section: any) => {
																const id = section.value || section.id;
																const isUsed = rows.some(
																	(item, rowIndex) => rowIndex !== index && item.sectionId === id
																);
																return (
																	<SelectItem
																		key={id}
																		value={id}
																		disabled={isUsed}
																		className="cursor-pointer py-2"
																	>
																		{section.label || section.name}
																	</SelectItem>
																);
															})}
														</SelectContent>
													</Select>
													<Input
														aria-label={`${getSectionName(row.sectionId)} capacity`}
														type="number"
														min={0}
														value={row.capacity}
														placeholder="e.g. 40"
														className="h-9"
														onChange={(event) =>
															updateRow(index, { capacity: event.target.value })
														}
													/>
													<ShiftSelect
														value={row.shiftId}
														onChange={(value) => updateRow(index, { shiftId: value })}
														placeholder="Select shift"
													/>
													<ClassRoomSelect
														value={row.roomId}
														onChange={(value) => updateRow(index, { roomId: value })}
														placeholder="Select room"
													/>
													<Select
														value={row.status}
														onValueChange={(value) =>
															updateRow(index, {
																status: value as StatusEnum,
															})
														}
													>
														<SelectTrigger className="h-9! w-full">
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
														<SelectContent className="p-1">
															<SelectItem value={StatusEnum.ACTIVE} className="cursor-pointer py-2">
																Active
															</SelectItem>
															<SelectItem value={StatusEnum.INACTIVE} className="cursor-pointer py-2">
																Inactive
															</SelectItem>
														</SelectContent>
													</Select>
													<Button
														type="button"
														variant="destructive"
														size="icon"
														className="size-9"
														aria-label={`Remove ${getSectionName(row.sectionId)}`}
														onClick={() => removeRow(index)}
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											))}
										</div>
									</div>
									<ScrollBar orientation="horizontal" />
								</ScrollArea>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 rounded-md border bg-card/70 p-4 @3xl/page:grid-cols-2">
							<InputField
								control={form.control}
								name="capacity"
								type="number"
								label="Class Capacity"
								placeholder="e.g. 40"
							/>
							<InputField
								control={form.control}
								name="status"
								type="select"
								label="Status"
								placeholder="Select status"
								options={[
									{ label: "Active", value: StatusEnum.ACTIVE },
									{ label: "Inactive", value: StatusEnum.INACTIVE },
								]}
							/>
							<InputField
								control={form.control}
								name="shiftId"
								type="shiftSelect"
								label="Shift"
								placeholder="Select shift"
							/>
							<InputField
								control={form.control}
								name="roomId"
								type="classRoomSelect"
								label="Room"
								placeholder="Select room"
							/>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end rounded-md p-4 shadow-lg backdrop-blur">
				<Button type="submit" disabled={form.formState.isSubmitting}>
					<Save className="size-4" />
					{form.formState.isSubmitting ? "Saving..." : "Save Setup"}
				</Button>
			</div>
		</form>
	);
}
