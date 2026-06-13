"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface TcPrintTemplateProps {
	student: any;
	reason: string;
	conduct: string;
}

export default function TcPrintTemplate({ student, reason, conduct }: TcPrintTemplateProps) {
	const [tcNo, setTcNo] = useState("");
	
	useEffect(() => {
		setTcNo(`TC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
	}, []);

	const currentDate = format(new Date(), "dd MMMM yyyy");

	return (
		<div className="w-full max-w-[210mm] min-h-[297mm] bg-white mx-auto p-12 text-black font-serif border-4 border-double border-slate-800 outline outline-1 outline-offset-4 outline-slate-800">
			{/* Header */}
			<div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
				<div className="mx-auto h-20 w-20 rounded-full border border-slate-300 flex items-center justify-center mb-4 bg-slate-50">
					<span className="text-2xl font-black text-slate-800">GIS</span>
				</div>
				<h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 mb-2">Global International School</h1>
				<p className="text-sm font-semibold tracking-wide text-slate-700">123 Education Lane, Dhaka, Bangladesh</p>
				<p className="text-sm text-slate-600">Email: info@globalint.school | Phone: +880 1234 567890</p>
				<p className="text-sm text-slate-600">EIIN: 123456</p>
			</div>

			<div className="text-center mb-10 relative">
				<h2 className="text-2xl font-bold uppercase tracking-[0.2em] underline underline-offset-8 inline-block px-4">
					Transfer Certificate
				</h2>
			</div>

			<div className="flex justify-between text-sm font-semibold mb-8">
				<div>TC No: {tcNo}</div>
				<div>Date: {currentDate}</div>
			</div>

			{/* Body */}
			<div className="space-y-6 leading-loose text-justify text-base">
				<p>
					This is to certify that <strong>{student.fullName}</strong>, 
					son/daughter of <strong>{student.fatherName || "[Father's Name]"}</strong> and 
					<strong> {student.motherName || "[Mother's Name]"}</strong>, 
					was a student of this institution.
				</p>

				<p>
					According to the admission register, his/her date of birth is 
					<strong> {student.dob ? format(new Date(student.dob), "dd MMMM yyyy") : "[DOB]"}</strong>. 
					His/her nationality is <strong>{student.nationality || "Bangladeshi"}</strong> and religion is <strong>{student.religion || "[Religion]"}</strong>.
				</p>

				<p>
					He/she was admitted to this school on <strong>[Admission Date]</strong> in Class <strong>[Admission Class]</strong>. 
					He/she was studying in Class <strong>{student.class}</strong>, Section <strong>{student.section || "N/A"}</strong>, 
					Roll No <strong>{student.roll || "N/A"}</strong> during the current academic session.
				</p>

				<p>
					He/she has cleared all dues to the school up to the date of leaving. 
					He/she leaves the school for the following reason: <strong>{reason}</strong>.
				</p>

				<p>
					To the best of my knowledge, his/her moral character and conduct during the stay in this school has been <strong>{conduct}</strong>.
				</p>

				<p>
					We wish him/her success in all future endeavors.
				</p>
			</div>

			{/* Signatures */}
			<div className="mt-32 flex justify-between items-end">
				<div className="text-center">
					<div className="w-48 border-t border-slate-800 mb-2"></div>
					<p className="font-semibold text-sm uppercase">Prepared By</p>
					<p className="text-xs text-slate-500">(Office Assistant)</p>
				</div>
				<div className="text-center">
					<div className="w-48 border-t border-slate-800 mb-2"></div>
					<p className="font-semibold text-sm uppercase">Checked By</p>
					<p className="text-xs text-slate-500">(Class Teacher)</p>
				</div>
				<div className="text-center">
					<div className="w-48 border-t border-slate-800 mb-2"></div>
					<p className="font-semibold text-sm uppercase">Principal</p>
					<p className="text-xs text-slate-500">Global International School</p>
				</div>
			</div>
			
			<div className="mt-12 text-center text-[10px] text-slate-400">
				* This is a computer generated document. Valid with official seal and signature.
			</div>
		</div>
	);
}
