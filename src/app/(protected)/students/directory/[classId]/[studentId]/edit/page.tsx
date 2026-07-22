"use client";

import StudentProfileEditForm from "@/modules/students/profile/components/StudentProfileEditForm";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { getLocalizedName } from "@/shared/utils/localization";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditStudentPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();
	const router = useRouter();
	const params = useParams();

	const classId = params.classId as string;
	const studentId = params.studentId as string;

	const { data: studentResponse, isLoading } = useSWR(`/students/${studentId}`);
	const student = studentResponse?.data;
	const { data: classResponse } = useSWR(`/classes/${classId}`);
	const classData = classResponse?.data;
	const className = classData
		? getLocalizedName(classData.name || classData.enName || classData.bnName, locale)
		: classId;

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_directory"), href: PATHS.STUDENTS.DIRECTORY.ROOT },
			{ label: className, href: `/students/directory/${classId}` },
			{
				label: student?.fullName || "Student Profile",
				href: `/students/directory/${classId}/${studentId}`,
			},
			{ label: "Edit", href: `/students/directory/${classId}/${studentId}/edit` },
		]);
	}, [classId, className, setBreadcrumbs, student, studentId, tNav]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-72" />
					</div>
					<Skeleton className="h-9 w-24" />
				</div>
				<Skeleton className="h-[520px] w-full rounded-xl" />
			</div>
		);
	}

	if (!student) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-lg text-muted-foreground">Student not found.</p>
				<Button asChild variant="outline" className="mt-4 gap-2">
					<Link href={`/students/directory/${classId}`}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
					<p className="text-muted-foreground">
						Update student profile information step by step.
					</p>
				</div>
				<Button asChild variant="outline" className="gap-2">
					<Link href={`/students/directory/${classId}/${studentId}`}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
			</div>

			<StudentProfileEditForm
				studentId={studentId}
				initialData={student}
				onSuccess={() => router.push(`/students/directory/${classId}/${studentId}`)}
			/>
		</div>
	);
}
