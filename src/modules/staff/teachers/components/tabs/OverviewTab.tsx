import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { format } from "date-fns";
import { Activity, User } from "lucide-react";

export function OverviewTab({ teacher }: { teacher: any }) {
	const formatDate = (date?: string | null) => {
		if (!date) return "N/A";
		return format(new Date(date), "PPP");
	};

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<User className="text-muted-foreground h-5 w-5" /> Basic Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Full Name</div>
						<div className="col-span-2 font-medium">{teacher.fullName}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Date of Birth</div>
						<div className="col-span-2 font-medium">
							{formatDate(teacher.dateOfBirth)}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Gender</div>
						<div className="col-span-2 font-medium capitalize">
							{teacher.gender || "N/A"}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Blood Group</div>
						<div className="col-span-2 font-medium">{teacher.bloodGroup || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Religion</div>
						<div className="col-span-2 font-medium">{teacher.religion || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Nationality</div>
						<div className="col-span-2 font-medium">{teacher.nationality || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Marital Status</div>
						<div className="col-span-2 font-medium capitalize">
							{teacher.maritalStatus || "N/A"}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Activity className="text-muted-foreground h-5 w-5" /> Additional Identity
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Employee Code</div>
						<div className="bg-muted col-span-2 w-fit rounded p-1 font-mono text-xs font-medium">
							{teacher.employeeCode || "N/A"}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">NID Number</div>
						<div className="col-span-2 font-medium">{teacher.nid || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Birth Certificate No</div>
						<div className="col-span-2 font-medium">
							{teacher.birthCertificateNo || "N/A"}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Passport No</div>
						<div className="col-span-2 font-medium">{teacher.passportNo || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Father&apos;s Name</div>
						<div className="col-span-2 font-medium">{teacher.fatherName || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Mother&apos;s Name</div>
						<div className="col-span-2 font-medium">{teacher.motherName || "N/A"}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
