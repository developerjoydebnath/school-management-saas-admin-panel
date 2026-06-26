import { cn } from "@/shared/lib/utils";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";

const UploadImage = React.forwardRef<
	HTMLDivElement,
	{
		value?: string | File | null;
		onChange: (file: File) => void;
		className?: string;
		placeholderBase64?: string | null;
	}
>(({ value, onChange, className, placeholderBase64 }, ref) => {
	const [localUrl, setLocalUrl] = useState<string | null>(null);

	const onDrop = useCallback(
		(file: File[]) => {
			onChange(file[0]);
			setLocalUrl(URL.createObjectURL(file[0]));
		},
		[onChange]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	const isFile = value instanceof File;
	const isString = typeof value === "string" && value.length > 0;
	const showPreview = localUrl || isFile || isString;

	let previewUrl = "";
	if (localUrl) {
		previewUrl = localUrl;
	} else if (isFile) {
		previewUrl = URL.createObjectURL(value as File);
	} else if (isString) {
		previewUrl = value as string;
	}

	return (
		<div
			ref={ref}
			{...getRootProps({
				className: cn(
					"border p-4 h-32 flex items-center justify-center rounded-lg border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-primary/10 overflow-hidden relative cursor-pointer transition-colors",
					className
				),
			})}
		>
			<input {...getInputProps()} />

			{showPreview ? (
				isString && !localUrl && !isFile ? (
					<ProgressiveImage
						src={previewUrl}
						placeholderBase64={placeholderBase64}
						alt="Preview"
						fill
						className="object-cover"
					/>
				) : (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={previewUrl}
						alt="Preview"
						className="absolute inset-0 h-full w-full object-cover"
					/>
				)
			) : isDragActive ? (
				<p className="relative z-10 font-medium">Drop the files here ...</p>
			) : (
				<p className="relative z-10 font-medium">Drag & drop file here, or click to select files</p>
			)}
		</div>
	);
});

UploadImage.displayName = "UploadImage";

export default UploadImage;
