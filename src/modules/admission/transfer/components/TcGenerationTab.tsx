"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useSWR } from "@/shared/hooks/use-swr";
import { Loader2, Printer, FileOutput } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TcPrintTemplate from "./TcPrintTemplate";

export default function TcGenerationTab() {
	const { data: students, isLoading } = useSWR("/students");
	
	const [selectedStudentId, setSelectedStudentId] = useState<string>("");
	const [reason, setReason] = useState<string>("Parent's Transfer");
	const [conduct, setConduct] = useState<string>("Good");
	const [duesCleared, setDuesCleared] = useState(false);
	const [libraryCleared, setLibraryCleared] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);

	const activeStudents = students?.filter((s: any) => s.status !== "Transferred" && s.status !== "Rejected") || [];
	const selectedStudent = activeStudents.find((s: any) => s.id === selectedStudentId);

	const allCleared = duesCleared && libraryCleared;

	const handleGenerateTc = () => {
		if (!selectedStudent) return;
		if (!allCleared) {
			toast.error("Please clear all dues before generating the TC.");
			return;
		}

		setIsPrinting(true);
		
		// In a real app, you would make an API call here to change the student's status to 'Transferred'
		// and save the TC record to the database.
		toast.success(`Transfer Certificate generated for ${selectedStudent.fullName}.`);
		
		setTimeout(() => {
			window.print();
			setIsPrinting(false);
		}, 500);
	};

	return (
		<div className="w-full">
			{/* Screen UI - Hidden on Print */}
			<div className="print:hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold mb-2">Select Student</h3>
						{isLoading ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading students...
							</div>
						) : (
							<Select value={selectedStudentId} onValueChange={(val) => val && setSelectedStudentId(val)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Search and select a student..." />
								</SelectTrigger>
								<SelectContent>
									{activeStudents.map((student: any) => (
										<SelectItem key={student.id} value={student.id}>
											{student.studentId} - {student.fullName} (Class {student.class})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{selectedStudent && (
						<>
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Clearance Checklist</h3>
								<div className="flex items-center space-x-2">
									<Checkbox 
										id="dues" 
										checked={duesCleared} 
										onCheckedChange={(c) => setDuesCleared(c as boolean)} 
									/>
									<Label htmlFor="dues" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										All Tuition & Fees Cleared
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox 
										id="library" 
										checked={libraryCleared} 
										onCheckedChange={(c) => setLibraryCleared(c as boolean)} 
									/>
									<Label htmlFor="library" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										Library Books Returned
									</Label>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="text-lg font-semibold">TC Details</h3>
								<div className="space-y-2">
									<Label>Reason for Leaving</Label>
									<Textarea 
										value={reason} 
										onChange={(e) => setReason(e.target.value)} 
										placeholder="e.g. Parent's transfer, completing highest class, etc." 
									/>
								</div>
								<div className="space-y-2">
									<Label>Conduct & Character</Label>
									<Select value={conduct} onValueChange={(val) => val && setConduct(val)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Excellent">Excellent</SelectItem>
											<SelectItem value="Very Good">Very Good</SelectItem>
											<SelectItem value="Good">Good</SelectItem>
											<SelectItem value="Satisfactory">Satisfactory</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<Button 
								className="w-full mt-4 gap-2" 
								onClick={handleGenerateTc} 
								disabled={!allCleared || isPrinting}
							>
								<Printer className="h-4 w-4" />
								{isPrinting ? "Generating..." : "Generate & Print Transfer Certificate"}
							</Button>
						</>
					)}
				</div>

				<div className="bg-muted/30 rounded-xl border p-4 flex items-center justify-center min-h-[500px]">
					{selectedStudent ? (
						<div className="w-[80%] max-w-[400px] bg-white border shadow-sm p-4 text-[10px] transform scale-90 origin-top">
							{/* Mini Preview */}
							<div className="text-center font-bold text-sm mb-4">Transfer Certificate Preview</div>
							<div className="space-y-2 text-slate-700">
								<p><strong>Name:</strong> {selectedStudent.fullName}</p>
								<p><strong>Father's Name:</strong> {selectedStudent.fatherName}</p>
								<p><strong>Class:</strong> {selectedStudent.class}</p>
								<p><strong>Reason:</strong> {reason}</p>
								<p><strong>Conduct:</strong> {conduct}</p>
							</div>
							<div className="mt-8 pt-4 border-t text-center text-slate-400">Official formatting applied on print</div>
						</div>
					) : (
						<div className="text-muted-foreground flex flex-col items-center">
							<FileOutput className="h-12 w-12 mb-4 opacity-20" />
							<p>Select a student to generate TC</p>
						</div>
					)}
				</div>
			</div>

			{/* Print-only View */}
			<div className="hidden print:block w-full h-full m-0 p-0">
				{selectedStudent && isPrinting && (
					<TcPrintTemplate 
						student={selectedStudent} 
						reason={reason} 
						conduct={conduct} 
					/>
				)}
			</div>
		</div>
	);
}
