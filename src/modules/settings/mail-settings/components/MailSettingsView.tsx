"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { ROLES } from "@/shared/configs/roles.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { cn } from "@/shared/lib/utils";
import { Mail, Save, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { MailConfig, MailConfigPayload } from "../dto/mail-setting.dto";
import {
	testSchoolMailSettings,
	testPlatformMailSettings,
	updateSchoolMailSettings,
	updateSchoolMailStatus,
	updatePlatformMailSettings,
	usePlatformMailSettings,
	useSchoolMailSettings,
} from "../hooks/use-mail-settings";

function asForm(config?: MailConfig | null): MailConfigPayload {
	return {
		provider: config?.provider || "smtp",
		mode: config?.mode || "system",
		isActive: !!config?.isActive,
		smtpHost: config?.smtpHost || "",
		smtpPort: Number(config?.smtpPort || 587),
		smtpSecure: !!config?.smtpSecure,
		smtpUser: config?.smtpUser || "",
		smtpPassword: "",
		fromName: config?.fromName || "",
		fromEmail: config?.fromEmail || "",
		replyToEmail: config?.replyToEmail || "",
	};
}

function statusTone(config?: MailConfig | null) {
	if (config?.isActive && config?.isVerified) return "border-emerald-500/40 text-emerald-500";
	if (config?.isActive) return "border-amber-500/40 text-amber-500";
	return "border-muted-foreground/30 text-muted-foreground";
}

function Field({
	label,
	children,
	fullWidth,
}: {
	label: string;
	children: ReactNode;
	fullWidth?: boolean;
}) {
	return (
		<div className={cn("space-y-2", fullWidth && "@xl/body:col-span-2")}>
			<Label>{label}</Label>
			{children}
		</div>
	);
}

function MailConfigFields({
	form,
	hasPassword,
	onChange,
}: {
	form: MailConfigPayload;
	hasPassword?: boolean;
	onChange: (patch: Partial<MailConfigPayload>) => void;
}) {
	return (
		<div className="grid gap-4 @xl/body:grid-cols-2">
			<Field label="Provider">
				<Input
					value={form.provider || "smtp"}
					onChange={(event) => onChange({ provider: event.target.value })}
					placeholder="smtp"
				/>
			</Field>
			<Field label="SMTP Host">
				<Input
					value={form.smtpHost || ""}
					onChange={(event) => onChange({ smtpHost: event.target.value })}
					placeholder="smtp.gmail.com"
				/>
			</Field>
			<Field label="SMTP Port">
				<Input
					type="number"
					value={form.smtpPort || ""}
					onChange={(event) => onChange({ smtpPort: Number(event.target.value) })}
					placeholder="587"
				/>
			</Field>
			<Field label="Secure Connection">
				<div className="flex h-10 items-center justify-between rounded-md border px-3">
					<span className="text-sm">Use SSL/TLS</span>
					<Switch
						checked={!!form.smtpSecure}
						onCheckedChange={(checked) => onChange({ smtpSecure: checked })}
					/>
				</div>
			</Field>
			<Field label="SMTP Username">
				<Input
					value={form.smtpUser || ""}
					onChange={(event) => onChange({ smtpUser: event.target.value })}
					placeholder="school@gmail.com"
				/>
			</Field>
			<Field label="SMTP Password">
				<Input
					type="password"
					value={form.smtpPassword || ""}
					onChange={(event) => onChange({ smtpPassword: event.target.value })}
					placeholder={hasPassword ? "Password already configured" : "Enter app password"}
				/>
			</Field>
			<Field label="From Name">
				<Input
					value={form.fromName || ""}
					onChange={(event) => onChange({ fromName: event.target.value })}
					placeholder="Dhaka Model School"
				/>
			</Field>
			<Field label="From Email">
				<Input
					type="email"
					value={form.fromEmail || ""}
					onChange={(event) => onChange({ fromEmail: event.target.value })}
					placeholder="admission@school.edu.bd"
				/>
			</Field>
			<Field label="Reply-To Email" fullWidth>
				<Input
					type="email"
					value={form.replyToEmail || ""}
					onChange={(event) => onChange({ replyToEmail: event.target.value })}
					placeholder="office@school.edu.bd"
				/>
			</Field>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="mx-auto max-w-7xl space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</div>
			<div className="grid gap-4 @3xl/body:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Card key={index} className="rounded-lg">
						<CardContent className="space-y-3 p-4">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
			<Card className="rounded-lg">
				<CardContent className="grid gap-4 p-4 @xl/body:grid-cols-2">
					{Array.from({ length: 8 }).map((_, index) => (
						<Skeleton key={index} className="h-10 w-full" />
					))}
				</CardContent>
			</Card>
		</div>
	);
}

export function MailSettingsView() {
	return <SchoolMailSettingsView showSoftwareForPlatformAdmins />;
}

export function SoftwareMailSettingsView() {
	const {
		config: platformConfig,
		isLoading,
		mutate: refreshPlatform,
	} = usePlatformMailSettings(true);
	const [platformForm, setPlatformForm] = useState<MailConfigPayload>(asForm(null));
	const [platformTestEmail, setPlatformTestEmail] = useState("");
	const [savingPlatform, setSavingPlatform] = useState(false);
	const [testingPlatform, setTestingPlatform] = useState(false);

	useEffect(() => {
		if (platformConfig) setPlatformForm(asForm(platformConfig));
	}, [platformConfig]);

	const updatePlatform = (patch: Partial<MailConfigPayload>) => {
		setPlatformForm((current) => ({ ...current, ...patch }));
	};

	const savePlatform = async () => {
		setSavingPlatform(true);
		try {
			await updatePlatformMailSettings({
				...platformForm,
				mode: "own",
				smtpPort: Number(platformForm.smtpPort || 587),
			});
			toast.success("Software mail settings saved successfully");
			await refreshPlatform();
			updatePlatform({ smtpPassword: "" });
		} finally {
			setSavingPlatform(false);
		}
	};

	const sendPlatformTest = async () => {
		if (!platformTestEmail.trim()) {
			toast.error("Enter a test recipient email");
			return;
		}
		setTestingPlatform(true);
		try {
			await testPlatformMailSettings(platformTestEmail.trim());
			toast.success("Software test email sent successfully");
			await refreshPlatform();
		} finally {
			setTestingPlatform(false);
		}
	};

	if (isLoading) return <LoadingState />;

	return (
		<div className="mx-auto max-w-7xl space-y-4">
			<div className="flex flex-col gap-3 @3xl/body:flex-row @3xl/body:items-start @3xl/body:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Software Mail Settings</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Configure the default SaaS sender used when schools choose the software sender.
					</p>
				</div>
				<Button onClick={savePlatform} disabled={savingPlatform}>
					<Save className="size-4" />
					{savingPlatform ? "Saving..." : "Save Software Mail"}
				</Button>
			</div>

			<div className="grid gap-4 @3xl/body:grid-cols-3">
				<Card className="rounded-lg">
					<CardHeader className="pb-2">
						<p className="font-medium">Sender Status</p>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline" className={statusTone(platformConfig)}>
								{platformConfig?.isActive ? "Active" : "Inactive"}
							</Badge>
							<Badge variant="outline">
								{platformConfig?.isVerified ? "Verified" : "Not verified"}
							</Badge>
						</div>
						<p className="text-muted-foreground text-sm">
							{platformConfig?.lastTestError || "This sender is hidden from school users."}
						</p>
					</CardContent>
				</Card>
				<Card className="rounded-lg @3xl/body:col-span-2">
					<CardHeader className="pb-2">
						<p className="font-medium">Development Note</p>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							For MailDev, use host localhost, port 1025, secure off, no username, and no password.
							Then open http://localhost:1080 to inspect captured mail.
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="rounded-lg">
				<CardHeader>
					<div className="flex flex-col gap-3 @xl/body:flex-row @xl/body:items-center @xl/body:justify-between">
						<div>
							<h2 className="text-lg font-semibold">Software SMTP Configuration</h2>
							<p className="text-muted-foreground text-sm">
								This is the fallback sender for all schools unless a school verifies its own SMTP.
							</p>
						</div>
						<div className="flex items-center gap-3 rounded-md border px-3 py-2">
							<span className="text-sm">Active fallback</span>
							<Switch
								checked={!!platformForm.isActive}
								onCheckedChange={(checked) => updatePlatform({ isActive: checked })}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<MailConfigFields
						form={platformForm}
						hasPassword={platformConfig?.hasPassword}
						onChange={updatePlatform}
					/>

					<div className="rounded-lg border p-4">
						<h3 className="font-medium">Test Software Configuration</h3>
						<p className="text-muted-foreground mt-1 text-sm">
							A successful test marks this software sender as verified.
						</p>
						<div className="mt-4 flex flex-col gap-3 @xl/body:flex-row">
							<Input
								type="email"
								value={platformTestEmail}
								onChange={(event) => setPlatformTestEmail(event.target.value)}
								placeholder="test@example.com"
							/>
							<Button variant="outline" onClick={sendPlatformTest} disabled={testingPlatform}>
								<Send className="size-4" />
								{testingPlatform ? "Sending..." : "Send Test"}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function SchoolMailSettingsView({
	showSoftwareForPlatformAdmins = false,
}: {
	showSoftwareForPlatformAdmins?: boolean;
}) {
	const user = useAuthStore((state) => state.auth.user);
	const {
		config: schoolConfig,
		isLoading,
		mutate: refreshSchool,
	} = useSchoolMailSettings();
	const [form, setForm] = useState<MailConfigPayload>(asForm(null));
	const [platformForm, setPlatformForm] = useState<MailConfigPayload>(asForm(null));
	const [testEmail, setTestEmail] = useState("");
	const [platformTestEmail, setPlatformTestEmail] = useState("");
	const [saving, setSaving] = useState(false);
	const [savingPlatform, setSavingPlatform] = useState(false);
	const [testing, setTesting] = useState(false);
	const [testingPlatform, setTestingPlatform] = useState(false);
	const [statusLoading, setStatusLoading] = useState(false);
	const isPlatformAdmin =
		user?.base_role === ROLES.SUPER_ADMIN || user?.base_role === ROLES.DEVELOPER;
	const {
		config: platformConfig,
		mutate: refreshPlatform,
	} = usePlatformMailSettings(showSoftwareForPlatformAdmins && isPlatformAdmin);

	useEffect(() => {
		if (schoolConfig) setForm(asForm(schoolConfig));
	}, [schoolConfig]);

	useEffect(() => {
		if (platformConfig) setPlatformForm(asForm(platformConfig));
	}, [platformConfig]);

	const activeSource = useMemo(() => {
		if (schoolConfig?.mode === "own" && schoolConfig?.isActive && schoolConfig?.isVerified) {
			return "School mail";
		}
		if (schoolConfig?.mode !== "own") {
			return "Software default";
		}
		if (platformConfig?.id && platformConfig?.isActive && platformConfig?.isVerified) {
			return "Software mail";
		}
		return "Mail not configured";
	}, [platformConfig, schoolConfig]);

	const update = (patch: Partial<MailConfigPayload>) => {
		setForm((current) => ({ ...current, ...patch }));
	};

	const updatePlatform = (patch: Partial<MailConfigPayload>) => {
		setPlatformForm((current) => ({ ...current, ...patch }));
	};

	const save = async () => {
		setSaving(true);
		try {
			await updateSchoolMailSettings({
				...form,
				smtpPort: Number(form.smtpPort || 587),
			});
			toast.success("School mail settings saved successfully");
			await refreshSchool();
			update({ smtpPassword: "" });
		} finally {
			setSaving(false);
		}
	};

	const sendTest = async () => {
		if (!testEmail.trim()) {
			toast.error("Enter a test recipient email");
			return;
		}
		setTesting(true);
		try {
			await testSchoolMailSettings(testEmail.trim());
			toast.success("Test email sent successfully");
			await refreshSchool();
		} finally {
			setTesting(false);
		}
	};

	const savePlatform = async () => {
		setSavingPlatform(true);
		try {
			await updatePlatformMailSettings({
				...platformForm,
				smtpPort: Number(platformForm.smtpPort || 587),
			});
			toast.success("Platform mail settings saved successfully");
			await refreshPlatform();
			updatePlatform({ smtpPassword: "" });
		} finally {
			setSavingPlatform(false);
		}
	};

	const sendPlatformTest = async () => {
		if (!platformTestEmail.trim()) {
			toast.error("Enter a test recipient email");
			return;
		}
		setTestingPlatform(true);
		try {
			await testPlatformMailSettings(platformTestEmail.trim());
			toast.success("Platform test email sent successfully");
			await refreshPlatform();
		} finally {
			setTestingPlatform(false);
		}
	};

	const toggleStatus = async (isActive: boolean) => {
		setStatusLoading(true);
		try {
			await updateSchoolMailStatus(isActive);
			toast.success(isActive ? "School mail enabled" : "School mail disabled");
			await refreshSchool();
		} finally {
			setStatusLoading(false);
		}
	};

	if (isLoading) return <LoadingState />;

	return (
		<div className="mx-auto max-w-7xl space-y-4">
			<div className="flex flex-col gap-3 @3xl/body:flex-row @3xl/body:items-start @3xl/body:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Mail Settings</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Choose the software sender or configure the school&apos;s own SMTP sender.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button onClick={save} disabled={saving}>
						<Save className="size-4" />
						{saving ? "Saving..." : "Save Settings"}
					</Button>
					{form.mode === "own" ? (
						<ConfirmationModal
							title={schoolConfig?.isActive ? "Disable school mail?" : "Enable school mail?"}
							description={
								schoolConfig?.isActive
									? "New school emails will fall back to the software sender."
									: "School mail will be used only after a successful test verification."
							}
							confirmText={schoolConfig?.isActive ? "Disable" : "Enable"}
							onConfirm={() => toggleStatus(!schoolConfig?.isActive)}
							isLoading={statusLoading}
							variant={schoolConfig?.isActive ? "destructive" : "default"}
						>
							<AlertDialogTrigger asChild>
								<Button variant={schoolConfig?.isActive ? "destructive" : "outline"}>
									{schoolConfig?.isActive ? "Disable School Mail" : "Enable School Mail"}
								</Button>
							</AlertDialogTrigger>
						</ConfirmationModal>
					) : null}
				</div>
			</div>

			<div className="grid gap-4 @3xl/body:grid-cols-3">
				<Card className="rounded-lg">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
						<Mail className="size-4 text-muted-foreground" />
						<p className="font-medium">Active Sender</p>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold">{activeSource}</p>
						<p className="text-muted-foreground mt-1 text-sm">
							Own verified SMTP takes priority only when selected by the school.
						</p>
					</CardContent>
				</Card>
				<Card className="rounded-lg">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<ShieldCheck className="size-4 text-muted-foreground" />
							<p className="font-medium">School Status</p>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline" className={statusTone(schoolConfig)}>
								{schoolConfig?.isActive ? "Active" : "Inactive"}
							</Badge>
							<Badge variant="outline">
								{schoolConfig?.isVerified ? "Verified" : "Not verified"}
							</Badge>
						</div>
						<p className="text-muted-foreground text-sm">
							{schoolConfig?.lastTestError || "Send a test email after credential changes."}
						</p>
					</CardContent>
				</Card>
				<Card className="rounded-lg">
					<CardHeader className="pb-2">
						<p className="font-medium">Platform Fallback</p>
					</CardHeader>
					<CardContent>
						<p className="text-lg font-semibold">
							{platformConfig?.id ? "Configured by software admin" : "Not configured"}
						</p>
						<p className="text-muted-foreground mt-1 text-sm">
							Schools cannot view software credentials.
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="rounded-lg">
				<CardHeader>
					<h2 className="text-lg font-semibold">School Mail Configuration</h2>
					<p className="text-muted-foreground text-sm">
						Use the default software sender or switch to the school&apos;s own SMTP provider.
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-3 @xl/body:grid-cols-2">
						<button
							type="button"
							onClick={() => update({ mode: "system", isActive: false })}
							className={cn(
								"rounded-lg border p-4 text-left transition",
								form.mode !== "own" && "border-primary bg-primary/5",
							)}
						>
							<p className="font-semibold">Use Software Default</p>
							<p className="text-muted-foreground mt-1 text-sm">
								No school SMTP maintenance. Email keeps working when the software sender is verified.
							</p>
							<p className="text-muted-foreground mt-2 text-xs">
								Credential details are hidden from school users.
							</p>
						</button>
						<button
							type="button"
							onClick={() => update({ mode: "own" })}
							className={cn(
								"rounded-lg border p-4 text-left transition",
								form.mode === "own" && "border-primary bg-primary/5",
							)}
						>
							<p className="font-semibold">Use Own SMTP</p>
							<p className="text-muted-foreground mt-1 text-sm">
								Emails go from the school address, but the school must manage credentials and provider limits.
							</p>
							<p className="text-muted-foreground mt-2 text-xs">
								Test verification is required before this sender can be enabled.
							</p>
						</button>
					</div>

					{form.mode === "own" ? (
						<>
							<MailConfigFields
								form={form}
								hasPassword={schoolConfig?.hasPassword}
								onChange={update}
							/>

							<div className="rounded-lg border p-4">
								<h3 className="font-medium">Test Configuration</h3>
								<p className="text-muted-foreground mt-1 text-sm">
									Save first, then send a test email. A successful test verifies the school sender.
								</p>
								<div className="mt-4 flex flex-col gap-3 @xl/body:flex-row">
									<Input
										type="email"
										value={testEmail}
										onChange={(event) => setTestEmail(event.target.value)}
										placeholder="test@example.com"
									/>
									<Button variant="outline" onClick={sendTest} disabled={testing}>
										<Send className="size-4" />
										{testing ? "Sending..." : "Send Test"}
									</Button>
								</div>
							</div>
						</>
					) : (
						<div className="rounded-lg border border-dashed p-4">
							<h3 className="font-medium">Software Default Sender</h3>
							<p className="text-muted-foreground mt-1 text-sm">
								Admissions, payment links, and notifications will use the verified software mail configuration.
								If it is not configured, actions still complete and mail is skipped.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{showSoftwareForPlatformAdmins && isPlatformAdmin ? (
				<Card className="rounded-lg">
					<CardHeader>
						<div className="flex flex-col gap-3 @xl/body:flex-row @xl/body:items-center @xl/body:justify-between">
							<div>
								<h2 className="text-lg font-semibold">Platform Mail Configuration</h2>
								<p className="text-muted-foreground text-sm">
								Default SaaS sender used when schools select software default or own SMTP is disabled.
								</p>
							</div>
							<div className="flex items-center gap-3 rounded-md border px-3 py-2">
								<span className="text-sm">Active fallback</span>
								<Switch
									checked={!!platformForm.isActive}
									onCheckedChange={(checked) => updatePlatform({ isActive: checked })}
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<MailConfigFields
							form={platformForm}
							hasPassword={platformConfig?.hasPassword}
							onChange={updatePlatform}
						/>

						<div className="rounded-lg border p-4">
							<h3 className="font-medium">Test Platform Configuration</h3>
							<p className="text-muted-foreground mt-1 text-sm">
								Use this to verify the SaaS fallback sender.
							</p>
							<div className="mt-4 flex flex-col gap-3 @xl/body:flex-row">
								<Input
									type="email"
									value={platformTestEmail}
									onChange={(event) => setPlatformTestEmail(event.target.value)}
									placeholder="test@example.com"
								/>
								<Button variant="outline" onClick={sendPlatformTest} disabled={testingPlatform}>
									<Send className="size-4" />
									{testingPlatform ? "Sending..." : "Send Test"}
								</Button>
								<Button onClick={savePlatform} disabled={savingPlatform}>
									<Save className="size-4" />
									{savingPlatform ? "Saving..." : "Save Platform"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
