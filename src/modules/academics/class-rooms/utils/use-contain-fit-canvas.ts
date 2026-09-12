"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MIN_HEIGHT = 360;
const DEFAULT_MAX_HEIGHT = 640;

/**
 * Contain-fits a room's true width:length ratio into the available wrapper
 * width and a height budget, using a single scalar px-per-unit `scale` for
 * both axes so the rendered box's proportions always exactly match
 * widthUnits:lengthUnits — CSS `aspect-ratio` combined with min/max-height
 * clamps can't guarantee that for extreme room shapes.
 *
 * Attach `wrapRef` to a wrapper element that is ALWAYS mounted (not
 * conditionally rendered) so ResizeObserver has something to observe from
 * first render — apply the returned `canvasPx` as explicit inline
 * width/height on the actual canvas element inside it.
 */
export function useContainFitCanvas({
	widthUnits,
	lengthUnits,
	minHeightPx = DEFAULT_MIN_HEIGHT,
	maxHeightPx = DEFAULT_MAX_HEIGHT,
}: {
	widthUnits: number;
	lengthUnits: number;
	minHeightPx?: number;
	maxHeightPx?: number;
}) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const [canvasPx, setCanvasPx] = useState({ w: 400, h: 300 });

	const recompute = useCallback(() => {
		if (!wrapRef.current || !widthUnits || !lengthUnits || widthUnits <= 0 || lengthUnits <= 0)
			return;
		const availableWidthPx = wrapRef.current.getBoundingClientRect().width;
		if (!availableWidthPx) return;

		const maxScaleByWidth = availableWidthPx / widthUnits;
		const maxScaleByHeight = maxHeightPx / lengthUnits;
		let scale = Math.min(maxScaleByWidth, maxScaleByHeight);

		const scaleForMinHeight = minHeightPx / lengthUnits;
		if (scale < scaleForMinHeight) {
			scale = Math.min(scaleForMinHeight, maxScaleByWidth);
		}

		setCanvasPx({ w: widthUnits * scale, h: lengthUnits * scale });
	}, [widthUnits, lengthUnits, minHeightPx, maxHeightPx]);

	useEffect(() => {
		recompute();
		const obs = new ResizeObserver(recompute);
		if (wrapRef.current) obs.observe(wrapRef.current);
		return () => obs.disconnect();
	}, [recompute]);

	return { wrapRef, canvasPx };
}
