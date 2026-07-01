import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { GraduationCap } from "lucide-react";

export function AcademicTab({ teacher }: { teacher: any }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<GraduationCap className="text-muted-foreground h-5 w-5" /> Subjects & Qualifications
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Primary Subject</div>
						<div className="col-span-2 font-medium">{teacher.primarySubjectId || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Specialization</div>
						<div className="col-span-2 font-medium">{teacher.specializationSubjects || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Highest Qualification</div>
						<div className="col-span-2 font-medium">{teacher.highestQualification || "N/A"}</div>
					</div>
				</div>
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Is Hafiz?</div>
						<div className="col-span-2 font-medium">{teacher.isHafiz ? "Yes" : "No"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Qirat Grade</div>
						<div className="col-span-2 font-medium">{teacher.qiratGrade || "N/A"}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
