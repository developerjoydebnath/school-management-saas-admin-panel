"use client";

import StudentProfileHeader from "@/modules/students/profile/components/StudentProfileHeader";
import AcademicsTab from "@/modules/students/profile/components/tabs/AcademicsTab";
import AttendanceTab from "@/modules/students/profile/components/tabs/AttendanceTab";
import DocumentsTab from "@/modules/students/profile/components/tabs/DocumentsTab";
import FeesTab from "@/modules/students/profile/components/tabs/FeesTab";
import ProfileOverviewTab from "@/modules/students/profile/components/tabs/ProfileOverviewTab";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function StudentProfilePage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StudentProfile");
	const locale = useLocale();
	const params = useParams();

	const classId = params.classId as string;
	const studentId = params.studentId as string;

	const { data: student, isLoading } = useSWR(`/students/${studentId}`);
	const { data: classData } = useSWR(`/classes/${classId}`);
	const className = classData ? getLocalizedName(classData.name, locale) : classId;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_directory"), href: PATHS.STUDENTS.DIRECTORY.ROOT },
			{ label: className, href: `/students/directory/${classId}` },
			{
				label: student?.fullName || t("title"),
				href: `/students/directory/${classId}/${studentId}`,
			},
		]);
	}, [setBreadcrumbs, tNav, className, classId, studentId, student, t]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-60 w-full rounded-xl" />
				<Skeleton className="h-10 w-72" />
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Skeleton className="col-span-2 h-96 rounded-xl" />
					<Skeleton className="h-96 rounded-xl" />
				</div>
			</div>
		);
	}

	if (!student) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-muted-foreground text-lg">{t("notFound")}</p>
				<Link href={`/students/directory/${classId}`}>
					<Button variant="outline" className="mt-4 gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<StudentProfileHeader student={student} />

			<Tabs defaultValue="overview">
				<TabsList variant="line" className="w-full sm:w-auto">
					<TabsTrigger value="overview">{t("overview")}</TabsTrigger>
					<TabsTrigger value="academics">{t("academics")}</TabsTrigger>
					<TabsTrigger value="attendance">{t("attendance")}</TabsTrigger>
					<TabsTrigger value="fees">{t("fees")}</TabsTrigger>
					<TabsTrigger value="documents">{t("documents")}</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<ProfileOverviewTab student={student} />
				</TabsContent>

				<TabsContent value="academics" className="mt-6">
					<AcademicsTab />
				</TabsContent>

				<TabsContent value="attendance" className="mt-6">
					<AttendanceTab />
				</TabsContent>

				<TabsContent value="fees" className="mt-6">
					<FeesTab />
				</TabsContent>

				<TabsContent value="documents" className="mt-6">
					<DocumentsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
