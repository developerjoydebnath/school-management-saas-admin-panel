import { cn } from "@/shared/lib/utils";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ProgressiveImageProps extends Omit<ImageProps, "placeholder" | "blurDataURL"> {
	placeholderBase64?: string | null;
	fallback?: string;
	wrapperClassName?: string;
}

export function ProgressiveImage({
	src,
	alt,
	placeholderBase64,
	fallback = "/images/image-placeholder.jpg",
	className,
	wrapperClassName,
	...props
}: ProgressiveImageProps) {
	const [error, setError] = useState(false);
	const [isLoading, setLoading] = useState(true);

	// If there's an error or no src, show fallback without blur
	const baseSrc = error || !src ? fallback : src;

	// Determine final src
	const imageSrc = baseSrc;

	// Use blur only if we have a base64 string AND it's not the fallback image
	const useBlur = !!placeholderBase64 && baseSrc === src;

	return (
		<div
			className={cn(
				"overflow-hidden",
				props.fill ? "absolute inset-0 h-full w-full" : "relative h-max w-max",
				wrapperClassName
			)}
		>
			<Image
				src={imageSrc}
				alt={alt}
				placeholder={useBlur ? "blur" : "empty"}
				blurDataURL={useBlur && placeholderBase64 ? placeholderBase64 : undefined}
				onLoad={() => setLoading(false)}
				onError={() => {
					setError(true);
					setLoading(false);
				}}
				className={cn(
					"duration-700 ease-in-out",
					isLoading && useBlur
						? "scale-110 blur-2xl grayscale"
						: "blur-0 scale-100 grayscale-0",
					className
				)}
				{...props}
			/>
		</div>
	);
}
