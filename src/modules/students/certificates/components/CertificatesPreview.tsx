"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export type CertificateTemplate =
	| "transfer-certificate"
	| "character-certificate"
	| "completion-certificate"
	| "excellence-award";

interface CertificatesPreviewProps {
	student?: any;
	templateType: CertificateTemplate;
}

export default function CertificatesPreview({ student, templateType }: CertificatesPreviewProps) {
	const t = useTranslations("StudentCertificates");
	const [tcNo, setTcNo] = useState<number | string>("...");
	const [currentDate, setCurrentDate] = useState<string>("...");

	useEffect(() => {
		setTcNo(Math.floor(Math.random() * 10000));
		setCurrentDate(format(new Date(), "MMMM dd, yyyy"));
	}, []);

	if (!student) {
		return (
			<div className="flex h-full w-full items-center justify-center text-muted-foreground">
				{t("preview.selectToPreview")}
			</div>
		);
	}

	// Transfer Certificate Template
	if (templateType === "transfer-certificate") {
		return (
			<div className="relative flex aspect-[1.414/1] w-full max-w-[800px] flex-col border-[12px] border-double border-slate-700 bg-white p-8 text-slate-900 shadow-xl print:shadow-none dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900">
				<div className="absolute left-0 top-0 h-full w-full opacity-[0.03] flex items-center justify-center pointer-events-none">
					<div className="text-[150px] font-bold text-slate-900 tracking-tighter transform -rotate-45">TC</div>
				</div>
				<div className="text-center mb-6 z-10">
					<h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-slate-800">Transfer Certificate</h1>
					<p className="text-sm font-semibold mt-1">Stackrover International School</p>
					<p className="text-xs">123 Education Lane, Knowledge City</p>
				</div>

				<div className="flex-1 text-sm font-serif leading-loose z-10">
					<div className="flex justify-between mb-4">
						<span><strong>TC No:</strong> TC-{tcNo}</span>
						<span><strong>Date:</strong> {currentDate}</span>
					</div>
					<p className="mb-4">
						This is to certify that <strong>{student.fullName}</strong>,
						son/daughter of <strong>{student.fatherName || "______________"}</strong> and <strong>{student.motherName || "______________"}</strong>,
						was a bona fide student of this school.
					</p>
					<p className="mb-4">
						He/She was admitted to the school on <strong>{student.admissionDate || "______________"}</strong> in Class <strong>{student.class}</strong>.
						His/Her date of birth according to the Admission Register is <strong>{student.dob || "______________"}</strong>.
					</p>
					<p className="mb-8">
						He/She leaves the school having passed the examination for Class <strong>{student.class}</strong>.
						All dues to the school have been paid. His/Her conduct and character during the stay in the school were good.
					</p>

					<div className="flex justify-between mt-auto pt-16">
						<div className="text-center">
							<div className="w-40 border-t border-slate-500 mb-1"></div>
							<p className="text-xs">Prepared By</p>
						</div>
						<div className="text-center">
							<div className="w-40 border-t border-slate-500 mb-1"></div>
							<p className="text-xs">Principal&apos;s Signature</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Character Certificate Template
	if (templateType === "character-certificate") {
		return (
			<div className="relative flex aspect-[1.414/1] w-full max-w-[800px] flex-col border-8 border-solid border-indigo-900 bg-[#fbfbf8] p-10 text-slate-900 shadow-xl print:shadow-none">
				<div className="absolute inset-2 border-2 border-indigo-900/20"></div>
				<div className="text-center mb-6 z-10">
					<h1 className="text-4xl font-serif text-indigo-900">Character Certificate</h1>
					<div className="h-px w-64 bg-indigo-900 mx-auto mt-2"></div>
				</div>

				<div className="flex-1 flex flex-col text-center text-lg font-serif leading-relaxed z-10 px-12">
					<div className="flex-1 flex flex-col justify-center items-center">
						<p className="mb-6">
							This is to certify that <strong>{student.fullName}</strong>
							(ID: <strong>{student.studentId}</strong>) has been a student of our institution in Class <strong>{student.class}</strong>.
						</p>
						<p className="mb-6 italic text-slate-700">
							To the best of my knowledge, he/she bears an excellent moral character and conduct.
							He/She is hardworking, disciplined, and actively participates in school activities.
						</p>
						<p>I wish him/her all success in future endeavors.</p>
					</div>

					<div className="flex w-full justify-between mt-auto pt-6">
						<span><strong>Date:</strong> {currentDate}</span>
						<div className="text-center">
							<div className="w-48 border-t border-indigo-900 mb-1"></div>
							<p className="text-sm">Head of Institution</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Course Completion Certificate
	if (templateType === "completion-certificate") {
		return (
			<div className="relative flex aspect-[1.414/1] w-full max-w-[800px] flex-col bg-gradient-to-br from-blue-50 to-emerald-50 p-12 text-slate-900 shadow-xl print:shadow-none">
				<div className="absolute inset-4 border-[4px] border-blue-900/10 rounded-xl"></div>
				<div className="text-center z-10">
					<h3 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4">Certificate of Completion</h3>
					<h1 className="text-5xl font-serif font-bold text-slate-800 mb-2">Awarded To</h1>
					<h2 className="text-4xl font-serif text-emerald-700 italic my-6">{student.fullName}</h2>
					<div className="h-1 w-24 bg-blue-500 mx-auto my-6 rounded-full"></div>
					<p className="text-lg text-slate-600 max-w-lg mx-auto">
						In recognition of successfully completing the academic requirements for Class <strong>{student.class}</strong> for the session <strong>{student.session || "2023-2024"}</strong>.
					</p>
				</div>

				<div className="flex w-full justify-between mt-auto pt-12 z-10">
					<div className="text-center">
						<div className="w-40 border-t-2 border-slate-300 mb-2"></div>
						<p className="text-sm font-bold text-slate-600">Date</p>
						<p className="text-xs text-slate-500">{currentDate}</p>
					</div>
					<div className="text-center">
						<div className="w-40 border-t-2 border-slate-300 mb-2"></div>
						<p className="text-sm font-bold text-slate-600">Director</p>
						<p className="text-xs text-slate-500">Signature</p>
					</div>
				</div>
			</div>
		);
	}

	// Excellence Award
	if (templateType === "excellence-award") {
		return (
			<div className="relative flex aspect-[1.414/1] w-full max-w-[800px] flex-col bg-slate-900 p-10 text-white shadow-xl print:shadow-none overflow-hidden rounded-xl">
				{/* Decorative elements */}
				<div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

				<div className="absolute inset-4 border-[1px] border-yellow-500/30 rounded-xl"></div>
				<div className="absolute inset-5 border-[1px] border-yellow-500/10 rounded-xl"></div>

				<div className="text-center z-10 flex flex-col items-center justify-center h-full">
					<div className="text-yellow-500 mb-4">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
					</div>
					<h3 className="text-yellow-500 font-bold tracking-[0.3em] uppercase text-sm mb-4">Certificate of Excellence</h3>
					<p className="text-slate-400 mb-4">PROUDLY PRESENTED TO</p>
					<h2 className="text-5xl font-serif text-white mb-6">{student.fullName}</h2>
					<div className="h-px w-48 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6"></div>
					<p className="text-lg text-slate-300 max-w-lg mx-auto">
						For outstanding academic performance and exceptional dedication in Class <strong>{student.class}</strong>.
					</p>

					<div className="flex w-full justify-around mt-16 z-10">
						<div className="text-center">
							<div className="w-40 border-t border-slate-700 mb-2"></div>
							<p className="text-sm text-slate-400">Date</p>
							<p className="text-xs text-yellow-500/70">{currentDate}</p>
						</div>
						<div className="text-center">
							<div className="w-40 border-t border-slate-700 mb-2"></div>
							<p className="text-sm text-slate-400">Principal</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return null;
}
