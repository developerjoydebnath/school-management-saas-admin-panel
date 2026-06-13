"use client";

import { useSWR } from "@/shared/hooks/use-swr";
import { useState } from "react";
import StudentSearchForm from "./StudentSearchForm";
import StudentSearchResults from "./StudentSearchResults";
import QrBarcodeScannerModal from "@/shared/components/custom/QrBarcodeScannerModal";

export default function StudentSearchContainer() {
	const [searchQuery, setSearchQuery] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	
	// Fetch all students for frontend filtering
	const { data: allStudents, isLoading: isStudentsLoading } = useSWR("students");

	// Fetch classes for mapping class names
	const { data: classes } = useSWR("classes");

	const handleSearch = (query: string) => {
		if (!query.trim()) {
			setHasSearched(false);
			setSearchQuery("");
			return;
		}
		setSearchQuery(query);
		setHasSearched(true);
	};

	const handleClear = () => {
		setQueryState("");
		setHasSearched(false);
	};

	// We'll define setQueryState for clear
	const setQueryState = (val: string) => {
		setSearchQuery(val);
	};

	// Filter students in the frontend
	const filteredStudents = (allStudents || []).filter((student: any) => {
		if (!searchQuery.trim()) return false;
		const query = searchQuery.toLowerCase();
		return (
			student.fullName?.toLowerCase().includes(query) ||
			student.studentId?.toLowerCase().includes(query) ||
			student.roll?.toLowerCase().includes(query) ||
			student.mobile?.toLowerCase().includes(query) ||
			student.emergencyContact?.toLowerCase().includes(query) ||
			student.fatherName?.toLowerCase().includes(query)
		);
	});

	return (
		<div className="space-y-6">
			<StudentSearchForm 
				onSearch={handleSearch} 
				onClear={handleClear}
				isLoading={isStudentsLoading} 
				onScanClick={() => setIsScannerOpen(true)}
			/>
			<StudentSearchResults
				results={hasSearched ? filteredStudents : []}
				classes={classes || []}
				isLoading={isStudentsLoading}
				hasSearched={hasSearched}
			/>
			<QrBarcodeScannerModal
				open={isScannerOpen}
				onOpenChange={setIsScannerOpen}
				students={allStudents || []}
			/>
		</div>
	);
}
