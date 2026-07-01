import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { format } from "date-fns";
import { BookOpen, Building2, CheckCircle2 } from "lucide-react";

type Props = {
	teacher: any;
	getDocumentUrl: (url: string) => string;
	onViewDocument: (url: string, name: string) => void;
};

export function MpoTab({ teacher, getDocumentUrl, onViewDocument }: Props) {
	const formatDate = (date?: string | null) => {
		if (!date) return "N/A";
		return format(new Date(date), "PPP");
	};

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Building2 className="text-muted-foreground h-5 w-5" /> MPO Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">MPO Listed</div>
						<div className="col-span-2 font-medium">
							{teacher.isMpoListed ? (
								<Badge variant="default" className="h-6">Yes</Badge>
							) : (
								<Badge variant="secondary" className="h-6">No</Badge>
							)}
						</div>
					</div>
					{teacher.isMpoListed && (
						<>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">MPO Index No</div>
								<div className="col-span-2 font-medium">{teacher.mpoIndexNo || "N/A"}</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">MPO Category</div>
								<div className="col-span-2 font-medium">{teacher.mpoCategory || "N/A"}</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">MPO Included Date</div>
								<div className="col-span-2 font-medium">{formatDate(teacher.mpoIncludedAt)}</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<CheckCircle2 className="text-muted-foreground h-5 w-5" /> NTRCA Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">NTRCA Registered</div>
						<div className="col-span-2 font-medium">
							{teacher.ntrcaRegistered ? (
								<Badge variant="default" className="h-6">Yes</Badge>
							) : (
								<Badge variant="secondary" className="h-6">No</Badge>
							)}
						</div>
					</div>
					{teacher.ntrcaRegistered && (
						<>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">Registration No</div>
								<div className="col-span-2 font-medium">{teacher.ntrcaRegNo || "N/A"}</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">Registration Year</div>
								<div className="col-span-2 font-medium">{teacher.ntrcaRegYear || "N/A"}</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">Subject</div>
								<div className="col-span-2 font-medium">{teacher.ntrcaSubject || "N/A"}</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-muted-foreground text-sm">Certificate URL</div>
								<div className="col-span-2 font-medium">
									{teacher.ntrcaCertificateUrl ? (
										<button
											onClick={() => {
												onViewDocument(getDocumentUrl(teacher.ntrcaCertificateUrl), "NTRCA Certificate");
											}}
											className="text-blue-500 hover:underline flex items-center gap-1"
										>
											<BookOpen className="h-4 w-4" /> View Certificate
										</button>
									) : (
										"N/A"
									)}
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
