import { cn } from "@/shared/lib/utils";
import { FileIcon, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/shared/components/ui/button";
import { PDFDocument } from "pdf-lib";

function formatBytes(bytes: number, decimals = 2) {
	if (!+bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const UploadDocumentSingle = React.forwardRef<
	HTMLDivElement,
	{
		value?: any;
		onChange: (file: any) => void;
		className?: string;
	}
>(({ value, onChange, className }, ref) => {
	const [pageCount, setPageCount] = useState<number | null>(null);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				onChange(acceptedFiles[0]);
			}
		},
		[onChange]
	);

	const removeFile = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(null);
		setPageCount(null);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: 1,
		accept: {
			"application/pdf": [".pdf"],
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".xls"],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
			"application/msword": [".doc"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
		},
	});

	useEffect(() => {
		if (value instanceof File && value.type === "application/pdf") {
			value
				.arrayBuffer()
				.then((buffer) => {
					return PDFDocument.load(buffer, { ignoreEncryption: true });
				})
				.then((doc) => {
					setPageCount(doc.getPageCount());
				})
				.catch((e) => console.error("Error parsing PDF pages:", e));
		} else {
			setPageCount(null);
		}
	}, [value]);

	const isFile = value instanceof File;
	const showPreview = value;

	let name = "Document";
	let size = "";
	let type = "Unknown Type";

	if (isFile) {
		name = value.name;
		size = formatBytes(value.size);
		type = value.type || "Document";
	} else if (value && typeof value === "object") {
		// Existing file from backend
		name = value.originalName || value.url || "Document";
		size = value.fileSize ? formatBytes(value.fileSize) : "";
		type = value.mimeType || value.type || "Document";
	}

	return (
		<div
			ref={ref}
			{...getRootProps({
				className: cn(
					"border p-4 h-32 flex flex-col items-center justify-center rounded-lg border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-primary/10 cursor-pointer transition-colors relative overflow-hidden",
					className
				),
			})}
		>
			<input {...getInputProps()} />

			{showPreview ? (
				<div className="flex items-center gap-3 bg-card p-3 rounded border shadow-sm absolute inset-2">
					<FileIcon className="h-8 w-8 shrink-0 text-primary" />
					<div className="flex flex-col truncate flex-1 text-left min-w-0">
						<span className="truncate font-medium text-foreground" title={name}>
							{name}
						</span>
						<span className="text-xs text-muted-foreground truncate">
							{name?.split('.').pop()?.toUpperCase()} {size ? `• ${size}` : ""} {pageCount ? `• ${pageCount} pages` : ""}
						</span>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 z-10"
						onClick={removeFile}
					>
						<X className="h-5 w-5" />
					</Button>
				</div>
			) : isDragActive ? (
				<p className="font-medium relative z-0">Drop the file here ...</p>
			) : (
				<p className="font-medium text-center relative z-0">
					Click or drag file here
					<br />
					<span className="text-xs text-muted-foreground font-normal mt-1 block">
						PDF, CSV, Excel, Word
					</span>
				</p>
			)}
		</div>
	);
});

UploadDocumentSingle.displayName = "UploadDocumentSingle";

export default UploadDocumentSingle;
