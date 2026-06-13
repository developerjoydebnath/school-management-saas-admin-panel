import { AcademicDocsTable } from "./documents/AcademicDocsTable";
import { AdmissionDocsTable } from "./documents/AdmissionDocsTable";
import { AwardsCertificatesGrid } from "./documents/AwardsCertificatesGrid";
import { DocProgressIDCard } from "./documents/DocProgressIDCard";
import { DocumentStatsCards } from "./documents/DocumentStatsCards";
import { MedicalRecordsTable } from "./documents/MedicalRecordsTable";

export default function DocumentsTab() {
	const totalDocs = 7; // Birth Certificate, TC, Marksheet, Photo, Father NID, Mother NID, Guardianship
	const verified = 4;
	const pending = 1;
	const missing = 1;
	const completionPercent = Math.round((verified / 6) * 100); // 6 required docs

	const idCardInfo = {
		cardNumber: "NEXA-2025-STU-0187",
		issueDate: "Jul 01, 2025",
		expiryDate: "Jun 30, 2026",
		status: "Active",
		bloodGroup: "B+",
	};

	return (
		<div className="space-y-6">
			{/* Doc Stats */}
			<DocumentStatsCards
				totalDocs={totalDocs}
				verified={verified}
				pending={pending}
				missing={missing}
			/>

			{/* Document Completion + ID Card */}
			<DocProgressIDCard
				completionPercent={completionPercent}
				verified={verified}
				totalDocs={totalDocs}
				idCardInfo={idCardInfo}
			/>

			{/* Admission Documents */}
			<AdmissionDocsTable />

			{/* Academic Documents */}
			<AcademicDocsTable />

			{/* Certificates & Awards */}
			<AwardsCertificatesGrid />

			{/* Medical Records */}
			<MedicalRecordsTable />
		</div>
	);
}

