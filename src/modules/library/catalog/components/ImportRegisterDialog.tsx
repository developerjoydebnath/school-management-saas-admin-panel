"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { importLibraryBooks } from "../../shared/hooks/use-library";

const COLUMNS = [
	"accessionNo",
	"title",
	"author",
	"category",
	"publisher",
	"isbn",
	"accessionDate",
	"price",
	"rackNo",
	"remarks",
] as const;

type Row = Record<string, unknown>;

/** Header names are matched loosely: "Accession No." and accession_no both land
 *  on the same field. A register exported from Excel rarely matches an API
 *  field name exactly. */
const normaliseHeader = (cell: unknown) =>
	String(cell ?? "")
		.replace(/[\s._-]/g, "")
		.toLowerCase();

/** Excel gives a real Date for a date-formatted cell; the API wants YYYY-MM-DD. */
const cellToValue = (column: string, cell: unknown) => {
	if (cell === null || cell === undefined || cell === "") return undefined;
	if (column === "price") {
		const amount = Number(String(cell).replace(/[^\d.-]/g, ""));
		return Number.isFinite(amount) ? amount : undefined;
	}
	if (column === "accessionDate") {
		if (cell instanceof Date) return cell.toISOString().slice(0, 10);
		return String(cell).trim().slice(0, 10);
	}
	// Accession numbers are text: Excel happily turns "00001" into the number 1,
	// and a register whose numbers lost their leading zeros is a broken register.
	return String(cell).trim();
};

/** Turns a header row + body rows into the objects the API takes. */
function mapRows(header: unknown[], body: unknown[][]): Row[] {
	const headers = header.map(normaliseHeader);
	const mapping = COLUMNS.map((column) => ({
		column,
		index: headers.indexOf(normaliseHeader(column)),
	}));

	return body
		.filter((cells) => cells.some((cell) => String(cell ?? "").trim() !== ""))
		.map((cells) => {
			const row: Row = {};
			for (const { column, index } of mapping) {
				if (index < 0) continue;
				const value = cellToValue(column, cells[index]);
				if (value !== undefined && value !== "") row[column] = value;
			}
			return row;
		});
}

