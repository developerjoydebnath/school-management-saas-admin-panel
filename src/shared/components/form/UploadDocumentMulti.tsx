import { cn } from "@/shared/lib/utils";
import { FileIcon, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/shared/components/ui/button";
import { PDFDocument } from "pdf-lib";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const UploadDocumentMulti = React.forwardRef<
	HTMLDivElement,
	{
		value?: any[];
		onChange: (files: any[]) => void;
		className?: string;
	}
>(({ value = [], onChange, className }, ref) => {
	const currentFiles = Array.isArray(value) ? value : [];
	const [pageCounts, setPageCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		currentFiles.forEach(async (file) => {
			if (file instanceof File && file.type === "application/pdf") {
				const key = file.name + file.size;
				setPageCounts(prev => {
					if (prev[key]) return prev;
					
					file.arrayBuffer().then(buffer => {
						PDFDocument.load(buffer, { ignoreEncryption: true })
						.then(doc => {
							setPageCounts(p => ({ ...p, [key]: doc.getPageCount() }));
						})
						.catch(e => console.error("Error parsing PDF pages:", e));
					});

					return { ...prev, [key]: -1 };
				});
			}
		});
	}, [currentFiles]);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			onChange([...currentFiles, ...acceptedFiles]);
		},
		[currentFiles, onChange]
	);

	const removeFile = (index: number) => {
		const newFiles = [...currentFiles];
		newFiles.splice(index, 1);
		onChange(newFiles);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".xls"],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
			"application/msword": [".doc"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
		},
	});

	return (
		<div className={cn("space-y-4", className)}>
			<div
				ref={ref}
				{...getRootProps({
					className:
						"border p-4 h-32 flex flex-col items-center justify-center rounded-lg border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-primary/10 cursor-pointer transition-colors",
				})}
			>
				<input {...getInputProps()} />
				{isDragActive ? (
					<p className="font-medium">Drop the files here ...</p>
				) : (
					<p className="font-medium text-center">
						Drag & drop documents here, or click to select files
						<br />
						<span className="text-xs text-muted-foreground font-normal mt-1 block">
							Supports PDF, CSV, Excel, Word
						</span>
					</p>
				)}
			</div>

			{currentFiles.length > 0 && (
				<ul className="space-y-2">
					{currentFiles.map((file, i) => {
						const isFile = file instanceof File;
						const name = isFile ? file.name : (file.originalName || file.url || "Document");
						const size = isFile ? formatBytes(file.size) : (file.fileSize ? formatBytes(file.fileSize) : "");
						const type = isFile ? (file.type || "Unknown Type") : (file.mimeType || "Document");
						
						let pagesText = "";
						if (isFile && file.type === "application/pdf") {
							const key = file.name + file.size;
							const count = pageCounts[key];
							if (count && count > 0) pagesText = `${count} pages`;
						}
						
						return (
							<li
								key={i}
								className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border bg-card text-sm gap-2"
							>
								<div className="flex items-center gap-3 overflow-hidden flex-1">
									<FileIcon className="h-6 w-6 shrink-0 text-primary" />
									<div className="flex flex-col truncate">
										<span className="truncate font-medium text-foreground" title={name}>
											{name}
										</span>
										<span className="text-xs text-muted-foreground truncate">
											{name?.split('.').pop()?.toUpperCase()} {size ? `• ${size}` : ""} {pagesText ? `• ${pagesText}` : ""}
										</span>
									</div>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
									onClick={() => removeFile(i)}
								>
									<X className="h-4 w-4" />
								</Button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
});

UploadDocumentMulti.displayName = "UploadDocumentMulti";

export default UploadDocumentMulti;
