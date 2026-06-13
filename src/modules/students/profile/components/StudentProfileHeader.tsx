"use client";

import Image from "@/shared/components/custom/Image";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Edit, Mail, Phone, Printer } from "lucide-react";
import { useTranslations } from "next-intl";

interface StudentProfileHeaderProps {
	student: any;
}

export default function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
	const t = useTranslations("StudentProfile");

	return (
		<Card className="overflow-hidden py-0">
			<div className="from-primary/80 to-primary h-48 w-full bg-gradient-to-r">
				<Image
					src="/images/avatar-cover.png"
					alt="banner"
					width={1280}
					height={200}
					className="h-full w-full object-cover"
				/>
			</div>
			<CardContent className="relative px-6 pt-0 pb-6 sm:px-10">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
					<div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
						<Avatar className="ring-primary bg-muted -mt-12 h-28 w-28 rounded-full border-4 ring-4 sm:-mt-16 sm:h-32 sm:w-32">
							<AvatarImage
								src={student.photoUrl || "/images/avatar.png"}
								alt={student.fullName}
							/>
							<AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
								{student.fullName?.charAt(0) || "S"}
							</AvatarFallback>
						</Avatar>

						<div className="mt-4 text-center sm:mt-0 sm:pb-4 sm:text-left">
							<div className="flex items-center justify-center gap-2 sm:justify-start">
								<h1 className="text-2xl font-bold tracking-tight">
									{student.fullName}
								</h1>
								<Badge
									variant={student.status === "ACTIVE" ? "default" : "secondary"}
								>
									{student.status || "ACTIVE"}
								</Badge>
							</div>
							<p className="text-muted-foreground mt-1 text-sm font-medium">
								ID: {student.studentId} • Class {student.class} ({student.section})
								• Roll: {student.roll}
							</p>
							<div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
								{student.mobile && (
									<div className="flex items-center gap-1">
										<Phone className="h-3.5 w-3.5" />
										<span>{student.mobile}</span>
									</div>
								)}
								{student.email && (
									<div className="flex items-center gap-1">
										<Mail className="h-3.5 w-3.5" />
										<span>{student.email}</span>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="mt-6 flex items-center justify-center gap-3 sm:mt-0 sm:pb-4">
						<Button variant="outline" size="sm" className="gap-2">
							<Printer className="h-4 w-4" />
							{t("print")}
						</Button>
						<Button size="sm" className="gap-2">
							<Edit className="h-4 w-4" />
							{t("editProfile")}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