/** Comma separated, optional double quotes, no embedded newlines. */
function parseCsv(raw: string): Row[] {
	const lines = raw
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	if (!lines.length) return [];

	const splitLine = (line: string) => {
		const cells: string[] = [];
		let current = "";
		let inQuotes = false;
		for (let index = 0; index < line.length; index += 1) {
			const char = line[index];
			if (char === '"') {
				if (inQuotes && line[index + 1] === '"') {
					current += '"';
					index += 1;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === "," && !inQuotes) {
				cells.push(current.trim());
				current = "";
			} else {
				current += char;
			}
		}
		cells.push(current.trim());
		return cells;
	};

	return mapRows(splitLine(lines[0]), lines.slice(1).map(splitLine));
}

/**
 * Bringing an existing hardbound register in.
 *
 * This is the adoption gate for any school that is not brand new: four thousand
 * books already written in a register will not be retyped, and will not accept
 * being renumbered. So the import keeps whatever accession number each row
 * carries, and a dry run is offered first because pasting a thousand rows into
 * a live catalogue unseen is not something anyone should be asked to do.
 *
 * Files are parsed in the browser so the preview is instant and the API keeps
 * one shape (rows in, result out) whatever the file format was.
 */
export default function ImportRegisterDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const t = useTranslations("LibraryCatalog");
	const ft = useTranslations("Forms");
	const [text, setText] = useState("");
	const [fileRows, setFileRows] = useState<Row[] | null>(null);
	const [fileName, setFileName] = useState("");
	const [isParsing, setIsParsing] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [isRunning, setIsRunning] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const reset = () => {
		setText("");
		setFileRows(null);
		setFileName("");
		setResult(null);
	};

	const onFile = async (file?: File | null) => {
		if (!file) return;
		setResult(null);
		setIsParsing(true);
		try {
			const name = file.name.toLowerCase();

			if (name.endsWith(".csv")) {
				// Kept as text so the librarian can see and correct the rows.
				setText(await file.text());
				setFileRows(null);
				setFileName(file.name);
				return;
			}

			if (name.endsWith(".xlsx")) {
				// Loaded on demand: the spreadsheet reader is far bigger than this
				// dialog, and most people paste CSV rather than upload a workbook.
				// `/browser` explicitly: the package ships no root export, only the
				// per-environment entries, and this one runs in the page.
				const { default: readXlsxFile } = await import(
					"read-excel-file/browser"
				);
				// Its Sheet<T> row type does not overlap unknown[][] structurally,
				// so the widening goes through unknown. Every cell is re-read
				// defensively in cellToValue anyway.
				const sheet = (await readXlsxFile(file)) as unknown as unknown[][];
				if (sheet.length < 2) {
					toast.error(t("importNoRows"));
					return;
				}
				setFileRows(mapRows(sheet[0], sheet.slice(1)));
				setText("");
				setFileName(file.name);
				return;
			}

			// .xls is the Excel 97-2003 binary format — a different format
			// entirely, not an older .xlsx. Say so precisely instead of failing
			// with a parse error.
			if (name.endsWith(".xls")) {
				toast.error(t("importLegacyXls"));
				return;
			}

			toast.error(t("importUnsupportedFile"));
		} catch {
			toast.error(t("importParseFailed"));
		} finally {
			setIsParsing(false);
			// Let the same file be chosen again after a correction.
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const rowsToSend = () => (fileRows ? fileRows : parseCsv(text));

	const run = async (dryRun: boolean) => {
		const rows = rowsToSend();
		if (!rows.length) {
			toast.error(t("importNoRows"));
			return;
		}
		setIsRunning(true);
		try {
			const response = await importLibraryBooks(rows, dryRun);
			setResult(response?.data);
			if (!dryRun) {
				toast.success(
					t("importDone", { copies: response?.data?.copiesCreated ?? 0 }),
				);
			}
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsRunning(false);
		}
	};

	const hasRows = !!fileRows?.length || !!text.trim();

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) reset();
			}}
		>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("importRegister")}</DialogTitle>
					<DialogDescription>{t("importDescription")}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="bg-muted/40 rounded-md border border-dashed p-3">
						<p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
							{t("importColumns")}
						</p>
						<p className="font-mono text-xs break-all">{COLUMNS.join(", ")}</p>
						<p className="text-muted-foreground mt-2 text-xs">
							{t("importColumnsHelper")}
						</p>
					</div>

					<div className="space-y-2">
						<Label>{t("importFile")}</Label>
						<div className="flex flex-wrap items-center gap-2">
							<input
								ref={inputRef}
								type="file"
								accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								className="hidden"
								onChange={(event) => void onFile(event.target.files?.[0])}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => inputRef.current?.click()}
								disabled={isParsing}
							>
								<Upload className="size-4" />
								{isParsing ? t("importParsing") : t("chooseFile")}
							</Button>
							<span className="text-muted-foreground text-xs">
								{t("orPasteBelow")}
							</span>
						</div>
						<p className="text-muted-foreground text-xs">{t("acceptedFormats")}</p>
					</div>

					{/* A workbook has no sensible text form, so it is shown as a chip
					    with its row count rather than dumped into the textarea. */}
					{fileRows && (
						<div className="flex items-center justify-between gap-3 rounded-md border p-3">
							<span className="flex min-w-0 items-center gap-2 text-sm">
								<FileSpreadsheet className="text-muted-foreground size-4 shrink-0" />
								<span className="min-w-0 truncate">{fileName}</span>
								<span className="text-muted-foreground shrink-0 text-xs">
									{t("rowsRead", { count: fileRows.length })}
								</span>
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={reset}
								title={ft("cancel")}
							>
								<X className="size-4" />
							</Button>
						</div>
					)}

					{!fileRows && (
						<Textarea
							value={text}
							onChange={(event) => {
								setText(event.target.value);
								setResult(null);
							}}
							rows={8}
							className="font-mono text-xs"
							placeholder={
								"accessionNo,title,author,category,price\n00001,পথের পাঁচালী,বিভূতিভূষণ বন্দ্যোপাধ্যায়,বাংলা উপন্যাস,350"
							}
						/>
					)}

					{result && (
						<div className="space-y-2 rounded-md border p-3 text-sm">
							<div className="flex flex-wrap items-center gap-4">
								<span className="flex items-center gap-1.5">
									<CheckCircle2 className="size-4 text-emerald-600" />
									{result.dryRun
										? t("importWouldCreate", { count: result.copiesCreated })
										: t("importCreated", { count: result.copiesCreated })}
								</span>
								{result.booksCreated > 0 && (
									<span className="text-muted-foreground">
										{t("importNewTitles", { count: result.booksCreated })}
									</span>
								)}
							</div>

							{result.skipped?.length > 0 && (
								<p className="text-muted-foreground text-xs">
									{t("importSkipped", { count: result.skipped.length })}
								</p>
							)}

							{result.errors?.length > 0 && (
								<div className="space-y-1">
									<p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
										<AlertTriangle className="size-3.5" />
										{t("importErrors", { count: result.errors.length })}
									</p>
									<ul className="text-muted-foreground max-h-32 space-y-0.5 overflow-y-auto text-xs">
										{result.errors.slice(0, 20).map((error: any, index: number) => (
											<li key={index}>
												{t("importRowError", {
													row: error.row,
													message: error.message,
												})}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => run(true)}
						disabled={isRunning || isParsing || !hasRows}
					>
						{t("importPreview")}
					</Button>
					<Button
						type="button"
						onClick={() => run(false)}
						disabled={isRunning || isParsing || !hasRows}
					>
						{isRunning ? ft("saveLoading") : t("importRun")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
