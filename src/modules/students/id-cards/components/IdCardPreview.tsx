"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslations } from "next-intl";
import { StudentBarcode } from "@/shared/components/custom/StudentBarcode";
import { StudentQRCode } from "@/shared/components/custom/StudentQRCode";

export type IdCardTemplate =
	| "modern-vertical"
	| "classic-horizontal"
	| "minimal-vertical"
	| "elegant-horizontal"
	| "corporate-vertical"
	| "kids-horizontal"
	| "tech-vertical"
	| "creative-horizontal";

interface IdCardPreviewProps {
	student: any;
	templateType: IdCardTemplate;
}

// Dynamic Barcode Component Wrapper
const BarcodeSVG = ({ studentId }: { studentId: string }) => (
	<div className="flex flex-col items-center">
		<StudentBarcode studentId={studentId} height={32} width={1.1} />
	</div>
);

export default function IdCardPreview({ student, templateType }: IdCardPreviewProps) {
	const t = useTranslations("StudentIdCards");

	if (!student) {
		return (
			<div className="text-muted-foreground flex h-[400px] w-full items-center justify-center rounded-md border border-dashed">
				Select a student to preview ID card
			</div>
		);
	}

	if (templateType === "modern-vertical") {
		return (
			<div className="flex flex-col items-center gap-6">
				{/* Front Side */}
				<div className="border-primary/20 relative w-[250px] overflow-hidden rounded-xl border-2 bg-white shadow-lg print:border-none print:shadow-none">
					{/* Header Background */}
					<div className="bg-primary text-primary-foreground flex h-24 w-full flex-col items-center justify-center rounded-b-[40px] p-4 text-center">
						<h3 className="text-sm font-bold tracking-wider uppercase">
							Global Int. School
						</h3>
						<p className="text-[10px] opacity-90">Education for Excellence</p>
					</div>

					{/* Photo */}
					<div className="absolute top-14 left-1/2 -translate-x-1/2 rounded-full border-4 border-white bg-white shadow-sm">
						<Avatar className="h-20 w-20">
							<AvatarImage src={student.photo} alt={student.fullName} />
							<AvatarFallback className="text-primary bg-primary/10 text-xl">
								{student.fullName.charAt(0)}
							</AvatarFallback>
						</Avatar>
					</div>

					{/* Body */}
					<div className="flex flex-col items-center px-4 pt-14 pb-4 text-center text-slate-900">
						<h2 className="mb-1 text-lg leading-tight font-bold">{student.fullName}</h2>
						<Badge
							variant="secondary"
							className="text-primary bg-primary/10 mb-4 px-2 py-0 text-[10px]"
						>
							Student
						</Badge>

						<div className="mb-4 w-full space-y-1.5 text-left text-[11px]">
							<div className="grid grid-cols-3">
								<span className="text-muted-foreground col-span-1">
									{t("card.id")}:
								</span>
								<span className="col-span-2 font-semibold">
									{student.studentId}
								</span>
							</div>
							<div className="grid grid-cols-3">
								<span className="text-muted-foreground col-span-1">
									{t("card.class")}:
								</span>
								<span className="col-span-2 font-semibold">
									{student.class} {student.section ? `(${student.section})` : ""}
								</span>
							</div>
							<div className="grid grid-cols-3">
								<span className="text-muted-foreground col-span-1">
									{t("card.roll")}:
								</span>
								<span className="col-span-2 font-semibold">{student.roll}</span>
							</div>
							<div className="grid grid-cols-3">
								<span className="text-muted-foreground col-span-1">
									{t("card.bloodGroup")}:
								</span>
								<span className="text-destructive col-span-2 font-semibold">
									{student.bloodGroup || "N/A"}
								</span>
							</div>
						</div>

						<div className="mt-2 text-slate-900">
							<BarcodeSVG studentId={student.studentId} />
						</div>
					</div>
				</div>

				{/* Back Side */}
				<div className="border-primary/20 relative flex w-[250px] flex-col overflow-hidden rounded-xl border-2 bg-white p-4 text-slate-900 shadow-lg print:border-none print:shadow-none">
					<h4 className="mb-2 border-b pb-1 text-xs font-bold uppercase">
						Terms & Conditions
					</h4>
					<ul className="text-muted-foreground flex-1 list-disc space-y-1 pl-3 text-[9px]">
						<li>This card is property of the school.</li>
						<li>Must be worn at all times on campus.</li>
						<li>If lost, report to administration immediately.</li>
						<li>Transferable use is strictly prohibited.</li>
					</ul>

					<div className="mt-4 w-full space-y-1 border-t pt-2 text-left text-[10px]">
						<div>
							<span className="font-semibold">{t("card.contact")}:</span>{" "}
							{student.emergencyContact || student.mobile}
						</div>
						<div>
							<span className="font-semibold">{t("card.address")}:</span>{" "}
							<span className="line-clamp-2">{student.presentAddress || "N/A"}</span>
						</div>
					</div>

					<div className="mt-6 flex items-end justify-between">
						<div className="text-[10px]">
							<span className="font-semibold">{t("card.validTill")}:</span>
							<br />
							Dec 2026
						</div>
						<div className="text-center">
							<div className="mb-1 h-8 w-16 border-b border-slate-300"></div>
							<span className="text-muted-foreground text-[9px]">
								{t("card.principal")}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (templateType === "minimal-vertical") {
		return (
			<div className="flex flex-col items-center gap-6">
				{/* Front Side */}
				<div className="relative flex w-[250px] flex-col items-center overflow-hidden rounded-xl border bg-white p-4 text-slate-900 shadow-sm print:border-none print:shadow-none">
					<h3 className="mb-4 w-full border-b pb-2 text-center text-sm font-bold tracking-wider text-slate-800 uppercase">
						Global Int. School
					</h3>

					<Avatar className="mb-4 h-24 w-24 rounded-xl">
						<AvatarImage src={student.photo} alt={student.fullName} />
						<AvatarFallback className="rounded-xl bg-slate-100 text-2xl text-slate-600">
							{student.fullName.charAt(0)}
						</AvatarFallback>
					</Avatar>

					<h2 className="mb-1 text-xl leading-tight font-bold">{student.fullName}</h2>
					<p className="text-muted-foreground mb-4 text-xs tracking-widest uppercase">
						Student
					</p>

					<div className="mb-4 w-full space-y-2 rounded-lg bg-slate-50 p-3 text-left text-[11px]">
						<div className="flex justify-between border-b border-slate-200 pb-1">
							<span className="text-muted-foreground">{t("card.id")}</span>
							<span className="font-semibold">{student.studentId}</span>
						</div>
						<div className="flex justify-between border-b border-slate-200 pb-1">
							<span className="text-muted-foreground">{t("card.class")}</span>
							<span className="font-semibold">
								{student.class} {student.section ? `(${student.section})` : ""}
							</span>
						</div>
						<div className="flex justify-between border-b border-slate-200 pb-1">
							<span className="text-muted-foreground">{t("card.roll")}</span>
							<span className="font-semibold">{student.roll}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">{t("card.bloodGroup")}</span>
							<span className="font-semibold">{student.bloodGroup || "N/A"}</span>
						</div>
					</div>
					<div className="mt-2 text-slate-900">
						<BarcodeSVG studentId={student.studentId} />
					</div>
				</div>

				{/* Back Side */}
				<div className="relative flex w-[250px] flex-col overflow-hidden rounded-xl border bg-white p-4 text-slate-900 shadow-sm print:border-none print:shadow-none">
					<h4 className="mb-2 border-b pb-1 text-center text-xs font-bold uppercase">
						Important Information
					</h4>
					<div className="text-muted-foreground mt-2 flex-1 space-y-2 text-center text-[10px]">
						<p>
							This card remains the property of the school and must be returned upon
							request.
						</p>
						<p>If found, please return to:</p>
						<p className="font-semibold text-slate-800">
							Global Int. School Administration
							<br />
							123 Education Lane, City
						</p>
					</div>
					<div className="mt-4 w-full space-y-1 border-t pt-4 text-center text-[10px]">
						<div>
							<span className="font-semibold">{t("card.contact")}:</span>{" "}
							{student.emergencyContact || student.mobile}
						</div>
					</div>
					<div className="mt-6 flex items-end justify-between">
						<div className="w-full text-center">
							<div className="mx-auto mb-1 h-8 w-24 border-b border-slate-300"></div>
							<span className="text-muted-foreground text-[9px] tracking-wider uppercase">
								{t("card.principal")}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (templateType === "elegant-horizontal") {
		return (
			<div className="flex flex-col items-center gap-6">
				{/* Front Side */}
				<div className="relative flex h-[250px] w-[400px] flex-col overflow-hidden rounded-xl border-none bg-slate-900 text-white shadow-xl print:border-none print:shadow-none">
					<div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
					<div className="flex h-full gap-4 p-5">
						<div className="flex flex-col items-center gap-4">
							<Avatar className="h-[100px] w-[100px] border-4 border-white/10 shadow-lg">
								<AvatarImage src={student.photo} alt={student.fullName} />
								<AvatarFallback className="bg-white/10 text-2xl text-white">
									{student.fullName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<Badge
								variant="outline"
								className="border-white/20 text-[10px] tracking-widest text-white uppercase"
							>
								Student
							</Badge>
						</div>
						<div className="flex flex-1 flex-col justify-between">
							<div className="border-b border-white/20 pb-3">
								<h3 className="mb-1 text-xs font-medium tracking-widest text-blue-400 uppercase">
									Global Int. School
								</h3>
								<h2 className="text-2xl leading-none font-bold">
									{student.fullName}
								</h2>
							</div>
							<div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
								<div>
									<span className="block text-[9px] text-white/60 uppercase">
										{t("card.id")}
									</span>{" "}
									<span className="font-semibold">{student.studentId}</span>
								</div>
								<div>
									<span className="block text-[9px] text-white/60 uppercase">
										{t("card.class")}
									</span>{" "}
									<span className="font-semibold">
										{student.class}{" "}
										{student.section ? `(${student.section})` : ""}
									</span>
								</div>
								<div>
									<span className="block text-[9px] text-white/60 uppercase">
										{t("card.dob")}
									</span>{" "}
									<span className="font-semibold">{student.dob || "N/A"}</span>
								</div>
								<div>
									<span className="block text-[9px] text-white/60 uppercase">
										{t("card.bloodGroup")}
									</span>{" "}
									<span className="font-semibold text-pink-400">
										{student.bloodGroup || "N/A"}
									</span>
								</div>
							</div>
							<div className="mt-4 flex justify-end">
								<div className="rounded bg-white p-1 text-slate-900">
									<BarcodeSVG studentId={student.studentId} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Back Side */}
				<div className="relative flex h-[250px] w-[400px] flex-col overflow-hidden rounded-xl border-none bg-slate-900 p-6 text-white shadow-xl print:border-none print:shadow-none">
					<div className="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center justify-center opacity-5">
						<div className="h-64 w-64 rounded-full border-[40px] border-white"></div>
					</div>
					<h4 className="mb-4 text-xs font-bold tracking-widest text-blue-400 uppercase">
						Terms & Conditions
					</h4>
					<ul className="mb-4 max-w-[80%] list-disc space-y-2 pl-4 text-[10px] text-white/70">
						<li>This card is non-transferable and must be surrendered upon request.</li>
						<li>
							Valid only while the student is enrolled in the current academic year.
						</li>
						<li>
							A fee will be charged for the replacement of a lost or damaged card.
						</li>
					</ul>
					<div className="mt-auto grid grid-cols-2 gap-4 text-[11px]">
						<div>
							<div className="mb-2">
								<span className="block text-[9px] text-white/60 uppercase">
									{t("card.contact")}
								</span>
								{student.emergencyContact || student.mobile}
							</div>
							<div>
								<span className="block text-[9px] text-white/60 uppercase">
									{t("card.address")}
								</span>
								<span className="line-clamp-2">
									{student.presentAddress || "N/A"}
								</span>
							</div>
						</div>
						<div className="flex flex-col items-end justify-end">
							<div className="mt-4 w-32 text-center">
								<div className="mb-2 h-8 w-full border-b border-white/30"></div>
								<span className="text-[9px] tracking-widest text-white/60 uppercase">
									{t("card.principal")}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (templateType === "corporate-vertical") {
		return (
			<div className="flex flex-col items-center gap-6">
				<div className="relative flex w-[250px] flex-col overflow-hidden rounded-lg border bg-white text-slate-900 shadow-md">
					<div className="bg-slate-900 p-4 text-center text-white">
						<div className="mx-auto mb-2 h-12 w-12 rounded bg-white/20"></div>
						<h3 className="text-xs font-semibold tracking-widest uppercase">
							Global Int. School
						</h3>
					</div>
					<div className="flex flex-col items-center px-4 pt-6 pb-4">
						<Avatar className="absolute top-20 h-20 w-20 rounded-md border-4 border-white bg-white shadow-sm">
							<AvatarImage src={student.photo} alt={student.fullName} />
							<AvatarFallback className="rounded-md bg-slate-200 text-xl text-slate-600">
								{student.fullName.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<div className="mt-6 text-center">
							<h2 className="text-lg font-bold text-slate-800">{student.fullName}</h2>
							<p className="text-xs font-medium text-slate-500 uppercase">
								Student • {student.class}
							</p>
						</div>
						<div className="mt-4 w-full space-y-2 border-y border-slate-100 py-3 text-[11px]">
							<div className="flex justify-between">
								<span className="text-slate-400">ID No.</span>
								<span className="font-semibold text-slate-700">
									{student.studentId}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">Valid</span>
								<span className="font-semibold text-slate-700">Dec 2026</span>
							</div>
						</div>
						<div className="mt-4 text-slate-900">
							<BarcodeSVG studentId={student.studentId} />
						</div>
					</div>
				</div>
				{/* Back Side */}
				<div className="relative flex w-[250px] flex-col overflow-hidden rounded-lg border bg-white p-5 text-slate-900 shadow-md">
					<h4 className="mb-2 text-xs font-bold text-slate-800 uppercase">
						Return If Found
					</h4>
					<p className="text-[10px] text-slate-500">
						123 Corporate Ave, City, State 12345
						<br />
						Phone: (555) 123-4567
						<br />
						Email: admin@globalint.school
					</p>
					<div className="mt-auto pt-10 text-center">
						<div className="mx-auto mb-1 h-1 w-24 bg-slate-800"></div>
						<span className="text-[9px] tracking-wider text-slate-500 uppercase">
							Authorized Signature
						</span>
					</div>
				</div>
			</div>
		);
	}

	if (templateType === "kids-horizontal") {
		return (
			<div className="flex flex-col items-center gap-6">
				<div className="relative flex h-[250px] w-[400px] overflow-hidden rounded-3xl border-4 border-yellow-400 bg-sky-100 shadow-lg">
					<div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-yellow-400/30"></div>
					<div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pink-400/30"></div>
					<div className="z-10 flex w-[140px] flex-col items-center justify-center p-4">
						<Avatar className="h-[100px] w-[100px] rounded-full border-4 border-white shadow-md">
							<AvatarImage src={student.photo} alt={student.fullName} />
							<AvatarFallback className="bg-white text-3xl font-bold text-sky-500">
								{student.fullName.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<Badge className="mt-3 bg-pink-500 text-[10px] font-bold text-white uppercase hover:bg-pink-600">
							Student
						</Badge>
					</div>
					<div className="z-10 flex flex-1 flex-col justify-center p-4 pl-0 text-slate-800">
						<h3 className="mb-1 text-sm font-black tracking-wider text-sky-600 uppercase">
							Global Kids School
						</h3>
						<h2 className="text-2xl font-black text-pink-600">{student.fullName}</h2>
						<div className="mt-4 space-y-1 text-[12px] font-bold text-slate-600">
							<p>
								Class:{" "}
								<span className="text-slate-800">
									{student.class} {student.section}
								</span>
							</p>
							<p>
								ID: <span className="text-slate-800">{student.studentId}</span>
							</p>
							<p>
								Emergency:{" "}
								<span className="text-slate-800">
									{student.emergencyContact || student.mobile}
								</span>
							</p>
						</div>
					</div>
				</div>
				{/* Back Side */}
				<div className="relative flex h-[250px] w-[400px] flex-col overflow-hidden rounded-3xl border-4 border-yellow-400 bg-sky-100 p-6 shadow-lg">
					<h4 className="mb-2 text-center text-lg font-black text-pink-500 uppercase">
						Information
					</h4>
					<p className="text-center text-xs font-bold text-slate-600">
						If you find this card, please help me get back to my school!
					</p>
					<div className="mt-auto pt-6 text-center text-slate-800">
						<BarcodeSVG studentId={student.studentId} />
					</div>
				</div>
			</div>
		);
	}

	if (templateType === "tech-vertical") {
		return (
			<div className="flex flex-col items-center gap-6 font-mono">
				<div className="relative flex w-[250px] flex-col overflow-hidden rounded-xl border border-green-500/30 bg-black text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
					<div className="border-b border-green-500/30 bg-green-500/10 p-3 text-center">
						<h3 className="text-xs font-bold tracking-widest">[ SYSTEM.ID ]</h3>
					</div>
					<div className="flex flex-col items-center p-5">
						<div className="relative mb-4">
							<div className="absolute -inset-1 rounded bg-green-500/20 blur"></div>
							<Avatar className="relative h-24 w-24 rounded border border-green-500 bg-black">
								<AvatarImage
									src={student.photo}
									alt={student.fullName}
									className="opacity-80 mix-blend-luminosity hover:opacity-100 hover:mix-blend-normal"
								/>
								<AvatarFallback className="rounded bg-black text-2xl text-green-500">
									{student.fullName.charAt(0)}
								</AvatarFallback>
							</Avatar>
						</div>
						<h2 className="mb-1 text-center text-lg font-bold">
							{student.fullName.toUpperCase()}
						</h2>
						<p className="mb-4 text-[10px] tracking-widest text-green-500/70">
							USR_TYPE: STUDENT
						</p>

						<div className="w-full space-y-2 text-[10px]">
							<div className="flex justify-between border-b border-green-500/20 pb-1">
								<span>ID_HASH:</span>
								<span>{student.studentId}</span>
							</div>
							<div className="flex justify-between border-b border-green-500/20 pb-1">
								<span>SECTOR:</span>
								<span>{student.class}</span>
							</div>
							<div className="flex justify-between pb-1">
								<span>BLD_GRP:</span>
								<span>{student.bloodGroup || "N/A"}</span>
							</div>
						</div>
						<div className="mt-4 opacity-70">
							<BarcodeSVG studentId={student.studentId} />
						</div>
					</div>
				</div>
				{/* Back Side */}
				<div className="relative flex w-[250px] flex-col overflow-hidden rounded-xl border border-green-500/30 bg-black p-5 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
					<h4 className="mb-2 text-xs font-bold tracking-widest text-green-500/70">
						{" "}
						ACCESS_RULES
					</h4>
					<ul className="flex-1 list-none space-y-2 text-[9px]">
						<li>01. UNAUTHORIZED USE IS LOGGED.</li>
						<li>02. MUST BE VISIBLE IN RESTRICTED ZONES.</li>
						<li>03. REPORT LOSS TO ADMIN TERMINAL.</li>
					</ul>
					<div className="mt-4 border-t border-green-500/30 pt-2 text-[10px]">
						<p> COM_LINK: {student.emergencyContact || student.mobile}</p>
					</div>
					<div className="mt-6 flex justify-between text-[9px] text-green-500/50">
						<span>SYS.AUTH</span>
						<span>V.2026</span>
					</div>
				</div>
			</div>
		);
	}

	if (templateType === "creative-horizontal") {
		return (
			<div className="flex flex-col items-center gap-6">
				<div className="relative flex h-[250px] w-[400px] overflow-hidden rounded-2xl bg-white shadow-xl">
					<div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-orange-400"></div>
					<div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-600"></div>
					<div className="relative z-10 flex h-full w-full bg-white/40 backdrop-blur-md">
						<div className="flex w-[160px] flex-col items-center justify-center border-r border-white/50 p-4">
							<Avatar className="mb-3 h-24 w-24 rounded-[2rem] border-4 border-white shadow-lg">
								<AvatarImage src={student.photo} alt={student.fullName} />
								<AvatarFallback className="rounded-[2rem] bg-white text-3xl text-orange-500">
									{student.fullName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-violet-700 shadow-sm">
								STUDENT
							</span>
						</div>
						<div className="flex flex-1 flex-col justify-between p-6 text-slate-800">
							<div>
								<h3 className="text-xs font-bold tracking-widest text-orange-500">
									GLOBAL INT.
								</h3>
								<h2 className="text-2xl leading-none font-black text-slate-900">
									{student.fullName}
								</h2>
							</div>
							<div className="grid grid-cols-2 gap-4 text-[11px] font-medium text-slate-700">
								<div>
									<span className="block text-[9px] text-slate-500">
										ID NUMBER
									</span>
									{student.studentId}
								</div>
								<div>
									<span className="block text-[9px] text-slate-500">COURSE</span>
									{student.class}
								</div>
								<div>
									<span className="block text-[9px] text-slate-500">BLOOD</span>
									{student.bloodGroup || "-"}
								</div>
							</div>
							<div className="self-end text-slate-800">
								<BarcodeSVG studentId={student.studentId} />
							</div>
						</div>
					</div>
				</div>
				{/* Back Side */}
				<div className="relative flex h-[250px] w-[400px] flex-col overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
					<h4 className="mb-4 text-xs font-bold tracking-widest text-orange-400 uppercase">
						Terms & Conditions
					</h4>
					<ul className="mb-4 max-w-[80%] list-disc space-y-2 pl-4 text-[10px] text-white/70">
						<li>This card is non-transferable and must be surrendered upon request.</li>
						<li>
							Valid only while the student is enrolled in the current academic year.
						</li>
					</ul>
					<div className="mt-auto grid grid-cols-2 gap-4 text-[11px]">
						<div>
							<div className="mb-2">
								<span className="block text-[9px] text-white/60 uppercase">
									Contact
								</span>
								{student.emergencyContact || student.mobile}
							</div>
						</div>
						<div className="flex flex-col items-end justify-end">
							<div className="mt-4 w-32 text-center">
								<div className="mb-2 h-8 w-full border-b border-white/30"></div>
								<span className="text-[9px] tracking-widest text-white/60 uppercase">
									Principal
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Default: classic-horizontal
	return (
		<div className="flex flex-col items-center gap-6">
			{/* Front Side */}
			<div className="border-primary/20 relative flex h-[250px] w-[400px] overflow-hidden rounded-xl border-2 bg-white shadow-lg print:border-none print:shadow-none">
				{/* Left Sidebar */}
				<div className="bg-primary text-primary-foreground flex h-full w-[120px] flex-col items-center px-2 pt-6">
					<div className="mb-4 rounded-full border-2 border-white bg-white shadow-sm">
						<Avatar className="h-[80px] w-[80px]">
							<AvatarImage src={student.photo} alt={student.fullName} />
							<AvatarFallback className="text-primary bg-primary/10 text-2xl">
								{student.fullName.charAt(0)}
							</AvatarFallback>
						</Avatar>
					</div>
					<Badge
						variant="secondary"
						className="text-primary bg-white text-[10px] font-bold uppercase"
					>
						Student
					</Badge>
				</div>

				{/* Right Content */}
				<div className="flex flex-1 flex-col p-4 text-slate-900">
					<div className="mb-3 border-b pb-2">
						<h3 className="text-primary text-sm font-bold tracking-wider uppercase">
							Global Int. School
						</h3>
						<h2 className="text-xl leading-tight font-bold text-slate-900">
							{student.fullName}
						</h2>
					</div>

					<div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
						<div>
							<span className="text-muted-foreground">{t("card.id")}:</span>{" "}
							<span className="font-semibold">{student.studentId}</span>
						</div>
						<div>
							<span className="text-muted-foreground">{t("card.class")}:</span>{" "}
							<span className="font-semibold">
								{student.class} {student.section ? `(${student.section})` : ""}
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">{t("card.roll")}:</span>{" "}
							<span className="font-semibold">{student.roll}</span>
						</div>
						<div>
							<span className="text-muted-foreground">{t("card.bloodGroup")}:</span>{" "}
							<span className="text-destructive font-semibold">
								{student.bloodGroup || "N/A"}
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">{t("card.dob")}:</span>{" "}
							<span className="font-semibold">{student.dob || "N/A"}</span>
						</div>
					</div>

					<div className="mt-auto self-end text-slate-900">
						<BarcodeSVG studentId={student.studentId} />
					</div>
				</div>
			</div>

			{/* Back Side */}
			<div className="border-primary/20 relative flex h-[250px] w-[400px] flex-col overflow-hidden rounded-xl border-2 bg-white p-5 text-slate-900 shadow-lg print:border-none print:shadow-none">
				<h4 className="mb-2 border-b pb-1 text-sm font-bold uppercase">
					Terms & Conditions
				</h4>
				<ul className="text-muted-foreground mb-4 list-disc space-y-1 pl-4 text-[10px]">
					<li>
						This card is property of the school and must be returned upon graduation or
						withdrawal.
					</li>
					<li>Must be worn at all times on campus.</li>
					<li>If lost, report to administration immediately. Replacement fees apply.</li>
					<li>Transferable use is strictly prohibited.</li>
				</ul>

				<div className="mt-auto grid grid-cols-2 gap-4 text-[11px]">
					<div>
						<div className="mb-2">
							<span className="font-semibold">{t("card.contact")}:</span>
							<br />
							{student.emergencyContact || student.mobile}
						</div>
						<div>
							<span className="font-semibold">{t("card.address")}:</span>
							<br />
							<span className="line-clamp-2">{student.presentAddress || "N/A"}</span>
						</div>
					</div>
					<div className="flex flex-col items-end justify-end">
						<div className="mb-4 text-right text-[10px]">
							<span className="font-semibold">{t("card.validTill")}:</span> Dec 2026
						</div>
						<div className="w-24 text-center">
							<div className="mb-1 h-8 w-full border-b border-slate-300"></div>
							<span className="text-muted-foreground text-[9px]">
								{t("card.principal")}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
