"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Award, Download } from "lucide-react";

const certificatesAwards = [
	{ name: "Math Olympiad – Gold Medal", date: "Mar 2026", category: "Competition", issuer: "National Math Society" },
	{ name: "Science Fair – 1st Prize", date: "Nov 2025", category: "Competition", issuer: "District Science Council" },
	{ name: "Best Student Award 2025", date: "Dec 2025", category: "Award", issuer: "NEXA School" },
	{ name: "Sports Day – 100m Sprint", date: "Jan 2026", category: "Sports", issuer: "School Athletics" },
	{ name: "Art Exhibition Certificate", date: "Feb 2026", category: "Cultural", issuer: "School Art Club" },
	{ name: "Perfect Attendance (Sep)", date: "Sep 2025", category: "Award", issuer: "NEXA School" },
];

const categoryColors: Record<string, string> = {
	Competition: "bg-blue-500/10 text-blue-700",
	Award: "bg-green-500/10 text-green-700",
	Sports: "bg-orange-500/10 text-orange-700",
	Cultural: "bg-purple-500/10 text-purple-700",
};

export function AwardsCertificatesGrid() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Award className="h-4 w-4 text-muted-foreground" />
					Certificates & Awards ({certificatesAwards.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{certificatesAwards.map((cert) => (
						<div key={cert.name} className="group flex items-start gap-3 rounded-xl border p-3 transition-all hover:bg-muted/50 hover:shadow-sm">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Award className="h-5 w-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium leading-tight">{cert.name}</p>
								<p className="mt-0.5 text-xs text-muted-foreground">{cert.issuer}</p>
								<div className="mt-1.5 flex items-center gap-2">
									<span className="text-[10px] text-muted-foreground">{cert.date}</span>
									<Badge variant="outline" className={`text-[10px] ${categoryColors[cert.category] || ""}`}>
										{cert.category}
									</Badge>
								</div>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
								<Download className="h-3.5 w-3.5" />
							</Button>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
