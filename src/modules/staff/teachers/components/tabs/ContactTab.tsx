import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { MapPin, Phone } from "lucide-react";

export function ContactTab({ teacher }: { teacher: any }) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Phone className="text-muted-foreground h-5 w-5" /> Contact Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Phone Number</div>
						<div className="col-span-2 font-medium">{teacher.phone || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Alternate Phone</div>
						<div className="col-span-2 font-medium">{teacher.alternatePhone || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Email Address</div>
						<div className="col-span-2 font-medium">{teacher.email || "N/A"}</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<MapPin className="text-muted-foreground h-5 w-5" /> Location Details
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Post Code</div>
						<div className="col-span-2 font-medium">{teacher.postCode || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Present Address</div>
						<div className="col-span-2 font-medium">{teacher.address || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Permanent Address</div>
						<div className="col-span-2 font-medium">{teacher.permanentAddress || "N/A"}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
