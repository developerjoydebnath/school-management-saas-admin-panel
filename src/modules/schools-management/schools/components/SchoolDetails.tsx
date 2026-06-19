"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { format } from "date-fns";
import { Activity, Banknote, BookOpen, Building2, CheckCircle2, History, MapPin, Phone, ShieldAlert, User, Users } from "lucide-react";
import { SchoolModel } from "../../models/school.model";

type Props = {
	school: SchoolModel;
};

export function SchoolDetails({ school }: Props) {
	return (
		<div className="space-y-6">
			{/* Header Summary */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Building2 className="h-8 w-8" />
					</div>
					<div>
						<h2 className="text-2xl font-bold">{school.schoolName}</h2>
						<p className="text-muted-foreground flex items-center gap-2">
							<MapPin className="h-4 w-4" /> {school.address || "No address provided"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant={
							school.status === "active"
								? "default"
								: school.status === "pending"
									? "secondary"
									: "destructive"
						}
						className="text-sm px-3 py-1 capitalize"
					>
						{school.status}
					</Badge>
					<Badge variant="outline" className="text-sm px-3 py-1 capitalize">
						{school.schoolType.replace("_", " ")}
					</Badge>
				</div>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="subscription">Subscription</TabsTrigger>
					<TabsTrigger value="payment">Payment</TabsTrigger>
					<TabsTrigger value="academics">Academics</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="mt-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<User className="h-5 w-5 text-muted-foreground" /> Contact Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-sm text-muted-foreground">Contact Person</div>
									<div className="col-span-2 font-medium">{school.contactPersonName || "N/A"}</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-sm text-muted-foreground">Email</div>
									<div className="col-span-2 font-medium">{school.contactEmail || "N/A"}</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-sm text-muted-foreground">Phone</div>
									<div className="col-span-2 font-medium">{school.contactPhone || "N/A"}</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Activity className="h-5 w-5 text-muted-foreground" /> System Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-4">
									<div className="text-sm text-muted-foreground">Subdomain/Slug</div>
									<div className="col-span-2 font-medium">{school.schoolSlug || "N/A"}</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-sm text-muted-foreground">Created At</div>
									<div className="col-span-2 font-medium">
										{school.createdAt ? format(new Date(school.createdAt), "PPP p") : "N/A"}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-sm text-muted-foreground">Database ID</div>
									<div className="col-span-2 font-medium text-xs font-mono bg-muted p-1 rounded w-fit">
										{school.id}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Subscription Tab */}
				<TabsContent value="subscription" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Subscription Information</CardTitle>
							<CardDescription>Current active package and historical subscriptions.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="rounded-lg border p-4 bg-muted/30">
								<h3 className="font-semibold mb-4 flex items-center gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500" /> Current Package
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div>
										<div className="text-sm text-muted-foreground">Plan Name</div>
										<div className="font-medium text-lg">Premium Annual</div>
									</div>
									<div>
										<div className="text-sm text-muted-foreground">Status</div>
										<Badge variant="default">Active</Badge>
									</div>
									<div>
										<div className="text-sm text-muted-foreground">Expires On</div>
										<div className="font-medium">Dec 31, 2026</div>
									</div>
									<div>
										<div className="text-sm text-muted-foreground">Student Limit</div>
										<div className="font-medium">Up to 2,000</div>
									</div>
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-4 flex items-center gap-2">
									<History className="h-5 w-5 text-muted-foreground" /> Subscription History
								</h3>
								<div className="space-y-4">
									{[1, 2].map((i) => (
										<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
											<div>
												<div className="font-medium">Basic Monthly</div>
												<div className="text-sm text-muted-foreground">
													Jan 01, 2025 - Dec 31, 2025
												</div>
											</div>
											<Badge variant="secondary">Expired</Badge>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Payment Tab */}
				<TabsContent value="payment" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Banknote className="h-5 w-5" /> Payment History
							</CardTitle>
							<CardDescription>Invoices and payment records for this school.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[
									{ id: "INV-2026-001", amount: "BDT 50,000", date: "Jan 01, 2026", status: "Paid" },
									{ id: "INV-2025-012", amount: "BDT 25,000", date: "Jul 01, 2025", status: "Paid" },
									{ id: "INV-2025-001", amount: "BDT 25,000", date: "Jan 01, 2025", status: "Paid" },
								].map((inv) => (
									<div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
										<div className="flex items-center gap-4">
											<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
												<Banknote className="h-5 w-5" />
											</div>
											<div>
												<div className="font-medium">{inv.id}</div>
												<div className="text-sm text-muted-foreground">{inv.date}</div>
											</div>
										</div>
										<div className="flex items-center gap-6">
											<div className="font-semibold">{inv.amount}</div>
											<Badge variant="default">{inv.status}</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Academics Tab */}
				<TabsContent value="academics" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5" /> Academic Overview
							</CardTitle>
							<CardDescription>Demo data representing the school's internal academic volume.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Card className="bg-primary/5 border-primary/20">
									<CardContent className="p-6 flex flex-col items-center justify-center text-center">
										<Users className="h-10 w-10 text-primary mb-4" />
										<div className="text-3xl font-bold text-primary">1,452</div>
										<div className="text-sm text-muted-foreground mt-1">Total Students</div>
									</CardContent>
								</Card>
								<Card className="bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10">
									<CardContent className="p-6 flex flex-col items-center justify-center text-center">
										<User className="h-10 w-10 text-blue-500 mb-4" />
										<div className="text-3xl font-bold text-blue-500">84</div>
										<div className="text-sm text-muted-foreground mt-1">Teachers</div>
									</CardContent>
								</Card>
								<Card className="bg-orange-500/5 border-orange-500/20 dark:bg-orange-500/10">
									<CardContent className="p-6 flex flex-col items-center justify-center text-center">
										<ShieldAlert className="h-10 w-10 text-orange-500 mb-4" />
										<div className="text-3xl font-bold text-orange-500">22</div>
										<div className="text-sm text-muted-foreground mt-1">Support Staff</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
