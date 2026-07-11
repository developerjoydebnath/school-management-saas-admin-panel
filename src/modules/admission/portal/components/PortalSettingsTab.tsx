"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import axios from "@/shared/lib/axios";
import { Save } from "lucide-react";
import { useLocale, useTranslations, useMessages } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface PortalSettingsTabProps {
	config: any;
	onUpdate: () => void;
}

type PortalField = {
	id: string;
	fieldKey: string;
	section: string;
	label: string;
	labelBn?: string | null;
	fieldType: string;
	isSystem?: boolean;
	isSystemLocked?: boolean;
	sortOrder?: number;
	options?: any;
	portal?: {
		isShown?: boolean;
		isRequired?: boolean;
	};
};

function dateInputValue(value?: string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return local.toISOString().slice(0, 16);
}

function sectionTitle(section: string) {
	return section
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function makeSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export default function PortalSettingsTab({ config, onUpdate }: PortalSettingsTabProps) {
	const locale = useLocale();
	const t = useTranslations("Portal");
	const messages = useMessages() as any;
	const portalSections = messages?.Portal?.sections || {};
	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState({
		onlinePortalEnabled: Boolean(config.onlinePortalEnabled),
		onlinePortalSlug: config.onlinePortalSlug || "",
		onlinePortalOpensAt: dateInputValue(config.onlinePortalOpensAt),
		onlinePortalClosesAt: dateInputValue(config.onlinePortalClosesAt),
	});
	const [fields, setFields] = useState<PortalField[]>([]);

	useEffect(() => {
		setForm({
			onlinePortalEnabled: Boolean(config.onlinePortalEnabled),
			onlinePortalSlug: config.onlinePortalSlug || "",
			onlinePortalOpensAt: dateInputValue(config.onlinePortalOpensAt),
			onlinePortalClosesAt: dateInputValue(config.onlinePortalClosesAt),
		});
		setFields(
			[...(config.fieldConfigs || [])].sort(
				(a: PortalField, b: PortalField) => (a.sortOrder || 0) - (b.sortOrder || 0)
			)
		);
	}, [config]);

	const groupedFields = useMemo(() => {
		const grouped = new Map<string, PortalField[]>();
		for (const field of fields) {
			grouped.set(field.section, [...(grouped.get(field.section) || []), field]);
		}
		return Array.from(grouped.entries());
	}, [fields]);

	const setPortalFlag = (
		fieldKey: string,
		flag: "isShown" | "isRequired",
		checked: boolean
	) => {
		setFields((current) =>
			current.map((field) =>
				field.fieldKey === fieldKey
					? {
						...field,
						portal: {
							...(field.portal || {}),
							[flag]: checked,
							...(flag === "isShown" && !checked ? { isRequired: false } : {}),
						},
					}
					: field
			)
		);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await axios.put("/admission/portal/config", {
				sessionId: config.sessionId,
				onlinePortalEnabled: form.onlinePortalEnabled,
				onlinePortalSlug: makeSlug(form.onlinePortalSlug),
				onlinePortalOpensAt: form.onlinePortalOpensAt
					? new Date(form.onlinePortalOpensAt).toISOString()
					: null,
				onlinePortalClosesAt: form.onlinePortalClosesAt
					? new Date(form.onlinePortalClosesAt).toISOString()
					: null,
				fields: fields.map((field) => ({
					fieldKey: field.fieldKey,
					portal: {
						isShown: Boolean(field.portal?.isShown),
						isRequired: Boolean(field.portal?.isRequired),
					},
				})),
			});
			toast.success("Online portal settings saved.");
			onUpdate();
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("settingsCardTitle")}</CardTitle>
					<CardDescription>
						{t("settingsCardDesc")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5 md:grid-cols-2">
					<div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
						<div>
						<div className="font-medium">{t("portalOpenTitle")}</div>
						<div className="text-muted-foreground text-sm">
							{t("portalOpenDesc")}
						</div>
						</div>
						<Switch
							checked={form.onlinePortalEnabled}
							onCheckedChange={(checked) =>
								setForm((current) => ({ ...current, onlinePortalEnabled: checked }))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label>Portal Slug</Label>
						<Input
							placeholder="e.g. model-school-admission"
							value={form.onlinePortalSlug}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									onlinePortalSlug: makeSlug(event.target.value),
								}))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label>Opening Date & Time</Label>
						<Input
							type="datetime-local"
							placeholder="Select opening date"
							value={form.onlinePortalOpensAt}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									onlinePortalOpensAt: event.target.value,
								}))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label>Closing Date & Time</Label>
						<Input
							type="datetime-local"
							placeholder="Select closing date"
							value={form.onlinePortalClosesAt}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									onlinePortalClosesAt: event.target.value,
								}))
							}
						/>
					</div>
				</CardContent>
			</Card>

			{groupedFields.map(([section, sectionFields]) => (
				<Card key={section} className="gap-4 py-4">
					<CardHeader>
						<CardTitle className="text-lg">{portalSections[section] || sectionTitle(section)}</CardTitle>
						<CardDescription>
							{t("fieldsCardDesc")}
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50 border-t">
									<TableHead className="pl-6">{t("tableFieldName")}</TableHead>
									<TableHead>{t("tableType")}</TableHead>
									<TableHead>{t("tableShown")}</TableHead>
									<TableHead>{t("tableRequired")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sectionFields.map((field) => {
									const label = field.label;
									const shown = Boolean(field.portal?.isShown);
									const required = Boolean(field.portal?.isRequired);
									return (
										<TableRow key={field.fieldKey}>
											<TableCell className="pl-6 font-medium">
												<div className="flex items-center gap-2">
													{label}
													{field.isSystem && (
														<Badge variant="secondary" className="h-4 text-[10px]">
															System
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground capitalize">
												{field.fieldType}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Switch
														checked={shown}
														onCheckedChange={(checked) =>
															setPortalFlag(field.fieldKey, "isShown", checked)
														}
													/>
													<span
														className={
															shown
																? "text-sm font-medium text-green-600"
																: "text-muted-foreground text-sm"
														}
													>
														{shown ? "Shown" : "Hidden"}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Switch
														checked={required}
														disabled={!shown}
														onCheckedChange={(checked) =>
															setPortalFlag(field.fieldKey, "isRequired", checked)
														}
													/>
													<span
														className={
															required
																? "text-sm font-medium text-blue-600"
																: "text-muted-foreground text-sm"
														}
													>
														{required ? "Required" : "Optional"}
													</span>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			))}

			<div className="bg-card sticky bottom-4 z-20 flex justify-end rounded-lg border p-4">
				<Button onClick={handleSave} disabled={isSaving}>
					<Save className="h-4 w-4" />
					{isSaving ? t("saving") : t("saveConfig")}
				</Button>
			</div>
		</div>
	);
}
