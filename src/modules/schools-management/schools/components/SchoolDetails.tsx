"use client";

import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { SchoolModel } from "@/shared/models/school.model";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { format } from "date-fns";
import {
	Activity,
	Banknote,
	BookOpen,
	Building,
	Building2,
	CheckCircle2,
	Download,
	Edit,
	FileText,
	Globe,
	Link as LinkIcon,
	MapPin,
	Phone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { SchoolDetailsLocationMap } from "./SchoolDetailsLocationMap";

type Props = {
	school: SchoolModel;
};

export function SchoolDetails({ school }: Props) {
	const t = useTranslations("SchoolsManagement");

	const handleDownloadInvoice = async (paymentId: string) => {
		try {
			await downloadPdf(
				`/superadmin/payments/${paymentId}/invoice`,
				`invoice-${paymentId}.pdf`
			);
		} catch (error) {
			console.error("Failed to download invoice", error);
		}
	};

	const getDaysRemaining = (startsAt: string, expiresAt: string | null) => {
		if (!expiresAt) return { remaining: 100, total: 100, percent: 100, label: "Lifetime" };
		const start = new Date(startsAt).getTime();
		const end = new Date(expiresAt).getTime();
		const now = new Date().getTime();

		const totalDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
		const remainingDays = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
		const percent = Math.min(100, Math.max(0, (remainingDays / totalDays) * 100));

		return {
			remaining: remainingDays,
			total: totalDays,
			percent,
			label: `${remainingDays} days left`,
		};
	};

	return (
		<div className="space-y-6">
			{/* Banner & Logo Header */}
			<div className="bg-card relative mb-8 overflow-hidden rounded-xl border">
				<div className="absolute top-4 right-4 z-10">
					<Button
						asChild
						variant="secondary"
						size="sm"
						className="opacity-90 shadow-md transition-opacity hover:opacity-100"
					>
						<Link href={`/schools-management/schools/${school.id}/edit`}>
							<Edit className="h-4 w-4" />
							{t("editProfile")}
						</Link>
					</Button>
				</div>
				{/* Banner */}
				<div className="bg-muted relative h-64 w-full overflow-hidden">
					{school.bannerUrl ? (
						<ProgressiveImage
							src={school.bannerUrl}
							placeholderBase64={school.bannerPlaceholder}
							alt="Banner"
							fill
							className="object-cover"
						/>
					) : (
						<div className="h-full w-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700" />
					)}
				</div>

				{/* Info Section */}
				<div className="relative px-6 pb-6">
					{/* Logo Avatar Overlay */}
					<div className="border-background bg-card absolute -top-12 left-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-4 shadow-md">
						{school.logoUrl ? (
							<ProgressiveImage
								src={school.logoUrl}
								placeholderBase64={school.logoPlaceholder}
								alt="Logo"
								fill
								className="object-cover"
							/>
						) : (
							<Building2 className="text-primary/40 h-10 w-10" />
						)}
					</div>

					{/* Title & Badges */}
					<div className="flex flex-col justify-between gap-4 pt-14 md:flex-row md:items-center">
						<div>
							<h2 className="text-2xl font-bold">{school.schoolName}</h2>
							{school.schoolNameBn && (
								<p className="text-muted-foreground text-sm">
									{school.schoolNameBn}
								</p>
							)}
							<p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
								<MapPin className="h-4 w-4" />{" "}
								{school.address || "No address provided"}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className="h-7 px-3 text-sm capitalize shadow-sm"
								>
									{school.schoolType?.replace(/_/g, " ")}
								</Badge>
								<Badge
									variant={
										school.status === "active"
											? "default"
											: school.status === "pending"
												? "secondary"
												: "destructive"
									}
									className="h-7 px-3 text-sm capitalize shadow-sm"
								>
									{school.status}
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
					<TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
					<TabsTrigger value="contact">{t("tabContact")}</TabsTrigger>
					<TabsTrigger value="official">{t("tabOfficial")}</TabsTrigger>
					<TabsTrigger value="academic">{t("tabAcademic")}</TabsTrigger>
					<TabsTrigger value="subscription">{t("tabSubscription")}</TabsTrigger>
					<TabsTrigger value="payment">{t("tabPayment")}</TabsTrigger>
					<TabsTrigger value="bankAccounts">{t("tabBankAccounts")}</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="mt-6 space-y-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Activity className="text-muted-foreground h-5 w-5" />{" "}
									{t("systemDetails")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">
										Subdomain/Slug
									</div>
									<div className="col-span-2 font-medium">
										{school.schoolSlug || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">
										Custom Domain
									</div>
									<div className="col-span-2 font-medium">
										{school.customDomain || "Not Enabled"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Created At</div>
									<div className="col-span-2 font-medium">
										{school.createdAt
											? format(new Date(school.createdAt), "PPP p")
											: "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Database ID</div>
									<div className="bg-muted col-span-2 w-fit rounded p-1 font-mono text-xs font-medium">
										{school.id}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<LinkIcon className="text-muted-foreground h-5 w-5" />{" "}
									{t("socialPublicLinks")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Website</div>
									<div className="col-span-2 font-medium">
										{school.website ? (
											<a
												href={school.website}
												target="_blank"
												rel="noreferrer"
												className="text-blue-500 hover:underline"
											>
												{school.website}
											</a>
										) : (
											"N/A"
										)}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Facebook</div>
									<div className="col-span-2 font-medium">
										{school.facebookPage ? (
											<a
												href={school.facebookPage}
												target="_blank"
												rel="noreferrer"
												className="text-blue-500 hover:underline"
											>
												Page Link
											</a>
										) : (
											"N/A"
										)}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">YouTube</div>
									<div className="col-span-2 font-medium">
										{school.youtubeChannel ? (
											<a
												href={school.youtubeChannel}
												target="_blank"
												rel="noreferrer"
												className="text-red-500 hover:underline"
											>
												Channel Link
											</a>
										) : (
											"N/A"
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Contact Tab */}
				<TabsContent value="contact" className="mt-6 space-y-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Phone className="text-muted-foreground h-5 w-5" />{" "}
									{t("contactInformation")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Email</div>
									<div className="col-span-2 font-medium">
										{school.contactEmail || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">
										Primary Phone
									</div>
									<div className="col-span-2 font-medium">
										{school.contactPhone || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Alt Phone</div>
									<div className="col-span-2 font-medium">
										{school.alternatePhone || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Admin User</div>
									<div className="col-span-2 font-medium">
										{school.adminUserName || "N/A"}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Globe className="text-muted-foreground h-5 w-5" />{" "}
									{t("locationDetails")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Division</div>
									<div className="col-span-2 font-medium">
										{school.divisionName ? `${school.divisionName}` : "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">District</div>
									<div className="col-span-2 font-medium">
										{school.districtName ? `${school.districtName}` : "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Upazila</div>
									<div className="col-span-2 font-medium">
										{school.upazilaName ? `${school.upazilaName}` : "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Post Code</div>
									<div className="col-span-2 font-medium">
										{school.postCode || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Latitude</div>
									<div className="col-span-2 font-medium">
										{school.latitude ?? "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Longitude</div>
									<div className="col-span-2 font-medium">
										{school.longitude ?? "N/A"}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<SchoolDetailsLocationMap
						latitude={school.latitude}
						longitude={school.longitude}
					/>
				</TabsContent>

				{/* Official Info Tab */}
				<TabsContent value="official" className="mt-6 space-y-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<FileText className="text-muted-foreground h-5 w-5" />{" "}
									{t("registrationIds")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">EIIN</div>
									<div className="col-span-2 font-medium">
										{school.eiin || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">
										Registration No
									</div>
									<div className="col-span-2 font-medium">
										{school.registrationNo || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">BANBEIS</div>
									<div className="col-span-2 font-medium">
										{school.banbeis || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Established</div>
									<div className="col-span-2 font-medium">
										{school.establishedYear || "N/A"}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Building className="text-muted-foreground h-5 w-5" />{" "}
									{t("governanceRecognition")}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">MPO Status</div>
									<div className="col-span-2 font-medium">
										{school.mpoStatus ? "Yes" : "No"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">
										Gov. Body Type
									</div>
									<div className="col-span-2 font-medium capitalize">
										{school.governingBodyType?.replace(/_/g, " ") || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">Recognition</div>
									<div className="col-span-2 font-medium capitalize">
										{school.recognitionStatus?.replace(/_/g, " ") || "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-muted-foreground text-sm">
										Affiliation Board
									</div>
									<div className="col-span-2 font-medium">
										{school.affiliationBoard || "N/A"}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Academics Tab */}
				<TabsContent value="academic" className="mt-6 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5" /> {t("academicStructure")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
								<div className="space-y-4">
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">Medium</div>
										<div className="col-span-2 font-medium capitalize">
											{school.medium || "N/A"}
										</div>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">Shift</div>
										<div className="col-span-2 font-medium capitalize">
											{school.shift || "N/A"}
										</div>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">Levels</div>
										<div className="col-span-2 font-medium capitalize">
											{school.educationLevel?.length
												? school.educationLevel
														.map((l) => l.replace(/_/g, " "))
														.join(", ")
												: "N/A"}
										</div>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">
											Head Teacher
										</div>
										<div className="col-span-2 font-medium">
											{school.headTeacherTitle || "N/A"}
										</div>
									</div>
								</div>
								<div className="space-y-4">
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">
											Total Capacity
										</div>
										<div className="col-span-2 font-medium">
											{school.totalStudentCapacity || "N/A"}
										</div>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">
											Total Rooms
										</div>
										<div className="col-span-2 font-medium">
											{school.totalRooms || "N/A"}
										</div>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">Hostel</div>
										<div className="col-span-2 font-medium">
											{school.hasHostel
												? `Yes (Capacity: ${school.hostelCapacity || 0})`
												: "No"}
										</div>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-muted-foreground text-sm">
											Permanent Campus
										</div>
										<div className="col-span-2 font-medium">
											{school.hasPermanentCampus ? "Yes" : "No"}
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Subscription Tab */}
				<TabsContent value="subscription" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>{t("subscriptionInformation")}</CardTitle>
							<CardDescription>{t("subscriptionInformationDescription")}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="bg-muted/30 rounded-lg border p-4">
								<h3 className="mb-4 flex items-center gap-2 font-semibold">
									<CheckCircle2 className="h-5 w-5 text-green-500" /> Current
									Package
								</h3>
								<div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
									<div>
										<div className="text-muted-foreground text-sm">
											Active Subscription ID
										</div>
										<div className="mb-4 font-mono text-sm font-medium">
											{school.activeSubscriptionId || "None"}
										</div>
										{school.subscriptions && school.subscriptions[0] && (
											<>
												<div className="text-muted-foreground text-sm">
													Plan Name
												</div>
												<div className="mb-4 font-medium">
													{school.subscriptions[0].plan?.name || "N/A"}
												</div>
												<div className="text-muted-foreground text-sm">
													Valid Until
												</div>
												<div className="font-medium">
													{school.subscriptions[0].expiresAt
														? format(
																new Date(
																	school.subscriptions[0]
																		.expiresAt
																),
																"PPP"
															)
														: "Lifetime"}
												</div>
											</>
										)}
									</div>
									<div className="flex justify-center md:justify-end">
										{school.subscriptions && school.subscriptions[0] && (
											<div className="relative flex items-center justify-center">
												<RadialBarChart
													width={180}
													height={180}
													cx={90}
													cy={90}
													innerRadius={60}
													outerRadius={80}
													barSize={10}
													data={[
														{
															name: "Remaining",
															value: getDaysRemaining(
																school.subscriptions[0].startsAt,
																school.subscriptions[0].expiresAt
															).percent,
															fill: "#2563eb",
														},
													]}
													startAngle={90}
													endAngle={-270}
												>
													<PolarAngleAxis
														type="number"
														domain={[0, 100]}
														angleAxisId={0}
														tick={false}
													/>
													<RadialBar
														background
														dataKey="value"
														cornerRadius={5}
													/>
												</RadialBarChart>
												<div className="absolute flex flex-col items-center justify-center text-center">
													<span className="text-primary text-2xl font-bold">
														{getDaysRemaining(
															school.subscriptions[0].startsAt,
															school.subscriptions[0].expiresAt
														).percent.toFixed(0)}
														%
													</span>
													<span className="text-muted-foreground text-xs">
														{
															getDaysRemaining(
																school.subscriptions[0].startsAt,
																school.subscriptions[0].expiresAt
															).label
														}
													</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<h4 className="text-muted-foreground text-sm font-semibold">
									Subscription History
								</h4>
								{school.subscriptions && school.subscriptions.length > 0 ? (
									<div className="grid gap-4">
										{school.subscriptions.map((sub: any) => (
											<div
												key={sub.id}
												className="flex flex-col justify-between rounded-lg border p-4 md:flex-row md:items-center"
											>
												<div>
													<div className="font-medium">
														Plan: {sub.plan?.name || sub.planId}
													</div>
													<div className="text-muted-foreground text-sm">
														{format(new Date(sub.startsAt), "PPP")} -{" "}
														{sub.expiresAt
															? format(new Date(sub.expiresAt), "PPP")
															: "Lifetime"}
													</div>
												</div>
												<Badge
													variant={
														sub.status === "active"
															? "default"
															: "secondary"
													}
													className="mt-2 capitalize md:mt-0"
												>
													{sub.status}
												</Badge>
											</div>
										))}
									</div>
								) : (
									<div className="text-muted-foreground text-sm italic">
										No subscription history found.
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Payment Tab */}
				<TabsContent value="payment" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Banknote className="h-5 w-5" /> {t("paymentHistory")}
							</CardTitle>
							<CardDescription>{t("paymentHistoryDescription")}</CardDescription>
						</CardHeader>
						<CardContent>
							{school.payments && school.payments.length > 0 ? (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t("date")}</TableHead>
												<TableHead>{t("plan")}</TableHead>
												<TableHead>{t("amount")}</TableHead>
												<TableHead>{t("trxId")}</TableHead>
												<TableHead>{t("invId")}</TableHead>
												<TableHead>{t("status")}</TableHead>
												<TableHead className="text-right">
													{t("actions")}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{school.payments.map((payment: any) => (
												<TableRow key={payment.id}>
													<TableCell>
														{format(new Date(payment.createdAt), "PPP")}
													</TableCell>
													<TableCell>
														{payment.subscription?.plan?.name ||
															"N/A"}
													</TableCell>
													<TableCell className="font-medium">
														{payment.amount} {payment.currency}
														<div className="text-muted-foreground text-xs uppercase">
															{payment.paymentMethod}
														</div>
													</TableCell>
													<TableCell className="text-muted-foreground font-mono text-xs">
														{payment.transactionId || "N/A"}
													</TableCell>
													<TableCell className="font-mono text-xs">
														{payment.invoiceId || "N/A"}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																payment.status === "completed"
																	? "default"
																	: payment.status === "failed"
																		? "destructive"
																		: "secondary"
															}
															className="capitalize"
														>
															{payment.status}
														</Badge>
													</TableCell>
													<TableCell className="text-right">
														<Button
															variant="ghost"
															size="icon"
															onClick={() =>
																handleDownloadInvoice(payment.id)
															}
															title="Download Invoice"
														>
															<Download className="h-4 w-4" />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							) : (
								<div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
									No payment history available.
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Bank Accounts Tab */}
				<TabsContent value="bankAccounts" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Banknote className="h-5 w-5" /> {t("bankAccounts")}
							</CardTitle>
							<CardDescription>{t("bankAccountsDescription")}</CardDescription>
						</CardHeader>
						<CardContent>
							{school.bankAccounts.length > 0 ? (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t("accountLabel")}</TableHead>
												<TableHead>{t("bankInformation")}</TableHead>
												<TableHead>{t("accountDetails")}</TableHead>
												<TableHead>{t("mobileBanking")}</TableHead>
												<TableHead>{t("status")}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{school.bankAccounts.map((account: any) => (
												<TableRow key={account.id}>
													<TableCell>
														<div className="font-medium">
															{account.accountLabel}
														</div>
														<div className="text-muted-foreground text-xs capitalize">
															{account.accountPurpose?.replace(/_/g, " ")}
														</div>
													</TableCell>
													<TableCell>
														<div className="font-medium">
															{account.bankName}
														</div>
														<div className="text-muted-foreground text-xs">
															{account.bankBranch || "N/A"}
														</div>
													</TableCell>
													<TableCell>
														<div className="bg-muted w-fit rounded p-2 font-mono text-xs">
															<div>A/C: {account.accountNo}</div>
															<div className="text-muted-foreground mt-1">
																RTN: {account.bankRoutingNo || "N/A"}
															</div>
														</div>
														<div className="mt-2 text-sm">
															{account.accountName}
														</div>
													</TableCell>
													<TableCell>
														{account.mobileBankingProvider ||
														account.mobileBankingNo ? (
															<div>
																<div className="font-medium">
																	{account.mobileBankingProvider ||
																		"N/A"}
																</div>
																<div className="text-muted-foreground text-xs">
																	{account.mobileBankingNo ||
																		"N/A"}
																</div>
															</div>
														) : (
															<span className="text-muted-foreground">
																N/A
															</span>
														)}
													</TableCell>
													<TableCell>
														<div className="flex flex-wrap gap-2">
															<Badge
																variant={
																	account.isActive
																		? "default"
																		: "secondary"
																}
															>
																{account.isActive ? "Active" : "Inactive"}
															</Badge>
															{account.isPrimary && (
																<Badge variant="outline">
																	Primary
																</Badge>
															)}
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							) : (
								<div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
									{t("noBankAccounts")}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
