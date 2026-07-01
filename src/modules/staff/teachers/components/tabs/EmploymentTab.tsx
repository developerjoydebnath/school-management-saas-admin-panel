import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { format } from "date-fns";
import { Briefcase } from "lucide-react";

export function EmploymentTab({ teacher }: { teacher: any }) {
	const formatDate = (date?: string | null) => {
		if (!date) return "N/A";
		return format(new Date(date), "PPP");
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Briefcase className="text-muted-foreground h-5 w-5" /> Employment Details
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Designation</div>
						<div className="col-span-2 font-medium">{teacher.designation?.name || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Department</div>
						<div className="col-span-2 font-medium">{teacher.department?.name || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Employment Type</div>
						<div className="col-span-2 font-medium capitalize">
							{teacher.employmentType?.replace(/_/g, " ") || "N/A"}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Joining Date</div>
						<div className="col-span-2 font-medium">{formatDate(teacher.joiningDate)}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Confirmation Date</div>
						<div className="col-span-2 font-medium">{formatDate(teacher.confirmationDate)}</div>
					</div>
				</div>
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Salary Grade</div>
						<div className="col-span-2 font-medium">{teacher.salaryGrade || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Basic Salary</div>
						<div className="col-span-2 font-medium">
							{teacher.basicSalary ? `৳${teacher.basicSalary}` : "N/A"}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">BANBEIS Teacher ID</div>
						<div className="col-span-2 font-medium">{teacher.banbeisTeacherId || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Years of Experience</div>
						<div className="col-span-2 font-medium">{teacher.yearsOfExperience || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Previous Institution</div>
						<div className="col-span-2 font-medium">{teacher.previousInstitution || "N/A"}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
