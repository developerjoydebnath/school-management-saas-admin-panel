"use client";

import { LeafletInstance, loadLeaflet } from "@/shared/lib/leaflet-loader";
import { RefObject, useEffect, useRef, useState } from "react";

type Options = {
	center: [number, number];
	zoom?: number;
	scrollWheelZoom?: boolean;
	/** Skip creating the map until the container is genuinely visible. */
	enabled?: boolean;
};

/**
 * Owns a Leaflet map's whole lifecycle: load -> create -> keep sized -> destroy.
 *
 * The ResizeObserver is the part neither existing school map has. These panels
 * live inside Tailwind `@container` layouts that resize without firing a window
 * `resize` event, so a container-query breakpoint change would otherwise leave
 * Leaflet rendering at its old size with grey tiles.
 */
export function useLeafletMap(
	containerRef: RefObject<HTMLDivElement | null>,
	options: Options
) {
	const [L, setL] = useState<LeafletInstance | null>(null);
	const [map, setMap] = useState<LeafletInstance | null>(null);
	const [error, setError] = useState<string | null>(null);
	const mapRef = useRef<LeafletInstance | null>(null);
	// Kept in a ref so changing zoom/center props never tears down the map,
	// and written from an effect (never during render) for React Compiler.
	const optionsRef = useRef(options);
	useEffect(() => {
		optionsRef.current = options;
	});

	const enabled = options.enabled !== false;

	useEffect(() => {
		if (!enabled) return;
		let disposed = false;

		loadLeaflet()
			.then((leaflet) => {
				if (disposed || !containerRef.current || mapRef.current) return;

				const opts = optionsRef.current;
				const instance = leaflet.map(containerRef.current, {
					center: opts.center,
					zoom: opts.zoom ?? 16,
					scrollWheelZoom: opts.scrollWheelZoom ?? true,
				});

				leaflet
					.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
						maxZoom: 19,
						attribution: "&copy; OpenStreetMap contributors",
					})
					.addTo(instance);

				mapRef.current = instance;
				setL(leaflet);
				setMap(instance);
				setTimeout(() => instance.invalidateSize(), 0);
			})
			.catch(() => {
				if (!disposed) setError("Map could not be loaded.");
			});

		return () => {
			disposed = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
			setMap(null);
		};
	}, [containerRef, enabled]);

	// Container-query layouts resize without a window resize event.
	useEffect(() => {
		const node = containerRef.current;
		if (!node || !map) return;
		const observer = new ResizeObserver(() => map.invalidateSize());
		observer.observe(node);
		return () => observer.disconnect();
	}, [containerRef, map]);

	return { L, map, error };
}
