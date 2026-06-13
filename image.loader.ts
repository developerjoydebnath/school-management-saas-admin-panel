interface CustomImageLoaderProps {
	src: string;
	width: number;
	quality?: number;
}

export default function CustomImageLoader({ src, width, quality = 75 }: CustomImageLoaderProps) {
	// 1. Absolute external URLs — return as-is
	if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
		const separator = src.includes("?") ? "&" : "?";
		return `${src}${separator}w=${width}&q=${quality}`;
	}

	// 2. Local Next.js public-folder assets (e.g. /images/..., /icons/..., /assets/...)
	//    Return the path as-is — Next.js optimizes these natively.
	if (src.startsWith("/")) {
		return src;
	}

	// 3. Backend-uploaded assets — prefix with the API base URL
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
	const safeBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	return `${safeBase}/${src}?w=${width}&q=${quality}`;
}

