"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Bus, Library, MapPin } from "lucide-react";

const libraryBooks = [
	{
		title: "Introduction to Physics",
		issueDate: "Apr 05, 2026",
		dueDate: "May 05, 2026",
		status: "Issued",
	},
	{
		title: "Bangla Sahitya Vol. 2",
		issueDate: "Mar 15, 2026",
		dueDate: "Apr 15, 2026",
		status: "Returned",
	},
];

export function TransportLibraryInfo() {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			{/* Transport Info */}
			<Card className="gap-2">
				<CardHeader className="border-b pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Bus className="text-muted-foreground h-4 w-4" />
						Transport
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Route</span>
						<span className="font-medium">Route 3 — Mirpur</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Bus No.</span>
						<span className="font-medium">BUS-007</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Stop</span>
						<div className="flex items-center gap-1 font-medium">
							<MapPin className="h-3 w-3" />
							Mirpur-10 Circle
						</div>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Pickup</span>
						<span className="font-medium">7:15 AM</span>
					</div>
				</CardContent>
			</Card>

			{/* Library Books */}
			<Card className="gap-2">
				<CardHeader className="border-b">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Library className="text-muted-foreground h-4 w-4" />
						Library Books
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{libraryBooks.map((book, i) => (
						<div key={i} className="rounded-lg border p-2.5">
							<p className="text-sm font-medium">{book.title}</p>
							<div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
								<span>Due: {book.dueDate}</span>
								<Badge
									variant={
										book.status === "Issued"
											? "secondary"
											: "default"
									}
									className="text-[10px]"
								>
									{book.status}
								</Badge>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
