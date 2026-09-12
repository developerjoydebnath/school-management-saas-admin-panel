"use client";

import { Button } from "@/shared/components/ui/button";
import { uploadImage } from "@/shared/services/uploadApi";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { HomeworkAttachment } from "../dto/homework.dto";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/** Media paths are stored relative; the backend serves them on its own origin. */
export function toAbsolute(url: string) {
	if (/^(https?:|data:)/.test(url)) return url;
	const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
	return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

/**
 * Photos of the question sheet — the fastest way for a teacher to set homework
 * is to snap the textbook page or their own handwriting rather than retype it.
 */
export default function HomeworkAttachments({
	value = [],
	onChange,
}: {
	value?: HomeworkAttachment[];
	onChange: (value: HomeworkAttachment[]) => void;
}) {
	const t = useTranslations("Homework");
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(0);

	const handleFiles = async (files: FileList | null) => {
		if (!files?.length) return;
		const picked = Array.from(files);

		const valid = picked.filter((file) => {
			if (!ACCEPTED.includes(file.type)) {
				toast.error(`${file.name}: ${t("attachmentTypeError")}`);
				return false;
			}
			if (file.size > MAX_BYTES) {
				toast.error(`${file.name}: ${t("attachmentSizeError")}`);
				return false;
			}
			return true;
		});
		if (!valid.length) return;

		setUploading((n) => n + valid.length);
		// Uploaded in parallel; one failure must not discard the others.
		const results = await Promise.allSettled(
			valid.map((file) => uploadImage(file, "homework"))
		);

		const uploaded: HomeworkAttachment[] = [];
		results.forEach((result, index) => {
			if (result.status === "fulfilled" && result.value?.url) {
				uploaded.push({
					url: result.value.url,
					name: valid[index].name,
					mediaId: result.value.mediaId,
				});
			} else {
				toast.error(`${valid[index].name}: ${t("attachmentUploadError")}`);
			}
		});

		setUploading((n) => Math.max(0, n - valid.length));
		if (uploaded.length) onChange([...value, ...uploaded]);
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div className="space-y-3">
			<input
				ref={inputRef}
				type="file"
				accept={ACCEPTED.join(",")}
				multiple
				className="hidden"
				onChange={(event) => handleFiles(event.target.files)}
			/>

			<div
				role="button"
				tabIndex={0}
				onClick={() => inputRef.current?.click()}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
				}}
				onDragOver={(event) => event.preventDefault()}
				onDrop={(event) => {
					event.preventDefault();
					handleFiles(event.dataTransfer.files);
				}}
				className="border-input hover:border-primary hover:bg-primary/5 text-muted-foreground flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm transition-colors"
			>
				{uploading > 0 ? (
					<>
						<Loader2 className="size-5 animate-spin" />
						<span>{t("uploading")}</span>
					</>
				) : (
					<>
						<ImagePlus className="size-5" />
						<span className="font-medium">{t("attachmentDropzone")}</span>
						<span className="text-xs">{t("attachmentHint")}</span>
					</>
				)}
			</div>

			{value.length > 0 ? (
				<div className="grid grid-cols-2 gap-3 @xl/body:grid-cols-4">
					{value.map((attachment, index) => (
						<div
							key={attachment.mediaId || attachment.url || index}
							className="group border-border relative overflow-hidden rounded-md border"
						>
							{/* Plain <img>: these are backend-origin uploads, not Next-optimised assets. */}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={toAbsolute(attachment.url)}
								alt={attachment.name || `Attachment ${index + 1}`}
								className="h-24 w-full object-cover"
							/>
							<Button
								type="button"
								variant="destructive"
								size="icon-sm"
								className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
								title={t("removeAttachment")}
								onClick={() => onChange(value.filter((_, i) => i !== index))}
							>
								<X className="size-3.5" />
							</Button>
						</div>
					))}
				</div>
			) : null}
		</div>
	);
}
