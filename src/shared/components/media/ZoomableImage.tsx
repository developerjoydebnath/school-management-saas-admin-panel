"use client";

import {
	FlipHorizontal2,
	FlipVertical2,
	RefreshCcw,
	RotateCcw,
	RotateCw,
	ZoomIn,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import type { ZoomRef } from "yet-another-react-lightbox";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { cn } from "@/shared/lib/utils";
import { ProgressiveImage } from "./ProgressiveImage";

// ─── Transform helpers ────────────────────────────────────────────────────────

interface TransformState {
	rotation: number;
	flipX: boolean;
	flipY: boolean;
}

function buildTransform({ rotation, flipX, flipY }: TransformState) {
	const sx = flipX ? -1 : 1;
	const sy = flipY ? -1 : 1;
	// scale() for flip, after rotate so axes rotate with the image
	return `rotate(${rotation}deg) scale(${sx}, ${sy})`;
}

function getAbsoluteImageUrl(src: string) {
	if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
		return src;
	}
	if (src.startsWith("/") && !src.startsWith("/public/uploads/")) {
		return src;
	}
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
	const safeBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	const safeSrc = src.startsWith("/") ? src.slice(1) : src;
	return `${safeBase}/${safeSrc}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ZoomableImageProps {
	src: string;
	alt: string;
	placeholderBase64?: string;
	className?: string;
	imageClassName?: string;
	fill?: boolean;
	width?: number;
	height?: number;
}

export function ZoomableImage({
	src,
	alt,
	placeholderBase64,
	className,
	imageClassName,
	fill = true,
	width,
	height,
}: ZoomableImageProps) {
	const [open, setOpen] = useState(false);
	const [transform, setTransform] = useState<TransformState>({
		rotation: 0,
		flipX: false,
		flipY: false,
	});

	// YARL ZoomRef gives us external access to zoom state (changeZoom, etc.)
	// Typed inline to avoid extra import complexity with module augmentation
	const zoomRef = useRef<ZoomRef | null>(null);

	// Stable unique class scopes our injected CSS to this instance only
	// useId() is render-safe; strip colons so the value is valid as a CSS class name
	const uid = `zi-${useId().replace(/:/g, "")}`;

	const rotateLeft = () => setTransform((p) => ({ ...p, rotation: p.rotation - 90 }));
	const rotateRight = () => setTransform((p) => ({ ...p, rotation: p.rotation + 90 }));
	const flipXFn = () => setTransform((p) => ({ ...p, flipX: !p.flipX }));
	const flipYFn = () => setTransform((p) => ({ ...p, flipY: !p.flipY }));

	const handleReset = () => {
		// 1. Reset CSS rotation/flip state
		setTransform({ rotation: 0, flipX: false, flipY: false });
		// 2. Reset YARL's internal zoom level back to 1 via the official ZoomRef API
		//    rapid=true skips the zoom animation for an instant snap-back
		zoomRef.current?.changeZoom(1, true);
	};

	const handleClose = () => {
		setTransform({ rotation: 0, flipX: false, flipY: false });
		setOpen(false);
	};

	/** Matches YARL's native toolbar button style class */
	const btn = "yarl__button";

	return (
		<>
			{/* ── Thumbnail ─────────────────────────────────────────────────── */}
			<div
				className={cn(
					"group relative cursor-zoom-in overflow-hidden",
					className
				)}
				onClick={() => setOpen(true)}
			>
				<ProgressiveImage
					src={src}
					alt={alt}
					placeholderBase64={placeholderBase64}
					fill={fill}
					width={fill ? undefined : (width ?? 1200)}
					height={fill ? undefined : (height ?? 800)}
					className={imageClassName}
					wrapperClassName={fill ? undefined : "w-full h-auto"}
				/>
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
					<div className="bg-background/80 rounded-full p-2 opacity-0 transition-opacity group-hover:opacity-100">
						<ZoomIn className="text-foreground h-5 w-5" />
					</div>
				</div>
			</div>

			{/*
			 * ── Scoped CSS injection ───────────────────────────────────────────
			 *
			 * Problem: YARL's own CSS contains this rule (only at zoom=1):
			 *   .yarl__slide_wrapper:not(.yarl__slide_wrapper_interactive) .yarl__slide_image
			 *     { -webkit-transform: translateZ(0) }
			 * Its specificity is (0,3,0) which BEATS our (0,2,0) selector, silently
			 * overriding our rotate/flip transform at initial zoom level.
			 *
			 * Fix: `!important` on both prefixed and un-prefixed `transform`.
			 * YARL's zoom transform lives on .yarl__slide_wrapper (a PARENT div),
			 * so !important here only affects the <img> — zoom still works correctly.
			 */}
			{open && (
				<style>{`
					.${uid} .yarl__slide_image {
						-webkit-transform: ${buildTransform(transform)} !important;
						transform: ${buildTransform(transform)} !important;
						transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1) !important;
					}
				`}</style>
			)}

			{/* ── Lightbox ──────────────────────────────────────────────────── */}
			<Lightbox
				className={uid}
				open={open}
				close={handleClose}
				slides={[{ src: getAbsoluteImageUrl(src), alt }]}
				plugins={[Zoom]}
				zoom={{
					// ZoomRef gives us changeZoom(1) for the reset button
					ref: zoomRef,
					maxZoomPixelRatio: 8,
					scrollToZoom: true,
				}}
				carousel={{ finite: true }}
				toolbar={{
					buttons: [
						<button
							key="rotate-left"
							type="button"
							className={btn}
							title="Rotate Left"
							onClick={rotateLeft}
						>
							<RotateCcw className="h-[26px] w-[26px]" />
						</button>,
						<button
							key="rotate-right"
							type="button"
							className={btn}
							title="Rotate Right"
							onClick={rotateRight}
						>
							<RotateCw className="h-[26px] w-[26px]" />
						</button>,
						<button
							key="flip-x"
							type="button"
							className={btn}
							title="Flip Horizontal"
							onClick={flipXFn}
						>
							<FlipHorizontal2 className="h-[26px] w-[26px]" />
						</button>,
						<button
							key="flip-y"
							type="button"
							className={btn}
							title="Flip Vertical"
							onClick={flipYFn}
						>
							<FlipVertical2 className="h-[26px] w-[26px]" />
						</button>,
						<button
							key="reset"
							type="button"
							className={btn}
							title="Reset"
							onClick={handleReset}
						>
							<RefreshCcw className="h-[26px] w-[26px]" />
						</button>,
						"close",
					],
				}}
				render={{
					// No render.slide override — let the Zoom plugin own it so
					// zoom buttons stay fully enabled at all zoom levels.
					buttonPrev: () => null,
					buttonNext: () => null,
				}}
			/>
		</>
	);
}
